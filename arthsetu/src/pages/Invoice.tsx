import { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Send, 
  Eye, 
  FileText, 
  User, 
  Calendar,
  Briefcase as BriefcaseIcon,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

const initialItems = [
  { id: '1', description: 'Foundation Work - Phase 1', quantity: 1, rate: 150000, amount: 150000 },
  { id: '2', description: 'Labor Charges (25 Workers x 10 Days)', quantity: 250, rate: 850, amount: 212500 },
];

export default function Invoice() {
  const [items, setItems] = useState(initialItems);
  const [client, setClient] = useState('MMRDA');
  const [project, setProject] = useState('Metro Line 3 Foundation');

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex items-end justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight text-on-surface">Generate Invoice</h2>
          <p className="text-on-surface-variant text-lg">Create professional GST-compliant invoices for your clients.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-2xl hover:bg-surface-container-high transition-all text-sm font-bold">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-xl shadow-primary/20">
            <Send className="w-5 h-5" />
            Send to Client
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoice Form */}
        <section className="lg:col-span-2 space-y-8">
          <div className="organic-card space-y-8">
            <h3 className="text-xl font-bold">Invoice Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Select Client</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <select 
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-medium"
                  >
                    <option>MMRDA</option>
                    <option>Phoenix Mills</option>
                    <option>Lodha Group</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Select Project</label>
                <div className="relative">
                  <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <select 
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none font-medium"
                  >
                    <option>Metro Line 3 Foundation</option>
                    <option>Phoenix Mall Renovation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Invoice Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    type="date" 
                    defaultValue="2024-03-24"
                    className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface ml-1">Due Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input 
                    type="date" 
                    defaultValue="2024-04-07"
                    className="w-full pl-12 pr-6 py-4 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-outline/10 space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold">Line Items</h4>
                <button 
                  onClick={addItem}
                  className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-6 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant ml-1">Description</label>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item description..."
                        className="w-full px-4 py-3 bg-surface-container-high rounded-xl border-none text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant ml-1">Qty</label>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-surface-container-high rounded-xl border-none text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs font-bold text-on-surface-variant ml-1">Rate</label>
                      <input 
                        type="number" 
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-surface-container-high rounded-xl border-none text-sm outline-none"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center pb-3">
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-on-surface-variant hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="col-span-1 text-right pb-3">
                      <p className="text-sm font-bold">₹{item.amount.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Invoice Summary */}
        <section className="lg:col-span-1 space-y-8">
          <div className="organic-card bg-primary text-white space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Summary</h3>
              <FileText className="w-6 h-6 opacity-50" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">GST (18%)</span>
                <span className="font-bold">₹{gst.toLocaleString()}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">Total Amount</span>
                <span className="text-4xl font-bold">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <button className="w-full py-4 bg-white text-primary rounded-2xl font-bold hover:bg-secondary-container hover:text-on-surface transition-all flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download PDF
              </button>
              <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Mark as Paid
              </button>
            </div>
          </div>

          <div className="organic-card">
            <h3 className="text-xl font-bold mb-6">Live Preview</h3>
            <div className="aspect-[3/4] bg-white rounded-2xl border border-outline/10 p-6 shadow-sm overflow-hidden text-[10px] space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="font-bold text-primary text-xs">ArthSetu</p>
                  <p className="text-on-surface-variant">Kumar Constructions Pvt Ltd</p>
                  <p className="text-on-surface-variant">GSTIN: 27AAACK1234A1Z5</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-xs uppercase tracking-widest">Invoice</p>
                  <p className="text-on-surface-variant">#INV-2024-001</p>
                  <p className="text-on-surface-variant">Date: 24 Mar 2024</p>
                </div>
              </div>

              <div className="pt-4 border-t border-outline/10">
                <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Bill To:</p>
                <p className="font-bold text-on-surface">{client}</p>
                <p className="text-on-surface-variant">Project: {project}</p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-12 border-b border-outline/10 pb-1 font-bold text-on-surface-variant uppercase tracking-widest">
                  <p className="col-span-8">Description</p>
                  <p className="col-span-4 text-right">Amount</p>
                </div>
                {items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 text-on-surface">
                    <p className="col-span-8">{item.description || 'New Item'}</p>
                    <p className="col-span-4 text-right">₹{item.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-outline/10 space-y-1">
                <div className="flex justify-between">
                  <p className="text-on-surface-variant">Subtotal</p>
                  <p className="font-bold">₹{subtotal.toLocaleString()}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-on-surface-variant">GST (18%)</p>
                  <p className="font-bold">₹{gst.toLocaleString()}</p>
                </div>
                <div className="flex justify-between pt-1 text-xs font-bold text-primary">
                  <p>Total</p>
                  <p>₹{total.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
