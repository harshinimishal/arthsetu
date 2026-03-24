import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { createDocument } from '../services/firestoreService';
import { useAuth } from '../contexts/AuthContext';
import { resolveBusinessCollections } from '../services/businessService';

const storage = getStorage();

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

function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export default function RegisterWorker() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
  const { team } = resolveBusinessCollections(businessType);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [skills, setSkills] = useState<WorkforceSkill[]>([emptySkill()]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [form, setForm] = useState({
    fullName: '',
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
    wageType: 'Daily',
    wageAmount: '',
    paymentFrequency: 'Weekly',
    bankAccountOrUpi: '',
    paymentMethod: 'Bank Transfer',
    notes: '',
  });

  const update = (patch: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const addSkill = () => setSkills((prev) => [...prev, emptySkill()]);

  const removeSkill = (id: string) => {
    setSkills((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const handlePhotoSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedPhoto(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const uploadProfilePhoto = async (): Promise<string | null> => {
    if (!selectedPhoto || !user?.uid) return null;

    const ext = selectedPhoto.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `workforce-profiles/${user.uid}/${Date.now()}-${uid()}.${ext}`);
    await uploadBytes(storageRef, selectedPhoto);
    return getDownloadURL(storageRef);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.fullName.trim() || !form.phone.trim() || !form.role.trim() || !form.joiningDate || !form.wageAmount) {
      setError('Please fill all required fields.');
      return;
    }

    if (form.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    setSaving(true);

    try {
      const skillList = skills.map((item) => item.label.trim()).filter(Boolean);
      const photoUrl = await uploadProfilePhoto();

      const workforceId = await createDocument(team, {
        name: form.fullName,
        photoUrl: photoUrl || null,
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

        wageType: form.wageType,
        wageAmount: Number(form.wageAmount || 0),
        paymentFrequency: form.paymentFrequency,
        bankAccountOrUpi: form.bankAccountOrUpi || null,
        paymentMethod: form.paymentMethod,

        status: 'active',
        attendance: 0,
        notes: form.notes || null,
      });

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
            One-page registration with profile image upload, workforce record, and payroll setup.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <form onSubmit={submit} className="organic-card space-y-6">
        <section className="space-y-4">
          <h3 className="font-bold text-lg">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              value={form.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              placeholder="Full Name *"
              className="p-3 rounded-xl bg-surface-container-high"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="p-3 rounded-xl bg-surface-container-high"
            />

            {photoPreview && (
              <div className="md:col-span-2">
                <img src={photoPreview} alt="Selected profile" className="w-28 h-28 rounded-xl object-cover border border-outline/20" />
              </div>
            )}

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
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-lg">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              required
              value={form.phone}
              onChange={(e) => update({ phone: sanitizePhone(e.target.value) })}
              placeholder="Phone Number (10 digits) *"
              className="p-3 rounded-xl bg-surface-container-high"
            />

            <input
              type="email"
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
              onChange={(e) => update({ emergencyPhone: sanitizePhone(e.target.value) })}
              placeholder="Emergency Contact Phone"
              className="p-3 rounded-xl bg-surface-container-high"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-lg">Role & Employment</h3>
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
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Skills</label>
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
        </section>

        <section className="space-y-4">
          <h3 className="font-bold text-lg">Payroll & Compensation</h3>
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
              placeholder="Bank Account / UPI"
              className="p-3 rounded-xl bg-surface-container-high md:col-span-2"
            />

            <textarea
              value={form.notes}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Additional notes"
              className="p-3 rounded-xl bg-surface-container-high min-h-20 md:col-span-2"
            />
          </div>
        </section>

        <div className="flex justify-end">
          <button disabled={saving} className="btn-primary px-6 py-3 rounded-xl">
            {saving ? 'Saving...' : 'Register Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
