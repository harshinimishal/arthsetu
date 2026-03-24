export interface Job {
  id: string;
  title: string;
  client: string;
  location: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  spent: number;
  startDate: string;
  endDate?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  dailyWage: number;
  status: 'active' | 'on-leave' | 'inactive';
  attendance: number; // percentage
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
}
