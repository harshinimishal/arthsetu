import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createDocument, subscribeToDocuments } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';
import { where } from 'firebase/firestore';

interface WorkItem {
  id: string;
  title: string;
  client: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function Invoice() {
  const { user, profile } = useAuth();
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [client, setClient] = useState('');
  const [workId, setWorkId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<LineItem[]>([{ id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }]);

  useEffect(() => {
    if (!user?.uid) return undefined;
    const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
    const { work } = resolveBusinessCollections(businessType);
    return subscribeToDocuments<WorkItem>(work, [where('ownerUid', '==', user.uid)], (data) => {
      setWorkItems(data);
      if (!workId && data[0]) {
        setWorkId(data[0].id);
        setClient(data[0].client || '');
      }
    });
  }, [profile?.businessType, user?.uid, workId]);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.quantity * i.rate, 0), [items]);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const saveInvoice = async () => {
    if (!user?.uid || !workId) return;
    setSaving(true);
    try {
      await createDocument('invoices', {
        workId,
        client,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        tax,
        total,
        status: 'draft',
      });

      await createDocument('transactions', {
        type: 'credit',
        amount: total,
        category: 'Invoice',
        jobId: workId,
        job: workItems.find((w) => w.id === workId)?.title || 'Work item',
        recipient: client,
        date: invoiceDate,
        status: 'pending',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Invoice</h2>
        <button onClick={saveInvoice} disabled={saving} className="btn-primary px-5 py-3 rounded-xl">{saving ? 'Saving...' : 'Save Invoice'}</button>
      </div>

      <div className="organic-card grid grid-cols-1 md:grid-cols-2 gap-3">
        <select value={workId} onChange={(e) => {
          setWorkId(e.target.value);
          const selected = workItems.find((w) => w.id === e.target.value);
          setClient(selected?.client || '');
        }} className="p-3 rounded-xl bg-surface-container-high">
          {workItems.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
        </select>
        <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client" className="p-3 rounded-xl bg-surface-container-high" />
        <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="p-3 rounded-xl bg-surface-container-high" />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-3 rounded-xl bg-surface-container-high" />
      </div>

      <div className="organic-card space-y-2">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 gap-2">
            <input value={it.description} onChange={(e) => setItems((prev) => prev.map((x) => x.id === it.id ? { ...x, description: e.target.value } : x))} placeholder="Description" className="col-span-6 p-3 rounded-xl bg-surface-container-high" />
            <input type="number" value={it.quantity} onChange={(e) => setItems((prev) => prev.map((x) => x.id === it.id ? { ...x, quantity: Number(e.target.value || 0) } : x))} className="col-span-2 p-3 rounded-xl bg-surface-container-high" />
            <input type="number" value={it.rate} onChange={(e) => setItems((prev) => prev.map((x) => x.id === it.id ? { ...x, rate: Number(e.target.value || 0) } : x))} className="col-span-2 p-3 rounded-xl bg-surface-container-high" />
            <div className="col-span-2 p-3 text-right">INR {(it.quantity * it.rate).toLocaleString('en-IN')}</div>
          </div>
        ))}
        <button onClick={() => setItems((prev) => [...prev, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0 }])} className="text-primary text-sm">+ Add line item</button>
      </div>

      <div className="organic-card">
        <p>Subtotal: INR {subtotal.toLocaleString('en-IN')}</p>
        <p>GST (18%): INR {tax.toLocaleString('en-IN')}</p>
        <p className="text-xl font-bold">Total: INR {total.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}
