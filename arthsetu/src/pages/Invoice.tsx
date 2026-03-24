import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Download, Send, Eye,
  FileText, ZoomIn, Printer, UploadCloud, ImageIcon,
  ChevronDown, Loader2, X, AlertCircle,
} from 'lucide-react';
import React from "react";
import html2pdf from 'html2pdf.js';

// ── Firebase imports (adjust to your firebase config path) ───────
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ── Types ────────────────────────────────────────────────────────
interface Milestone {
  date: string;
  label: string;
}

interface FirestoreJob {
  id: string;
  budget: number;
  client: string;
  createdAt: string;
  description: string;
  endDate: string;
  location: string;
  milestones: Milestone[];
  ownerUid: string;
  spent: number;
  startDate: string;
  status: string;
  title: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

// ── Helpers ──────────────────────────────────────────────────────
const fmt = (n: number) =>
  `₹${Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-700',
    active:    'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    pending:   'bg-amber-100 text-amber-700',
  };
  return map[s] ?? 'bg-gray-100 text-gray-600';
};

/** Build default line items from a Firestore job */
const itemsFromJob = (job: FirestoreJob): LineItem[] => {
  const items: LineItem[] = [
    {
      id: 'budget-item',
      description: job.description || job.title,
      quantity: 1,
      rate: job.budget,
      amount: job.budget,
    },
  ];
  if (job.spent > 0) {
    items.push({
      id: 'advance-item',
      description: 'Advance / Amount Paid',
      quantity: 1,
      rate: -job.spent,
      amount: -job.spent,
    });
  }
  return items;
};

// ── Reusable field wrapper ───────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full px-3 py-2.5 bg-surface-container-high rounded-xl text-sm font-medium text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all';

// ── Section header ────────────────────────────────────────────────
const SectionHead = ({
  num, label, action,
}: { num: string; label: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
        {num}
      </span>
      <h4 className="font-bold text-on-surface">{label}</h4>
    </div>
    {action}
  </div>
);

// ════════════════════════════════════════════════════════════════
// ── Full-screen Preview Modal ────────────────────────────────────
// ════════════════════════════════════════════════════════════════
interface PreviewData {
  jobTitle: string; clientName: string; location: string;
  description: string; status: string; invoiceDate: string;
  startDate: string; endDate: string; budget: number; spent: number;
  milestones: Milestone[]; items: LineItem[]; gstNum: string;
  gstRate: number; sigImg: string | null; stampImg: string | null;
}

function PreviewModal({ open, onClose, data }: { open: boolean; onClose: () => void; data: PreviewData }) {
  const printRef = useRef<HTMLDivElement>(null);

  const subtotal = data.items.reduce((s, i) => s + i.amount, 0);
  const gstAmt   = subtotal * (data.gstRate / 100);
  const total    = subtotal + gstAmt;

  const handleExportPDF = () => {
    if (!printRef.current) return;

    const element = printRef.current;

    const opt = {
      margin: 0.5,
      filename: `Invoice-${data.jobTitle || 'ArthSetu'}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Invoice — ${data.jobTitle}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Segoe UI', sans-serif; padding: 48px; color: #1a1a1a; background: #fff; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
      .brand { font-size: 24px; font-weight: 900; color: #6366f1; }
      .inv-label { font-size: 36px; font-weight: 900; color: #e5e7eb; letter-spacing: 0.2em; text-transform: uppercase; }
      .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
      .label-small { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 4px; }
      .client-name { font-size: 18px; font-weight: 900; text-transform: capitalize; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 99px; font-size: 9px; font-weight: 700; text-transform: uppercase; background: #fef3c7; color: #b45309; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; border-bottom: 1px solid #e5e7eb; padding: 8px 4px; text-align: left; }
      th.right { text-align: right; }
      td { padding: 8px 4px; font-size: 13px; border-bottom: 1px solid #f9fafb; }
      td.right { text-align: right; }
      .totals { margin-left: auto; width: 240px; }
      .total-line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
      .grand-total { display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #e5e7eb; font-size: 16px; font-weight: 900; color: #6366f1; }
      .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
      .terms { font-size: 10px; color: #9ca3af; line-height: 1.6; }
      .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; }
      img { max-height: 60px; object-fit: contain; }
    </style></head><body>${content}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal shell */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h3 className="font-bold text-lg text-gray-900">Invoice Preview</h3>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-bold transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable A4 content */}
        <div className="overflow-y-auto flex-1 p-2 bg-gray-50">
          <div ref={printRef} className="bg-white rounded-2xl p-8 shadow-sm space-y-6 text-gray-800">

            {/* Header */}
            <div className="header flex justify-between items-start">
              <div>
                <p className="brand text-2xl font-black text-primary">ArthSetu</p>
                <p className="text-gray-400 text-sm leading-relaxed mt-1">
                  124, Craftscenter Complex<br />
                  Industrial Estate, Mumbai – 400001<br />
                  GSTIN: {data.gstNum || '27AAABCA1234F1Z1'}
                </p>
              </div>
              <div className="text-right">
                <p className="inv-label text-5xl font-black uppercase tracking-widest text-gray-200">INVOICE</p>
                <p className="font-bold text-gray-700 mt-1">
                  INV-{new Date().getFullYear()}-{String(Date.now()).slice(-4)}
                </p>
                <p className="text-gray-400 text-sm">Date: {fmtDate(data.invoiceDate)}</p>
              </div>
            </div>

            <hr className="divider border-gray-100" />

            {/* Bill to / Project */}
            <div className="section-grid grid grid-cols-2 gap-6">
              <div>
                <p className="label-small text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Bill To</p>
                <p className="client-name text-xl font-black capitalize">{data.clientName || '—'}</p>
                <p className="text-gray-400 text-sm capitalize mt-0.5">{data.location || '—'}</p>
              </div>
              <div>
                <p className="label-small text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Project</p>
                <p className="text-xl font-black capitalize">{data.jobTitle || '—'}</p>
                <p className="text-gray-400 text-sm mt-0.5">
                  {data.startDate && data.endDate
                    ? `${fmtDate(data.startDate)} → ${fmtDate(data.endDate)}`
                    : '—'}
                </p>
                <span className={`badge inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            </div>

            {/* Milestones */}
            {data.milestones?.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Milestones</p>
                <div className="space-y-1.5">
                  {data.milestones.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{m.label}</span>
                      <span className="text-gray-400">{fmtDate(m.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Line items */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</th>
                  <th className="text-center py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Qty</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Rate</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(item => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-800">{item.description || 'Item'}</td>
                    <td className="py-2.5 text-center text-gray-500">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-500">{fmt(item.rate)}</td>
                    <td className="py-2.5 text-right font-bold">{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals flex justify-end">
              <div className="w-64 space-y-2 text-sm">
                <div className="total-line flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-bold">{fmt(subtotal)}</span>
                </div>
                <div className="total-line flex justify-between">
                  <span className="text-gray-500">GST ({data.gstRate}%)</span>
                  <span className="font-bold">{fmt(gstAmt)}</span>
                </div>
                <div className="grand-total flex justify-between items-center pt-3 border-t-2 border-gray-200">
                  <span className="font-black text-primary">TOTAL DUE</span>
                  <span className="font-black text-primary text-2xl">{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Sig / stamp */}
            {(data.sigImg || data.stampImg) && (
              <div className="sig-row flex justify-between items-end pt-6 border-t border-gray-100">
                {data.sigImg && (
                  <div>
                    <img src={data.sigImg} className="h-14 object-contain" alt="signature" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Authorized Signatory</p>
                  </div>
                )}
                {data.stampImg && (
                  <img src={data.stampImg} className="h-16 object-contain opacity-80" alt="stamp" />
                )}
              </div>
            )}

            <hr className="divider border-gray-100" />

            {/* Terms */}
            <div>
              <p className="terms-label text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Terms & Conditions</p>
              <p className="terms text-xs text-gray-400 leading-relaxed">
                Payment is due within 7 days of invoice date. Late payments may be subject to a 2% monthly interest fee.
                All disputes are subject to Mumbai jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// ── Main Invoice Page ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════
export default function Invoice() {
  // ── Auth & Firestore state ───────────────────────────────────
  const [uid,         setUid]         = useState<string | null>(null);
  const [jobs,        setJobs]        = useState<FirestoreJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [fetchError,  setFetchError]  = useState<string | null>(null);

  // ── Selected job ─────────────────────────────────────────────
  const [selectedJobId, setSelectedJobId] = useState('');

  // ── Editable form fields (auto-filled from Firestore) ────────
  const [jobTitle,    setJobTitle]    = useState('');
  const [clientName,  setClientName]  = useState('');
  const [location,    setLocation]    = useState('');
  const [description, setDescription] = useState('');
  const [status,      setStatus]      = useState('pending');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [startDate,   setStartDate]   = useState('');
  const [endDate,     setEndDate]     = useState('');
  const [budget,      setBudget]      = useState(0);
  const [spent,       setSpent]       = useState(0);
  const [milestones,  setMilestones]  = useState<Milestone[]>([]);
  const [items,       setItems]       = useState<LineItem[]>([]);

  // ── Tax ──────────────────────────────────────────────────────
  const [gstNum,  setGstNum]  = useState('27AAAAA0000A1Z5');
  const [gstRate, setGstRate] = useState(18);

  // ── Auth images ──────────────────────────────────────────────
  const [sigImg,   setSigImg]   = useState<string | null>(null);
  const [stampImg, setStampImg] = useState<string | null>(null);
  const sigRef   = useRef<HTMLInputElement>(null);
  const stampRef = useRef<HTMLInputElement>(null);

  // ── Preview modal ────────────────────────────────────────────
  const [previewOpen, setPreviewOpen] = useState(false);

  // ── Calculations ─────────────────────────────────────────────
  const subtotal  = items.reduce((s, i) => s + i.amount, 0);
  const gstAmt    = subtotal * (gstRate / 100);
  const total     = subtotal + gstAmt;
  const remaining = budget - spent;

  // ── Step 1: watch auth ───────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUid(user?.uid ?? null));
    return unsub;
  }, []);

  // ── Step 2: fetch all jobs for this user ─────────────────────
  useEffect(() => {
    if (!uid) return;
    const load = async () => {
      setLoadingJobs(true);
      setFetchError(null);
      try {
        const q = query(
          collection(db, 'jobs'),
          where('ownerUid', '==', uid),
          orderBy('createdAt', 'desc'),
        );
        const snap = await getDocs(q);
        setJobs(snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<FirestoreJob, 'id'>) })));
      } catch (err: any) {
        setFetchError(err?.message ?? 'Could not load jobs from Firestore.');
      } finally {
        setLoadingJobs(false);
      }
    };
    load();
  }, [uid]);

  // ── Step 3: when user picks a job → auto-fill everything ─────
  const handleJobSelect = useCallback((jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) {
      setJobTitle(''); setClientName(''); setLocation('');
      setDescription(''); setStatus('pending');
      setInvoiceDate(''); setStartDate(''); setEndDate('');
      setBudget(0); setSpent(0); setMilestones([]); setItems([]);
      return;
    }
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    setJobTitle(job.title);
    setClientName(job.client);
    setLocation(job.location);
    setDescription(job.description);
    setStatus(job.status);
    setInvoiceDate(job.createdAt ? job.createdAt.split('T')[0] : '');
    setStartDate(job.startDate);
    setEndDate(job.endDate);
    setBudget(job.budget);
    setSpent(job.spent);
    setMilestones(job.milestones ?? []);
    setItems([]);
  }, [jobs]);

  // ── Line item helpers ─────────────────────────────────────────
  const addItem = () =>
    setItems(p => [...p, { id: Math.random().toString(36).slice(2), description: '', quantity: 1, rate: 0, amount: 0 }]);

  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id));

  const updateItem = (id: string, field: string, value: any) =>
    setItems(p => p.map(item => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: value };
      if (field === 'quantity' || field === 'rate') next.amount = next.quantity * next.rate;
      return next;
    }));

  // ── File helpers ─────────────────────────────────────────────
  const readFile = (f: File): Promise<string> =>
    new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target!.result as string); r.readAsDataURL(f); });

  const handleSig   = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setSigImg(await readFile(e.target.files[0])); };
  const handleStamp = async (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) setStampImg(await readFile(e.target.files[0])); };

  const hasJob = !!selectedJobId;

  const previewData: PreviewData = {
    jobTitle, clientName, location, description, status,
    invoiceDate, startDate, endDate, budget, spent,
    milestones, items, gstNum, gstRate, sigImg, stampImg,
  };

  return (
    <>
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} data={previewData} />

      <div className="space-y-8">

        {/* ── Page header ── */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Generate Invoice</h2>
            <p className="text-on-surface-variant text-base md:text-lg">
              Select a job — all fields fill automatically from Firestore in real time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => setPreviewOpen(true)}
              disabled={!hasJob}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed">
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              disabled={!hasJob}
              className="btn-primary flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-5 h-5" /> Send to Client
            </button>
          </div>
        </section>

        {/* ── Error banner ── */}
        {fetchError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* ── Job Selector (hero card) ── */}
        <div className="organic-card border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-black flex items-center justify-center shrink-0">★</span>
            <div>
              <h4 className="font-bold text-on-surface">Select Job from Firestore</h4>
              <p className="text-xs text-on-surface-variant">All fields will auto-populate when you choose a job</p>
            </div>
            {loadingJobs && <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />}
          </div>

          <div className="relative">
            <select
              value={selectedJobId}
              onChange={e => handleJobSelect(e.target.value)}
              disabled={loadingJobs}
              className={inputCls + ' appearance-none pr-10 cursor-pointer text-base font-semibold ' +
                (!selectedJobId ? 'text-on-surface-variant' : 'text-on-surface')}>
              <option value="">
                {loadingJobs ? 'Loading jobs…' : jobs.length === 0 ? 'No jobs found' : '— Choose a job title —'}
              </option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>
                  {job.title}  ·  {job.client}  ·  {fmt(job.budget)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
          </div>

          {/* Quick stats when job selected */}
          {hasJob && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { label: 'Budget',    value: fmt(budget) },
                { label: 'Spent',     value: fmt(spent) },
                { label: 'Remaining', value: fmt(remaining) },
              ].map(s => (
                <div key={s.label} className="bg-white/70 rounded-xl px-3 py-2 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">{s.label}</p>
                  <p className="font-black text-primary text-sm mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ══ LEFT FORM COLUMN ══ */}
          <section className="lg:col-span-2 space-y-6">

            {/* 1 — Job Details */}
            <div className={`organic-card transition-all duration-300 ${!hasJob ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <SectionHead num="1" label="Job Details" />
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Job Title">
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className={inputCls} placeholder="e.g. Home Renovation" />
                  </Field>
                  <Field label="Client Name">
                    <input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} placeholder="Client name" />
                  </Field>
                </div>
                <Field label="Location">
                  <input value={location} onChange={e => setLocation(e.target.value)} className={inputCls} placeholder="e.g. Vile Parle, Mumbai" />
                </Field>
                <Field label="Description">
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    rows={3} className={inputCls + ' resize-none'} placeholder="Job description…" />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Invoice Date">
                    <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Start Date">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="End Date">
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Total Budget (₹)">
                    <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Amount Spent (₹)">
                    <input type="number" value={spent} onChange={e => setSpent(Number(e.target.value))} className={inputCls} />
                  </Field>
                  <Field label="Status">
                    <select value={status} onChange={e => setStatus(e.target.value)}
                      className={inputCls + ' appearance-none cursor-pointer'}>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>

            {/* 2 — Milestones (auto-populated, read-only) */}
            {hasJob && milestones.length > 0 && (
              <div className="organic-card">
                <SectionHead num="2" label="Milestones" />
                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div key={idx}
                      className="flex items-center justify-between bg-surface-container-high/40 rounded-xl px-4 py-2.5 text-sm">
                      <span className="font-medium text-on-surface">{m.label}</span>
                      <span className="text-on-surface-variant text-xs">{fmtDate(m.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3 — Line Items */}
            <div className={`organic-card transition-all duration-300 ${!hasJob ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <SectionHead num="3" label="Line Items"
                action={
                  <button onClick={addItem}
                    className="flex items-center gap-1 text-primary text-sm font-bold hover:underline">
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                }
              />
              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                {['Description', 'Amount'].map((h, i) => (
                  <p key={h} className={`text-[10px] font-bold uppercase tracking-widest text-on-surface-variant ${i === 0 ? 'col-span-8' : 'col-span-4 text-right'}`}>{h}</p>
                ))}
              </div>
              <div className="space-y-3">
                {items.length === 0 && (
                  <p className="text-sm text-center text-on-surface-variant py-8 opacity-60">
                    Select a job above to load line items
                  </p>
                )}
                {items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-surface-container-high/30 rounded-2xl p-3">
                    <div className="col-span-12 sm:col-span-5">
                      <input value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description" className={inputCls + ' text-xs'} />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className={inputCls + ' text-xs text-center'} />
                    </div>
                    <div className="col-span-4 sm:col-span-2">
                      <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))}
                        className={inputCls + ' text-xs text-right'} />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button onClick={() => removeItem(item.id)}
                        className="p-1.5 text-on-surface-variant hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <p className="text-sm font-bold text-on-surface">{fmt(item.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 — Tax */}
            <div className={`organic-card transition-all duration-300 ${!hasJob ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <SectionHead num="4" label="Tax Configuration" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="GST Number">
                  <input value={gstNum} onChange={e => setGstNum(e.target.value)} className={inputCls} placeholder="27AAAAA0000A1Z5" />
                </Field>
                <Field label="GST Rate (%)">
                  <select value={gstRate} onChange={e => setGstRate(Number(e.target.value))}
                    className={inputCls + ' appearance-none cursor-pointer'}>
                    <option value={5}>5% (Essential)</option>
                    <option value={12}>12% (Standard)</option>
                    <option value={18}>18% (Standard)</option>
                    <option value={28}>28% (Luxury)</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* 5 — Authorization */}
            <div className={`organic-card transition-all duration-300 ${!hasJob ? 'opacity-40 pointer-events-none select-none' : ''}`}>
              <SectionHead num="5" label="Authorization" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Digital Signature</p>
                  <input ref={sigRef} type="file" accept="image/*" className="hidden" onChange={handleSig} />
                  <button onClick={() => sigRef.current?.click()}
                    className="w-full h-28 rounded-2xl border-2 border-dashed border-outline/30 hover:border-primary/50 bg-surface-container-high/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-primary overflow-hidden">
                    {sigImg
                      ? <img src={sigImg} className="w-full h-full object-contain p-2" alt="signature" />
                      : <><UploadCloud className="w-6 h-6" /><span className="text-xs font-medium">Upload Signature</span></>}
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Company Stamp</p>
                  <input ref={stampRef} type="file" accept="image/*" className="hidden" onChange={handleStamp} />
                  <button onClick={() => stampRef.current?.click()}
                    className="w-full h-28 rounded-2xl border-2 border-dashed border-outline/30 hover:border-primary/50 bg-surface-container-high/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-primary overflow-hidden">
                    {stampImg
                      ? <img src={stampImg} className="w-full h-full object-contain p-2" alt="stamp" />
                      : <><ImageIcon className="w-6 h-6" /><span className="text-xs font-medium">Upload Stamp</span></>}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ══ RIGHT COLUMN ══ */}
          <section className="lg:col-span-1 space-y-6">

            {/* Summary */}
            <div className="organic-card bg-primary text-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Summary</h3>
                <FileText className="w-6 h-6 opacity-50" />
              </div>

              {hasJob && budget > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Budget Used</span>
                    <span>{Math.round((spent / budget) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((spent / budget) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/50 mt-0.5">
                    <span>Spent: {fmt(spent)}</span>
                    <span>Remaining: {fmt(remaining)}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span className="font-bold">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">GST ({gstRate}%)</span>
                  <span className="font-bold">{fmt(gstAmt)}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Total Due</span>
                  <span className="text-3xl font-bold">{fmt(total)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setPreviewOpen(true)}
                  disabled={!hasJob}
                  className="w-full py-3.5 bg-white text-primary rounded-2xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Eye className="w-4 h-4" /> Preview Invoice
                </button>
                <button
                  disabled={!hasJob}
                  className="w-full py-3.5 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
            </div>

            {/* Mini live preview */}
            <div className="organic-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Live Preview</h3>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewOpen(true)} disabled={!hasJob}
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all disabled:opacity-40">
                    <ZoomIn className="w-4 h-4 text-on-surface-variant" />
                  </button>
                  <button disabled={!hasJob}
                    className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-all disabled:opacity-40">
                    <Printer className="w-4 h-4 text-on-surface-variant" />
                  </button>
                </div>
              </div>

              {!hasJob ? (
                <div className="flex flex-col items-center justify-center h-52 text-center text-on-surface-variant gap-3">
                  <FileText className="w-12 h-12 opacity-10" />
                  <p className="text-sm font-medium opacity-60">Select a job to see<br />the live preview</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5 text-[9px] space-y-3 overflow-hidden">
                  {/* Mini header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-primary text-sm">ArthSetu</p>
                      <p className="text-on-surface-variant">GSTIN: {gstNum}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[12px] uppercase tracking-widest text-on-surface/15">INVOICE</p>
                      <p className="text-on-surface-variant">{fmtDate(invoiceDate)}</p>
                    </div>
                  </div>

                  {/* Bill to / project */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline/10">
                    <div>
                      <p className="font-bold text-[7px] uppercase tracking-widest text-on-surface-variant mb-0.5">Bill To</p>
                      <p className="font-black text-[10px] capitalize text-on-surface">{clientName || '—'}</p>
                      <p className="text-on-surface-variant capitalize">{location || '—'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[7px] uppercase tracking-widest text-on-surface-variant mb-0.5">Project</p>
                      <p className="font-black text-[10px] capitalize text-on-surface">{jobTitle || '—'}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase ${statusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  {/* Line items mini */}
                  <div className="space-y-0.5 pt-2 border-t border-outline/10">
                    {items.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-on-surface truncate max-w-[60%]">{item.description || 'Item'}</span>
                        <span className="font-bold text-on-surface">{fmt(item.amount)}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-on-surface-variant opacity-60">+{items.length - 3} more items…</p>
                    )}
                  </div>

                  {/* Totals mini */}
                  <div className="pt-2 border-t border-outline/10 text-right space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">GST ({gstRate}%)</span>
                      <span className="font-bold">{fmt(gstAmt)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-outline/10">
                      <span className="font-black text-primary text-[10px]">TOTAL DUE</span>
                      <span className="font-black text-primary text-[11px]">{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Tap to expand hint */}
                  <button onClick={() => setPreviewOpen(true)}
                    className="w-full mt-1 py-2 rounded-xl bg-primary/5 text-primary text-[9px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all">
                    Tap to expand full preview ↗
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}