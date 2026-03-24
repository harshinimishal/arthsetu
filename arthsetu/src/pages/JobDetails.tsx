import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { createDocument, getDocument, removeDocument, subscribeToDocuments, updateDocument } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';

const storage = getStorage();

interface WorkItem {
  id: string;
  title: string;
  client?: string;
  location?: string;
  status?: 'planned' | 'active' | 'pending' | 'completed';
  budget?: number;
  spent?: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  model?: 'service' | 'contract';
  mode?: 'product' | 'service';
}

interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

interface WorkTask {
  id: string;
  workId: string;
  name: string;
  assignedWorkerId?: string | null;
  assignedWorkerName?: string | null;
  status: 'todo' | 'in-progress' | 'done';
  completedOn?: string | null;
}

interface WorkTransaction {
  id: string;
  workId: string;
  type: 'income' | 'expense';
  amount: number;
  date?: string | null;
  mode?: string | null;
  description?: string | null;
  category?: string | null;
}

interface MaterialItem {
  id: string;
  workId: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  billNumber?: string | null;
  billDate?: string | null;
  billUrl?: string | null;
  billFileName?: string | null;
}

interface TravelExpense {
  id: string;
  workId: string;
  description: string;
  cost: number;
  date?: string | null;
}

type TabKey = 'overview' | 'tasks' | 'transactions' | 'materials' | 'expenses';

const tabItems: Array<{ key: TabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'materials', label: 'Materials' },
  { key: 'expenses', label: 'Expenses' },
];

export default function JobDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();

  const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
  const isServiceBusiness = businessType === 'service';
  const { work, team } = resolveBusinessCollections(businessType);

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [item, setItem] = useState<WorkItem | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [transactions, setTransactions] = useState<WorkTransaction[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [expenses, setExpenses] = useState<TravelExpense[]>([]);

  const [overview, setOverview] = useState({
    title: '',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'planned' as NonNullable<WorkItem['status']>,
    notes: '',
    mode: (isServiceBusiness ? 'service' : 'product') as 'product' | 'service',
  });

  const [taskForm, setTaskForm] = useState({ name: '', assignedWorkerId: '', status: 'todo' as WorkTask['status'] });
  const [txnForm, setTxnForm] = useState({
    type: 'income' as WorkTransaction['type'],
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    mode: isServiceBusiness ? 'Service Charge' : 'Cash',
    description: '',
    category: isServiceBusiness ? 'service-charge' : 'product-sale',
  });
  const [materialForm, setMaterialForm] = useState({
    name: '',
    quantity: 1,
    unitCost: 0,
    billNumber: '',
    billDate: '',
  });
  const [expenseForm, setExpenseForm] = useState({ description: '', cost: 0, date: new Date().toISOString().slice(0, 10) });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  const [billFile, setBillFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || !user?.uid) return;
      const data = await getDocument<WorkItem>(work, id);
      if (!data) return;
      setItem(data);
      setOverview({
        title: data.title || '',
        client: data.client || '',
        location: data.location || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: data.status || 'planned',
        notes: data.notes || '',
        mode: data.mode || (data.model === 'service' || isServiceBusiness ? 'service' : 'product'),
      });
    };
    load();
  }, [id, user?.uid, work, isServiceBusiness]);

  useEffect(() => {
    if (!id || !user?.uid) return undefined;

    const unsubTeam = subscribeToDocuments<TeamMember>(team, [where('ownerUid', '==', user.uid)], setTeamMembers);
    const unsubTasks = subscribeToDocuments<WorkTask>('work_tasks', [where('ownerUid', '==', user.uid)], (rows) => {
      setTasks(rows.filter((x) => x.workId === id));
    });
    const unsubTx = subscribeToDocuments<WorkTransaction>('work_transactions', [where('ownerUid', '==', user.uid)], (rows) => {
      setTransactions(rows.filter((x) => x.workId === id));
    });
    const unsubMaterials = subscribeToDocuments<MaterialItem>('material_bills', [where('ownerUid', '==', user.uid)], (rows) => {
      setMaterials(rows.filter((x) => x.workId === id));
    });
    const unsubExpenses = subscribeToDocuments<TravelExpense>('travel_expenses', [where('ownerUid', '==', user.uid)], (rows) => {
      setExpenses(rows.filter((x) => x.workId === id));
    });

    return () => {
      unsubTeam();
      unsubTasks();
      unsubTx();
      unsubMaterials();
      unsubExpenses();
    };
  }, [id, user?.uid, team]);

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions],
  );
  const txnExpenses = useMemo(
    () => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions],
  );
  const materialTotal = useMemo(() => materials.reduce((sum, m) => sum + Number(m.totalCost || 0), 0), [materials]);
  const travelTotal = useMemo(() => expenses.reduce((sum, e) => sum + Number(e.cost || 0), 0), [expenses]);
  const totalExpenses = txnExpenses + materialTotal + travelTotal;
  const profit = totalIncome - totalExpenses;

  useEffect(() => {
    if (!id || !item) return;
    updateDocument(work, id, { spent: totalExpenses });
  }, [id, item, totalExpenses, work]);

  if (!id) return <div className="organic-card">Invalid item ID.</div>;
  if (!item) return <div className="organic-card">Loading...</div>;

  const saveOverview = async () => {
    setError('');
    if (!overview.title.trim()) {
      setError('Name is required.');
      return;
    }

    setSaving(true);
    try {
      await updateDocument(work, id, {
        title: overview.title.trim(),
        client: overview.client.trim() || null,
        location: overview.location.trim() || null,
        startDate: overview.startDate || null,
        endDate: overview.endDate || null,
        status: overview.status,
        notes: overview.notes.trim() || null,
        mode: overview.mode,
        model: overview.mode === 'service' ? 'service' : 'contract',
      });
      setItem((prev) => prev ? { ...prev, ...overview, model: overview.mode === 'service' ? 'service' : 'contract' } : prev);
    } catch (saveErr) {
      console.error(saveErr);
      setError('Failed to update details.');
    } finally {
      setSaving(false);
    }
  };

  const saveTask = async () => {
    if (!taskForm.name.trim()) {
      setError('Task name is required.');
      return;
    }
    setError('');

    const assignee = teamMembers.find((m) => m.id === taskForm.assignedWorkerId);
    const payload = {
      workId: id,
      name: taskForm.name.trim(),
      assignedWorkerId: taskForm.assignedWorkerId || null,
      assignedWorkerName: assignee?.name || null,
      status: taskForm.status,
      completedOn: taskForm.status === 'done' ? new Date().toISOString().slice(0, 10) : null,
      businessType,
    };

    if (editingTaskId) {
      await updateDocument('work_tasks', editingTaskId, payload);
    } else {
      await createDocument('work_tasks', payload);
    }

    setTaskForm({ name: '', assignedWorkerId: '', status: 'todo' });
    setEditingTaskId(null);
  };

  const saveTransaction = async () => {
    if (Number(txnForm.amount || 0) <= 0) {
      setError('Transaction amount must be greater than 0.');
      return;
    }
    setError('');

    const payload = {
      workId: id,
      type: txnForm.type,
      amount: Number(txnForm.amount || 0),
      date: txnForm.date || null,
      mode: txnForm.mode.trim() || null,
      description: txnForm.description.trim() || null,
      category: txnForm.category.trim() || null,
      businessType,
    };

    if (editingTxnId) {
      await updateDocument('work_transactions', editingTxnId, payload);
    } else {
      await createDocument('work_transactions', payload);
    }

    setTxnForm({
      type: 'income',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      mode: isServiceBusiness ? 'Service Charge' : 'Cash',
      description: '',
      category: isServiceBusiness ? 'service-charge' : 'product-sale',
    });
    setEditingTxnId(null);
  };

  const uploadBill = async (): Promise<{ billUrl: string | null; billFileName: string | null }> => {
    if (!billFile || !user?.uid) return { billUrl: null, billFileName: null };

    const ext = billFile.name.split('.').pop() || 'file';
    const storageRef = ref(storage, `material-bills/${user.uid}/${id}/${Date.now()}.${ext}`);
    await uploadBytes(storageRef, billFile);
    const url = await getDownloadURL(storageRef);
    return { billUrl: url, billFileName: billFile.name };
  };

  const saveMaterial = async () => {
    if (!materialForm.name.trim()) {
      setError('Material name is required.');
      return;
    }

    setError('');
    const qty = Number(materialForm.quantity || 0);
    const unitCost = Number(materialForm.unitCost || 0);
    const totalCost = qty * unitCost;
    const bill = await uploadBill();

    const payload = {
      workId: id,
      name: materialForm.name.trim(),
      quantity: qty,
      unitCost,
      totalCost,
      billNumber: materialForm.billNumber.trim() || null,
      billDate: materialForm.billDate || null,
      billUrl: bill.billUrl,
      billFileName: bill.billFileName,
      businessType,
    };

    if (editingMaterialId) {
      await updateDocument('material_bills', editingMaterialId, payload);
    } else {
      await createDocument('material_bills', payload);
    }

    setMaterialForm({ name: '', quantity: 1, unitCost: 0, billNumber: '', billDate: '' });
    setEditingMaterialId(null);
    setBillFile(null);
  };

  const saveExpense = async () => {
    if (!expenseForm.description.trim()) {
      setError('Expense description is required.');
      return;
    }
    if (Number(expenseForm.cost || 0) <= 0) {
      setError('Expense cost must be greater than 0.');
      return;
    }

    setError('');
    const payload = {
      workId: id,
      description: expenseForm.description.trim(),
      cost: Number(expenseForm.cost || 0),
      date: expenseForm.date || null,
      businessType,
    };

    if (editingExpenseId) {
      await updateDocument('travel_expenses', editingExpenseId, payload);
    } else {
      await createDocument('travel_expenses', payload);
    }

    setExpenseForm({ description: '', cost: 0, date: new Date().toISOString().slice(0, 10) });
    setEditingExpenseId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <Link to="/jobs" className="text-primary">Back</Link>
          <h2 className="text-3xl font-bold mt-1">{item.title}</h2>
          <p className="text-on-surface-variant">{overview.mode === 'service' ? 'Service Job' : 'Product Job'} | {item.status || 'planned'}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="organic-card">Total Income: INR {totalIncome.toLocaleString('en-IN')}</div>
        <div className="organic-card">Total Expenses: INR {totalExpenses.toLocaleString('en-IN')}</div>
        <div className={`organic-card ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Profit: INR {profit.toLocaleString('en-IN')}</div>
      </div>

      <div className="organic-card flex flex-wrap gap-2">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm ${activeTab === tab.key ? 'bg-primary text-white' : 'bg-surface-container-high'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="organic-card space-y-4">
          <h3 className="font-bold text-lg">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={overview.title} onChange={(e) => setOverview((p) => ({ ...p, title: e.target.value }))} placeholder="Name" className="p-3 rounded-xl bg-surface-container-high" />
            <input value={overview.client} onChange={(e) => setOverview((p) => ({ ...p, client: e.target.value }))} placeholder="Client" className="p-3 rounded-xl bg-surface-container-high" />
            <input value={overview.location} onChange={(e) => setOverview((p) => ({ ...p, location: e.target.value }))} placeholder="Location" className="p-3 rounded-xl bg-surface-container-high" />
            <select value={overview.status} onChange={(e) => setOverview((p) => ({ ...p, status: e.target.value as NonNullable<WorkItem['status']> }))} className="p-3 rounded-xl bg-surface-container-high">
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <input type="date" value={overview.startDate} onChange={(e) => setOverview((p) => ({ ...p, startDate: e.target.value }))} className="p-3 rounded-xl bg-surface-container-high" />
            <input type="date" value={overview.endDate} onChange={(e) => setOverview((p) => ({ ...p, endDate: e.target.value }))} className="p-3 rounded-xl bg-surface-container-high" />
            <select value={overview.mode} onChange={(e) => setOverview((p) => ({ ...p, mode: e.target.value as 'product' | 'service' }))} className="p-3 rounded-xl bg-surface-container-high">
              <option value="product">Product-based Job</option>
              <option value="service">Service-based Job</option>
            </select>
            <textarea value={overview.notes} onChange={(e) => setOverview((p) => ({ ...p, notes: e.target.value }))} placeholder="Notes" className="p-3 rounded-xl bg-surface-container-high min-h-20" />
          </div>
          <button type="button" onClick={saveOverview} disabled={saving} className="btn-primary px-5 py-3 rounded-xl">Save Details</button>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="organic-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Tasks</h3>
            <button type="button" onClick={saveTask} className="btn-primary px-4 py-2 rounded-xl">+ Add Task</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={taskForm.name} onChange={(e) => setTaskForm((p) => ({ ...p, name: e.target.value }))} placeholder="Task name" className="p-3 rounded-xl bg-surface-container-high" />
            <select value={taskForm.assignedWorkerId} onChange={(e) => setTaskForm((p) => ({ ...p, assignedWorkerId: e.target.value }))} className="p-3 rounded-xl bg-surface-container-high">
              <option value="">Assigned worker</option>
              {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}{m.role ? ` (${m.role})` : ''}</option>)}
            </select>
            <select value={taskForm.status} onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value as WorkTask['status'] }))} className="p-3 rounded-xl bg-surface-container-high">
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="space-y-2">
            {tasks.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-surface-container-high flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-on-surface-variant">Assigned: {t.assignedWorkerName || 'Unassigned'} | Status: {t.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTaskId(t.id);
                      setTaskForm({ name: t.name, assignedWorkerId: t.assignedWorkerId || '', status: t.status });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => removeDocument('work_tasks', t.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="organic-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Transactions</h3>
            <button type="button" onClick={saveTransaction} className="btn-primary px-4 py-2 rounded-xl">+ Add Transaction</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select value={txnForm.type} onChange={(e) => setTxnForm((p) => ({ ...p, type: e.target.value as WorkTransaction['type'] }))} className="p-3 rounded-xl bg-surface-container-high">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="number" min={0} value={txnForm.amount} onChange={(e) => setTxnForm((p) => ({ ...p, amount: Number(e.target.value || 0) }))} placeholder="Amount" className="p-3 rounded-xl bg-surface-container-high" />
            <input type="date" value={txnForm.date} onChange={(e) => setTxnForm((p) => ({ ...p, date: e.target.value }))} className="p-3 rounded-xl bg-surface-container-high" />
            <input value={txnForm.mode} onChange={(e) => setTxnForm((p) => ({ ...p, mode: e.target.value }))} placeholder="Mode (cash/bank/upi)" className="p-3 rounded-xl bg-surface-container-high" />
            <input value={txnForm.category} onChange={(e) => setTxnForm((p) => ({ ...p, category: e.target.value }))} placeholder={overview.mode === 'service' ? 'Category (service-charge/labor)' : 'Category (sale/purchase)'} className="p-3 rounded-xl bg-surface-container-high" />
            <input value={txnForm.description} onChange={(e) => setTxnForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="p-3 rounded-xl bg-surface-container-high" />
          </div>
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-surface-container-high flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{t.type === 'income' ? '+' : '-'} INR {Number(t.amount || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-on-surface-variant">{t.date || '-'} | {t.mode || '-'} | {t.category || '-'} | {t.description || '-'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTxnId(t.id);
                      setTxnForm({
                        type: t.type,
                        amount: Number(t.amount || 0),
                        date: t.date || new Date().toISOString().slice(0, 10),
                        mode: t.mode || '',
                        description: t.description || '',
                        category: t.category || '',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => removeDocument('work_transactions', t.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="organic-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Materials</h3>
            <button type="button" onClick={saveMaterial} className="btn-primary px-4 py-2 rounded-xl">+ Add Material</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={materialForm.name} onChange={(e) => setMaterialForm((p) => ({ ...p, name: e.target.value }))} placeholder="Material name" className="p-3 rounded-xl bg-surface-container-high" />
            <input type="number" min={0} value={materialForm.quantity} onChange={(e) => setMaterialForm((p) => ({ ...p, quantity: Number(e.target.value || 0) }))} placeholder="Quantity" className="p-3 rounded-xl bg-surface-container-high" />
            <input type="number" min={0} value={materialForm.unitCost} onChange={(e) => setMaterialForm((p) => ({ ...p, unitCost: Number(e.target.value || 0) }))} placeholder="Unit Cost" className="p-3 rounded-xl bg-surface-container-high" />
            <input value={materialForm.billNumber} onChange={(e) => setMaterialForm((p) => ({ ...p, billNumber: e.target.value }))} placeholder="Bill Number" className="p-3 rounded-xl bg-surface-container-high" />
            <input type="date" value={materialForm.billDate} onChange={(e) => setMaterialForm((p) => ({ ...p, billDate: e.target.value }))} className="p-3 rounded-xl bg-surface-container-high" />
            <input type="file" onChange={(e) => setBillFile(e.target.files?.[0] || null)} className="p-3 rounded-xl bg-surface-container-high" />
          </div>
          <div className="space-y-2">
            {materials.map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-surface-container-high flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{m.name} | Qty {m.quantity} | INR {Number(m.totalCost || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-on-surface-variant">Unit: INR {Number(m.unitCost || 0)} | Bill: {m.billNumber || '-'} | Date: {m.billDate || '-'}</p>
                  {m.billUrl && <a href={m.billUrl} target="_blank" rel="noreferrer" className="text-sm text-primary">View Bill</a>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMaterialId(m.id);
                      setMaterialForm({
                        name: m.name,
                        quantity: Number(m.quantity || 0),
                        unitCost: Number(m.unitCost || 0),
                        billNumber: m.billNumber || '',
                        billDate: m.billDate || '',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => removeDocument('material_bills', m.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="organic-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Travel Expenses</h3>
            <button type="button" onClick={saveExpense} className="btn-primary px-4 py-2 rounded-xl">+ Add Expense</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input value={expenseForm.description} onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="p-3 rounded-xl bg-surface-container-high" />
            <input type="number" min={0} value={expenseForm.cost} onChange={(e) => setExpenseForm((p) => ({ ...p, cost: Number(e.target.value || 0) }))} placeholder="Cost" className="p-3 rounded-xl bg-surface-container-high" />
            <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))} className="p-3 rounded-xl bg-surface-container-high" />
          </div>
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="p-3 rounded-xl bg-surface-container-high flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">INR {Number(e.cost || 0).toLocaleString('en-IN')}</p>
                  <p className="text-sm text-on-surface-variant">{e.description} | {e.date || '-'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpenseId(e.id);
                      setExpenseForm({ description: e.description, cost: Number(e.cost || 0), date: e.date || new Date().toISOString().slice(0, 10) });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => removeDocument('travel_expenses', e.id)} className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
