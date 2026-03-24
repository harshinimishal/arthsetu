import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, Mic, Plus, Search, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { createDocument, subscribeToDocuments } from '../services/firestoreService';
import { resolveBusinessCollections } from '../services/businessService';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceToText } from '../hooks/useVoiceToText';
import { cn } from '../lib/utils';

type PaymentState = 'Paid' | 'Pending';
type RecurringCycle = 'none' | 'weekly' | 'monthly';
type ContractStatus = 'planned' | 'in-progress' | 'completed';

interface TeamOption {
  id: string;
  name: string;
  role?: string;
}

interface ServiceClientInput {
  id: string;
  name: string;
  email: string;
  phone: string;
  bookingDateTime: string;
  recurring: RecurringCycle;
  paymentStatus: PaymentState;
  discount: number;
  staffId: string;
  generateInvoice: boolean;
  sendReminder: boolean;
}

interface GoogleAddress {
  address: string;
  placeId: string;
  lat: string;
  lng: string;
}

declare global {
  interface Window {
    google: any;
  }
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptyServiceClient(): ServiceClientInput {
  return {
    id: uid(),
    name: '',
    email: '',
    phone: '',
    bookingDateTime: '',
    recurring: 'none',
    paymentStatus: 'Pending',
    discount: 0,
    staffId: '',
    generateInvoice: false,
    sendReminder: false,
  };
}

function sanitizePhone(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function DateField({
  label,
  value,
  onChange,
  includeTime = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  includeTime?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="relative">
        <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type={includeTime ? 'datetime-local' : 'date'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-sm"
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-sm"
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </label>
  );
}

function LocationAutocomplete({
  value,
  onChange,
}: {
  value: GoogleAddress;
  onChange: (next: GoogleAddress) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mapsLoaded, setMapsLoaded] = useState(Boolean(window.google?.maps?.places));

  useEffect(() => {
    if (window.google?.maps?.places) {
      setMapsLoaded(true);
      return;
    }

    const apiKey = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_KEY || '';
    if (!apiKey) return;

    const scriptId = 'google-maps-places-script';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => setMapsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapsLoaded || !inputRef.current || !window.google?.maps?.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      fields: ['formatted_address', 'place_id', 'geometry'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place) return;
      onChange({
        address: place.formatted_address || value.address,
        placeId: place.place_id || '',
        lat: place.geometry?.location ? String(place.geometry.location.lat()) : '',
        lng: place.geometry?.location ? String(place.geometry.location.lng()) : '',
      });
    });
  }, [mapsLoaded, onChange, value.address]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Location</label>
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder={mapsLoaded ? 'Type location to see autocomplete suggestions' : 'Add VITE_GOOGLE_MAPS_KEY to enable autocomplete'}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-sm"
        />
      </div>
    </div>
  );
}

export default function CreateJob() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const businessType = profile?.businessType || localStorage.getItem('businessType') || 'contract';
  const isService = businessType === 'service';
  const { work, team } = resolveBusinessCollections(businessType);

  const [teamOptions, setTeamOptions] = useState<TeamOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [serviceForm, setServiceForm] = useState({
    serviceName: '',
    serviceCategory: 'Wellness',
    durationMinutes: 60,
    pricePerSession: 0,
    internalNotes: '',
    clients: [emptyServiceClient()],
  });

  const [contractForm, setContractForm] = useState({
    projectName: '',
    projectType: 'Contract',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    startDate: '',
    endDate: '',
    status: 'planned' as ContractStatus,
    scope: '',
    location: {
      address: '',
      placeId: '',
      lat: '',
      lng: '',
    },
    requestedBudget: 0,
    generateInvoice: true,
    internalNotes: '',
  });

  useEffect(() => {
    if (!user?.uid) return undefined;

    const unsubscribe = subscribeToDocuments<TeamOption>(
      team,
      [where('ownerUid', '==', user.uid)],
      (rows) => setTeamOptions(rows),
    );

    return unsubscribe;
  }, [team, user?.uid]);

  const { listening, supported, start } = useVoiceToText({
    language: 'en-IN',
    onResult: (text) => {
      if (isService) {
        setServiceForm((prev) => ({
          ...prev,
          internalNotes: prev.internalNotes ? `${prev.internalNotes} ${text}` : text,
        }));
      } else {
        setContractForm((prev) => ({
          ...prev,
          scope: prev.scope ? `${prev.scope} ${text}` : text,
        }));
      }
    },
  });

  const updateServiceClient = (id: string, patch: Partial<ServiceClientInput>) => {
    setServiceForm((prev) => ({
      ...prev,
      clients: prev.clients.map((client) => (client.id === id ? { ...client, ...patch } : client)),
    }));
  };

  const removeServiceClient = (id: string) => {
    setServiceForm((prev) => ({
      ...prev,
      clients: prev.clients.length > 1 ? prev.clients.filter((c) => c.id !== id) : prev.clients,
    }));
  };

  const validateClientDetails = (): void => {
    if (!isService) {
      if (!contractForm.clientPhone || contractForm.clientPhone.length !== 10) {
        throw new Error('Client phone is required and must be exactly 10 digits.');
      }
      if (contractForm.clientEmail && !isValidEmail(contractForm.clientEmail)) {
        throw new Error('Please enter a valid client email.');
      }
      if (!contractForm.startDate) {
        throw new Error('Start date is required.');
      }
      if (!contractForm.requestedBudget || contractForm.requestedBudget <= 0) {
        throw new Error('Requested budget is required.');
      }
      return;
    }

    for (const client of serviceForm.clients) {
      const hasAnyInfo = client.name.trim() || client.phone.trim() || client.email.trim();
      if (!hasAnyInfo) continue;

      if (!client.name.trim()) {
        throw new Error('Client name is required for every added client row.');
      }
      if (!client.phone || client.phone.length !== 10) {
        throw new Error(`Phone for ${client.name || 'a client'} is required and must be exactly 10 digits.`);
      }
      if (client.email && !isValidEmail(client.email)) {
        throw new Error(`Email for ${client.name || 'a client'} is invalid.`);
      }
    }
  };

  const createServiceWorkflow = async () => {
    const validClients = serviceForm.clients.filter((c) => c.name.trim() || c.phone.trim() || c.email.trim());
    const expectedRevenue = validClients.reduce((sum, client) => {
      const discounted = Math.max(0, serviceForm.pricePerSession - Number(client.discount || 0));
      return sum + discounted;
    }, 0);

    const serviceId = await createDocument(work, {
      title: serviceForm.serviceName,
      serviceName: serviceForm.serviceName,
      category: serviceForm.serviceCategory,
      durationMinutes: Number(serviceForm.durationMinutes || 0),
      pricePerSession: Number(serviceForm.pricePerSession || 0),
      status: 'active',
      budget: expectedRevenue,
      spent: 0,
      expectedRevenue,
      clientCount: validClients.length,
      notes: serviceForm.internalNotes,
      model: 'service',
    });

    for (const client of validClients) {
      const clientId = await createDocument('clients', {
        name: client.name,
        email: client.email,
        phone: client.phone,
        source: 'service',
      });

      const sessionAmount = Math.max(0, serviceForm.pricePerSession - Number(client.discount || 0));

      await createDocument('service_bookings', {
        serviceId,
        serviceName: serviceForm.serviceName,
        clientId,
        clientName: client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        bookingDateTime: client.bookingDateTime || null,
        recurring: client.recurring,
        assignedStaffId: client.staffId || null,
        status: 'scheduled',
        paymentStatus: client.paymentStatus,
        amount: sessionAmount,
      });

      await createDocument('transactions', {
        type: 'credit',
        amount: sessionAmount,
        category: 'Service Session',
        jobId: serviceId,
        job: serviceForm.serviceName,
        recipient: client.name,
        date: client.bookingDateTime ? client.bookingDateTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
        status: client.paymentStatus === 'Paid' ? 'completed' : 'pending',
      });

      if (client.generateInvoice) {
        await createDocument('invoices', {
          workId: serviceId,
          model: 'service',
          clientId,
          clientName: client.name,
          invoiceDate: new Date().toISOString().slice(0, 10),
          dueDate: client.bookingDateTime ? client.bookingDateTime.slice(0, 10) : new Date().toISOString().slice(0, 10),
          items: [
            {
              description: `${serviceForm.serviceName} (${serviceForm.serviceCategory})`,
              quantity: 1,
              rate: sessionAmount,
            },
          ],
          subtotal: sessionAmount,
          tax: 0,
          total: sessionAmount,
          status: client.paymentStatus === 'Paid' ? 'paid' : 'pending',
        });
      }

      if (client.sendReminder) {
        await createDocument('notifications', {
          type: 'service-reminder',
          targetClientId: clientId,
          targetClientName: client.name,
          serviceId,
          serviceName: serviceForm.serviceName,
          scheduleAt: client.bookingDateTime || null,
          channel: client.email ? 'email' : 'sms',
          status: 'queued',
        });
      }
    }
  };

  const createContractWorkflow = async () => {
    const requestedBudget = Number(contractForm.requestedBudget || 0);

    const projectId = await createDocument(work, {
      title: contractForm.projectName,
      projectType: contractForm.projectType,
      client: contractForm.clientName,
      clientEmail: contractForm.clientEmail,
      clientPhone: contractForm.clientPhone,
      startDate: contractForm.startDate,
      endDate: contractForm.endDate || null,
      status: contractForm.status,
      description: contractForm.scope,
      location: contractForm.location.address,
      locationPlaceId: contractForm.location.placeId || null,
      latitude: contractForm.location.lat || null,
      longitude: contractForm.location.lng || null,
      budget: requestedBudget,
      requestedBudget,
      spent: 0,
      model: 'contract',
      notes: contractForm.internalNotes,
    });

    await createDocument('clients', {
      name: contractForm.clientName,
      email: contractForm.clientEmail,
      phone: contractForm.clientPhone,
      source: 'contract',
      linkedProjectId: projectId,
    });

    await createDocument('transactions', {
      type: 'credit',
      amount: requestedBudget,
      category: 'Client Budget',
      jobId: projectId,
      job: contractForm.projectName,
      recipient: contractForm.clientName || 'Client',
      date: contractForm.startDate || new Date().toISOString().slice(0, 10),
      status: 'pending',
    });

    if (contractForm.generateInvoice) {
      await createDocument('invoices', {
        workId: projectId,
        model: 'contract',
        clientName: contractForm.clientName,
        invoiceDate: new Date().toISOString().slice(0, 10),
        dueDate: contractForm.endDate || contractForm.startDate || new Date().toISOString().slice(0, 10),
        items: [
          {
            description: contractForm.projectName,
            quantity: 1,
            rate: requestedBudget,
          },
        ],
        subtotal: requestedBudget,
        tax: 0,
        total: requestedBudget,
        status: 'draft',
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    setSaving(true);
    try {
      validateClientDetails();

      if (isService) {
        if (!serviceForm.serviceName.trim()) {
          throw new Error('Service name is required.');
        }
        await createServiceWorkflow();
      } else {
        if (!contractForm.projectName.trim() || !contractForm.clientName.trim()) {
          throw new Error('Project name and client are required.');
        }
        await createContractWorkflow();
      }

      setSuccess(isService ? 'Service package created successfully.' : 'Contract project created successfully.');
      setTimeout(() => navigate('/jobs'), 600);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError instanceof Error ? submitError.message : 'Failed to create item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/jobs" className="p-3 rounded-xl bg-surface-container">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{isService ? 'Create Service Package' : 'Create Contract Project'}</h2>
          <p className="text-sm text-on-surface-variant">
            {isService ? 'Single page service setup with clients and billing.' : 'Single page project setup with client budget.'}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-700">{success}</p>}

      <form onSubmit={submit} className="space-y-6">
        {isService && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organic-card space-y-4">
            <h3 className="font-bold text-lg">Service Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={serviceForm.serviceName}
                onChange={(e) => setServiceForm((p) => ({ ...p, serviceName: e.target.value }))}
                placeholder="Service / Package Name"
                required
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <SelectField
                label="Service Category"
                value={serviceForm.serviceCategory}
                onChange={(value) => setServiceForm((p) => ({ ...p, serviceCategory: value }))}
              >
                <option>Hair</option>
                <option>Skin</option>
                <option>Body</option>
                <option>Wellness</option>
              </SelectField>
              <input
                type="number"
                min={0}
                value={serviceForm.durationMinutes}
                onChange={(e) => setServiceForm((p) => ({ ...p, durationMinutes: Number(e.target.value || 0) }))}
                placeholder="Duration (minutes)"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                type="number"
                min={0}
                value={serviceForm.pricePerSession}
                onChange={(e) => setServiceForm((p) => ({ ...p, pricePerSession: Number(e.target.value || 0) }))}
                placeholder="Price per Session"
                className="p-3 rounded-xl bg-surface-container-high"
              />
            </div>

            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Clients</h4>
              <button
                type="button"
                onClick={() => setServiceForm((p) => ({ ...p, clients: [...p.clients, emptyServiceClient()] }))}
                className="text-primary text-sm font-semibold"
              >
                <Plus className="w-4 h-4 inline mr-1" />Add Client
              </button>
            </div>

            {serviceForm.clients.map((client) => (
              <div key={client.id} className="p-4 rounded-2xl bg-surface-container-high/50 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={client.name}
                    onChange={(e) => updateServiceClient(client.id, { name: e.target.value })}
                    placeholder="Client Name"
                    required
                    className="p-3 rounded-xl bg-surface-container-high"
                  />
                  <input
                    value={client.email}
                    onChange={(e) => updateServiceClient(client.id, { email: e.target.value })}
                    placeholder="Client Email"
                    type="email"
                    className="p-3 rounded-xl bg-surface-container-high"
                  />
                  <input
                    value={client.phone}
                    onChange={(e) => updateServiceClient(client.id, { phone: sanitizePhone(e.target.value) })}
                    placeholder="Client Phone (10 digits)"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    className="p-3 rounded-xl bg-surface-container-high"
                  />

                  <DateField
                    label="Booking Date & Time"
                    value={client.bookingDateTime}
                    onChange={(value) => updateServiceClient(client.id, { bookingDateTime: value })}
                    includeTime
                  />
                  <SelectField
                    label="Recurring"
                    value={client.recurring}
                    onChange={(value) => updateServiceClient(client.id, { recurring: value as RecurringCycle })}
                  >
                    <option value="none">No Recurring</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </SelectField>
                  <SelectField
                    label="Payment Status"
                    value={client.paymentStatus}
                    onChange={(value) => updateServiceClient(client.id, { paymentStatus: value as PaymentState })}
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                  </SelectField>

                  <SelectField
                    label="Assign Staff"
                    value={client.staffId}
                    onChange={(value) => updateServiceClient(client.id, { staffId: value })}
                  >
                    <option value="">Select Staff</option>
                    {teamOptions.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}{staff.role ? ` (${staff.role})` : ''}
                      </option>
                    ))}
                  </SelectField>
                  <input
                    type="number"
                    min={0}
                    value={client.discount}
                    onChange={(e) => updateServiceClient(client.id, { discount: Number(e.target.value || 0) })}
                    placeholder="Discount"
                    className="p-3 rounded-xl bg-surface-container-high"
                  />
                  <div className="flex items-center text-sm font-semibold text-slate-600">
                    Net Amount: Rs {Math.max(0, serviceForm.pricePerSession - client.discount).toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={client.generateInvoice}
                      onChange={(e) => updateServiceClient(client.id, { generateInvoice: e.target.checked })}
                    />
                    Generate invoice
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={client.sendReminder}
                      onChange={(e) => updateServiceClient(client.id, { sendReminder: e.target.checked })}
                    />
                    Send reminder
                  </label>
                  <button type="button" onClick={() => removeServiceClient(client.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4 inline mr-1" />Remove
                  </button>
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Internal Notes</label>
                {supported && (
                  <button
                    type="button"
                    onClick={start}
                    className={cn('px-3 py-1 rounded-lg text-xs', listening ? 'bg-primary text-white' : 'bg-surface-container-high')}
                  >
                    <Mic className="w-3 h-3 inline mr-1" />{listening ? 'Listening...' : 'Voice'}
                  </button>
                )}
              </div>
              <textarea
                value={serviceForm.internalNotes}
                onChange={(e) => setServiceForm((p) => ({ ...p, internalNotes: e.target.value }))}
                placeholder="Internal service notes"
                className="w-full p-3 rounded-xl bg-surface-container-high min-h-24"
              />
            </div>
          </motion.section>
        )}

        {!isService && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="organic-card space-y-4">
            <h3 className="font-bold text-lg">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={contractForm.projectName}
                onChange={(e) => setContractForm((p) => ({ ...p, projectName: e.target.value }))}
                placeholder="Project Name"
                required
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <SelectField
                label="Project Type"
                value={contractForm.projectType}
                onChange={(value) => setContractForm((p) => ({ ...p, projectType: value }))}
              >
                <option>Contract</option>
                <option>Fixed Scope</option>
              </SelectField>
              <input
                value={contractForm.clientName}
                onChange={(e) => setContractForm((p) => ({ ...p, clientName: e.target.value }))}
                placeholder="Client Name"
                required
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                value={contractForm.clientPhone}
                onChange={(e) => setContractForm((p) => ({ ...p, clientPhone: sanitizePhone(e.target.value) }))}
                placeholder="Client Phone (10 digits)"
                inputMode="numeric"
                maxLength={10}
                required
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <input
                type="email"
                value={contractForm.clientEmail}
                onChange={(e) => setContractForm((p) => ({ ...p, clientEmail: e.target.value }))}
                placeholder="Client Email"
                className="p-3 rounded-xl bg-surface-container-high"
              />
              <SelectField
                label="Project Status"
                value={contractForm.status}
                onChange={(value) => setContractForm((p) => ({ ...p, status: value as ContractStatus }))}
              >
                <option value="planned">Planned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </SelectField>
              <DateField
                label="Project Start Date"
                value={contractForm.startDate}
                onChange={(value) => setContractForm((p) => ({ ...p, startDate: value }))}
              />
              <DateField
                label="Project End Date"
                value={contractForm.endDate}
                onChange={(value) => setContractForm((p) => ({ ...p, endDate: value }))}
              />
              <input
                type="number"
                min={0}
                value={contractForm.requestedBudget}
                onChange={(e) => setContractForm((p) => ({ ...p, requestedBudget: Number(e.target.value || 0) }))}
                placeholder="Client Requested Budget"
                required
                className="p-3 rounded-xl bg-surface-container-high"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">Scope of Work</label>
                {supported && (
                  <button
                    type="button"
                    onClick={start}
                    className={cn('px-3 py-1 rounded-lg text-xs', listening ? 'bg-primary text-white' : 'bg-surface-container-high')}
                  >
                    <Mic className="w-3 h-3 inline mr-1" />{listening ? 'Listening...' : 'Voice'}
                  </button>
                )}
              </div>
              <textarea
                value={contractForm.scope}
                onChange={(e) => setContractForm((p) => ({ ...p, scope: e.target.value }))}
                className="w-full p-3 rounded-xl bg-surface-container-high min-h-24"
              />
            </div>

            <LocationAutocomplete
              value={contractForm.location}
              onChange={(location) => setContractForm((prev) => ({ ...prev, location }))}
            />

            <textarea
              value={contractForm.internalNotes}
              onChange={(e) => setContractForm((p) => ({ ...p, internalNotes: e.target.value }))}
              placeholder="Internal notes"
              className="w-full p-3 rounded-xl bg-surface-container-high min-h-24"
            />

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={contractForm.generateInvoice}
                onChange={(e) => setContractForm((p) => ({ ...p, generateInvoice: e.target.checked }))}
              />
              Generate invoice / receipt now
            </label>
          </motion.section>
        )}

        <div className="flex justify-end">
          <button disabled={saving} type="submit" className="btn-primary px-6 py-3 rounded-xl">
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
