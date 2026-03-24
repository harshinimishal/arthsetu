import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { createDocument, subscribeToDocuments } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { resolveBusinessCollections } from '../services/businessService';

interface WorkOption {
  id: string;
  title: string;
}

interface WorkforceSkill {
  id: string;
  label: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptySkill(): WorkforceSkill {
  return { id: uid(), label: '' };
}

export default function RegisterWorker() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
  const { team, work } = resolveBusinessCollections(businessType);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [workOptions, setWorkOptions] = useState<WorkOption[]>([]);

  const [form, setForm] = useState({
    fullName: '',
    photoUrl: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    emergencyName: '',
    emergencyPhone: '',
    role: '',
    department: '',
    employmentType: 'Full-time',
    joiningDate: '',
    shiftSchedule: '',
    assignedWorkIds: [] as string[],
    wageType: 'Daily',
    wageAmount: '',
    paymentFrequency: 'Weekly',
    bankAccountOrUpi: '',
    paymentMethod: 'Bank Transfer',
    notes: '',
    accepted: false,
  });

  const [skills, setSkills] = useState<WorkforceSkill[]>([emptySkill()]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = subscribeToDocuments<WorkOption>(
      work,
      [where('ownerUid', '==', user.uid)],
      (rows) => setWorkOptions(rows),
    );

    return unsubscribe;
  }, [user?.uid, work]);

  const selectedWorkLabels = useMemo(() => {
    const idSet = new Set(form.assignedWorkIds);
    return workOptions.filter((item) => idSet.has(item.id)).map((item) => item.title);
  }, [form.assignedWorkIds, workOptions]);

  const update = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const addSkill = () => setSkills((prev) => [...prev, emptySkill()]);

  const removeSkill = (id: string) => {
    setSkills((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const toggleAssignment = (id: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      assignedWorkIds: checked
        ? [...prev.assignedWorkIds, id]
        : prev.assignedWorkIds.filter((workId) => workId !== id),
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (step < 4) {
      setStep((prev) => prev + 1);
      return;
    }

    if (!form.accepted) {
      setError('Please confirm declaration before registration.');
      return;
    }

    if (!form.fullName.trim() || !form.phone.trim() || !form.role.trim() || !form.joiningDate || !form.wageAmount) {
      setError('Please fill all required fields.');
      return;
    }

    setSaving(true);

    try {
      const skillList = skills.map((item) => item.label.trim()).filter(Boolean);

      const workforceId = await createDocument(team, {
        name: form.fullName,
        photoUrl: form.photoUrl || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,

        phone: form.phone,
        email: form.email || null,
        emergencyContact: form.emergencyName || null,
        emergencyPhone: form.emergencyPhone || null,

        role: form.role,
        skills: skillList,
        department: form.department || null,
        employmentType: form.employmentType,
        joiningDate: form.joiningDate,
        shiftSchedule: form.shiftSchedule || null,

        assignedWorkIds: form.assignedWorkIds,

        wageType: form.wageType,
        wageAmount: Number(form.wageAmount || 0),
        paymentFrequency: form.paymentFrequency,
        bankAccountOrUpi: form.bankAccountOrUpi || null,
        paymentMethod: form.paymentMethod,

        status: 'active',
        attendance: 0,
        notes: form.notes || null,
      });

      if (workforceId && form.assignedWorkIds.length > 0) {
        const assignedLabels = selectedWorkLabels;

        await Promise.all(
          form.assignedWorkIds.map((workId, idx) =>
            createDocument('project_assignments', {
              projectId: workId,
              assigneeId: workforceId,
              assigneeName: form.fullName,
              role: form.role,
              source: 'workforce-registration',
              projectTitle: assignedLabels[idx] || null,
            }),
          ),
        );
      }

      await createDocument('payment_profiles', {
        workforceId,
        workforceName: form.fullName,
        wageType: form.wageType,
        wageAmount: Number(form.wageAmount || 0),
        paymentFrequency: form.paymentFrequency,
        bankAccountOrUpi: form.bankAccountOrUpi || null,
        paymentMethod: form.paymentMethod,
      });

      setSuccess('Workforce member registered successfully.');
      setTimeout(() => navigate('/labor'), 700);
    } catch (submitError) {
      console.error(submitError);
      setError('Failed to register workforce member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/labor" className="p-3 rounded-xl bg-surface-container">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Register New Workforce Member</h2>
          <p className="text-sm text-on-surface-variant">
            Captures profile, contact, role, assignment, and payroll data in Firestore.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <div className="flex gap-2">
        {[1, 2, 3, 4].map((marker) => (
          <div key={marker} className={`h-1.5 flex-1 rounded-full ${marker <= step ? 'bg-primary' : 'bg-outline/20'}`} />
        ))}
      </div>

      <form onSubmit={submit} className="space-y-6">
        {step === 1 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organic-card space-y-4">
            <h3 className="font-bold text-lg">1) Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={form.fullName}
                onChange={(e) => update({ fullName: e.target.value })}
                placeholder="Full Name *"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={form.photoUrl}
                onChange={(e) => update({ photoUrl: e.target.value })}
                placeholder="Photo / Profile Picture URL (optional)"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update({ dateOfBirth: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <select
                value={form.gender}
                onChange={(e) => update({ gender: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              >
                <option value="">Gender (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organic-card space-y-4">
            <h3 className="font-bold text-lg">2) Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
                placeholder="Phone Number *"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
                placeholder="Email (optional)"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={form.emergencyName}
                onChange={(e) => update({ emergencyName: e.target.value })}
                placeholder="Emergency Contact Name"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={form.emergencyPhone}
                onChange={(e) => update({ emergencyPhone: e.target.value })}
                placeholder="Emergency Contact Phone"
                className="p-3 rounded-xl bg-surface-container-high"
              />
            </div>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organic-card space-y-4">
            <h3 className="font-bold text-lg">3) Role & Work Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                required
                value={form.role}
                onChange={(e) => update({ role: e.target.value })}
                placeholder="Designation / Role *"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={form.department}
                onChange={(e) => update({ department: e.target.value })}
                placeholder="Department / Team"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <select
                value={form.employmentType}
                onChange={(e) => update({ employmentType: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
              <input
                required
                type="date"
                value={form.joiningDate}
                onChange={(e) => update({ joiningDate: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={form.shiftSchedule}
                onChange={(e) => update({ shiftSchedule: e.target.value })}
                placeholder="Shift / Work Schedule"
                className="p-3 rounded-xl bg-surface-container-high"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Skill Set / Specialization</label>
                <button type="button" onClick={addSkill} className="text-primary text-sm font-semibold">
                  <Plus className="w-4 h-4 inline mr-1" />Add Skill
                </button>
              </div>
              {skills.map((skill) => (
                <div key={skill.id} className="grid grid-cols-12 gap-2">
                  <input
                    value={skill.label}
                    onChange={(e) =>
                      setSkills((prev) => prev.map((item) => (item.id === skill.id ? { ...item, label: e.target.value } : item)))
                    }
                    placeholder="Skill / specialization"
                    className="col-span-11 p-3 rounded-xl bg-surface-container-high"
                  />
                  <button type="button" onClick={() => removeSkill(skill.id)} className="col-span-1 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Assigned Jobs / Projects (optional)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {workOptions.map((item) => (
                  <label key={item.id} className="p-2 rounded-lg bg-surface-container-high inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.assignedWorkIds.includes(item.id)}
                      onChange={(e) => toggleAssignment(item.id, e.target.checked)}
                    />
                    {item.title}
                  </label>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {step === 4 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organic-card space-y-4">
            <h3 className="font-bold text-lg">4) Payroll & Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={form.wageType}
                onChange={(e) => update({ wageType: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              >
                <option>Daily</option>
                <option>Hourly</option>
              </select>
              <input
                required
                type="number"
                min={0}
                value={form.wageAmount}
                onChange={(e) => update({ wageAmount: e.target.value })}
                placeholder="Daily / Hourly Wage *"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <select
                value={form.paymentFrequency}
                onChange={(e) => update({ paymentFrequency: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <select
                value={form.paymentMethod}
                onChange={(e) => update({ paymentMethod: e.target.value })}
                className="p-3 rounded-xl bg-surface-container-high"
              >
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>UPI</option>
              </select>
              <input
                value={form.bankAccountOrUpi}
                onChange={(e) => update({ bankAccountOrUpi: e.target.value })}
                placeholder="Bank Account Details / UPI"
                className="p-3 rounded-xl bg-surface-container-high md:col-span-2"
              />
            </div>

            <textarea
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Additional internal notes"
              className="w-full p-3 rounded-xl bg-surface-container-high min-h-20"
            />

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.accepted}
                onChange={(e) => update({ accepted: e.target.checked })}
              />
              I confirm workforce details are accurate and permitted for payroll processing.
            </label>
          </motion.section>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={() => setStep((prev) => prev - 1)} className="px-4 py-3 rounded-xl bg-surface-container">
              Back
            </button>
          )}
          <button disabled={saving} className="btn-primary px-6 py-3 rounded-xl">
            {step < 4 ? 'Next' : saving ? 'Saving...' : 'Register'} <ChevronRight className="w-4 h-4 inline" />
          </button>
        </div>
      </form>
    </div>
  );
}
