import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  Mic
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useVoiceToText } from '../hooks/useVoiceToText';

export default function CreateJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    budget: '',
    startDate: '',
    endDate: '',
    description: '',
    milestones: [{ label: '', date: '' }]
  });

  const { listening, supported, start } = useVoiceToText({
    language: 'en-IN',
    onResult: (text) =>
      setFormData((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description} ${text}` : text,
      })),
  });

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { label: '', date: '' }]
    });
  };

  const removeMilestone = (index: number) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4 md:gap-6">
          <Link to="/jobs" className="p-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all shrink-0">
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </Link>
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">Create New Job</h2>
            <p className="text-on-surface-variant text-xs md:text-sm font-medium">Step {step} of 2: {step === 1 ? 'Project Details' : 'Milestones & Budget'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 w-12 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-outline/10'}`} 
            />
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Project Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="text" 
                      placeholder="e.g. Metro Line 3 Foundation"
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Client Name</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="text" 
                      placeholder="e.g. MMRDA"
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="text" 
                      placeholder="e.g. Bandra, Mumbai"
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-on-surface ml-1">Project Description</label>
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
                  <textarea 
                    placeholder="Describe the scope of work..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="date" 
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-on-surface ml-1">Expected End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input 
                      type="date" 
                      className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="organic-card space-y-6">
              <h3 className="text-xl font-bold">Budget Allocation</h3>
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Total Project Budget (₹)</label>
                <div className="relative">
                  <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    type="number" 
                    placeholder="e.g. 1250000"
                    className="w-full pl-12 pr-6 py-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none text-2xl font-bold"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="organic-card space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Project Milestones</h3>
                <button 
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.milestones.map((milestone, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 items-end bg-surface-container-high/30 p-4 rounded-2xl">
                    <div className="col-span-12 md:col-span-7 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant ml-1">Milestone Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Foundation Excavation"
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border-none text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-10 md:col-span-4 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant ml-1">Target Date</label>
                      <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-surface-container rounded-xl border-none text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
                      <button 
                        type="button"
                        onClick={() => removeMilestone(i)}
                        className="p-2 text-on-surface-variant hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-4 pt-4">
          {step === 2 && (
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-surface-container rounded-2xl font-bold text-on-surface hover:bg-surface-container-high transition-all"
            >
              Back to Details
            </button>
          )}
          <button type="submit" className="flex-[2] btn-primary py-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary/20">
            {step === 1 ? 'Next: Budget & Milestones' : 'Create Project'}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
