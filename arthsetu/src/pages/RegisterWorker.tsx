import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Briefcase, 
  IndianRupee, 
  FileText, 
  Camera,
  Plus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Mic
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useVoiceToText } from '../hooks/useVoiceToText';

export default function RegisterWorker() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: '',
    dailyWage: '',
    age: '',
    gender: 'male',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    documents: [] as string[]
  });

  const { listening, supported, start } = useVoiceToText({
    language: 'en-IN',
    onResult: (text) =>
      setFormData((prev) => ({
        ...prev,
        address: prev.address ? `${prev.address} ${text}` : text,
      })),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      navigate('/labor');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/labor" className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all shrink-0">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">Register New Worker</h2>
            <p className="text-on-surface-variant text-xs md:text-sm font-medium">Step {step} of 3: {
              step === 1 ? 'Personal Details' : 
              step === 2 ? 'Professional Info' : 
              'Documents & Verification'
            }</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 w-10 md:w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-outline/10'}`} 
            />
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="text" 
                      placeholder="e.g. Amit Sharma"
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="tel" 
                      placeholder="+91 98765 43210"
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Age</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 28"
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Gender</label>
                  <select className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-on-surface ml-1">Current Address</label>
                    {supported && (
                      <button
                        type="button"
                        onClick={start}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                          listening ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest',
                        )}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        {listening ? 'Listening...' : 'Voice'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-on-surface-variant" />
                    <textarea
                      placeholder="Enter full address..."
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Contact Person Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Suman Sharma"
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Emergency Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91 98765 43211"
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Work Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Primary Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <select className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none">
                      <option value="mason">Mason</option>
                      <option value="electrician">Electrician</option>
                      <option value="plumber">Plumber</option>
                      <option value="carpenter">Carpenter</option>
                      <option value="helper">Helper</option>
                      <option value="supervisor">Supervisor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Daily Wage (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="number" 
                      placeholder="e.g. 850"
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Years of Experience</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5"
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Joining Date</label>
                  <input 
                    type="date" 
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Skills & Specializations</h3>
              <div className="flex flex-wrap gap-3">
                {['Concrete', 'Tiling', 'Plastering', 'Brickwork', 'Painting'].map((skill) => (
                  <button 
                    key={skill}
                    type="button"
                    className="px-4 py-2 rounded-xl bg-surface-container text-sm font-medium hover:bg-primary hover:text-white transition-all"
                  >
                    {skill}
                  </button>
                ))}
                <button type="button" className="px-4 py-2 rounded-xl border-2 border-dashed border-outline/20 text-sm font-medium hover:border-primary hover:text-primary transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Skill
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">KYC Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Aadhar Card', icon: ShieldCheck },
                  { label: 'PAN Card', icon: FileText },
                  { label: 'Bank Passbook', icon: IndianRupee },
                  { label: 'Worker Photo', icon: Camera },
                ].map((doc, i) => (
                  <div key={i} className="p-6 border-2 border-dashed border-outline/20 rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="p-4 bg-surface-container rounded-2xl group-hover:bg-white transition-all">
                        <doc.icon className="w-8 h-8 text-on-surface-variant group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{doc.label}</p>
                        <p className="text-xs text-on-surface-variant">Upload PDF or Image (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="organic-card bg-surface-container-highest/30 border-2 border-primary/10">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-on-surface">Background Verification</p>
                  <p className="text-sm text-on-surface-variant">I hereby declare that the information provided is true to the best of my knowledge and I consent to a background check.</p>
                </div>
                <input type="checkbox" className="mt-1 w-5 h-5 rounded border-outline/30 text-primary focus:ring-primary" required />
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button 
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-4 bg-surface-container rounded-2xl font-bold text-on-surface hover:bg-surface-container-high transition-all"
            >
              Back
            </button>
          )}
          <button type="submit" className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20">
            {step < 3 ? 'Next Step' : 'Register Worker'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
