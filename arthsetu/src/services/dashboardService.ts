import { where } from 'firebase/firestore';
import { subscribeToDocuments } from './firestoreService';

type BusinessType = 'contract' | 'service';

interface FinancialTransaction {
  id: string;
  amount: number;
  type: string;
  status?: string;
  createdAt?: string;
  date?: string;
}

interface WorkItem {
  id: string;
  title?: string;
  name?: string;
  status?: string;
  budget?: number;
  spent?: number;
  revenue?: number;
  cost?: number;
  createdAt?: string;
}

interface TeamMember {
  id: string;
  status?: string;
}

interface DashboardSummary {
  totalRevenue: number;
  pendingPayouts: number;
  activeWorkItems: number;
  teamSize: number;
  completionRate: number;
}

interface DashboardTrendPoint {
  name: string;
  income: number;
  expense: number;
}

interface DashboardProfitItem {
  name: string;
  value: number;
  color: string;
}

interface DashboardActivity {
  id: string;
  title: string;
  status: string;
  timeLabel: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  trends: DashboardTrendPoint[];
  profitability: DashboardProfitItem[];
  activities: DashboardActivity[];
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTimeLabel(dateValue?: string): string {
  const date = parseDate(dateValue);
  if (!date) return 'Recently';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-IN');
}

function isActiveStatus(status?: string): boolean {
  const normalized = (status || '').toLowerCase();
  return normalized === 'active' || normalized === 'ongoing' || normalized === 'open' || normalized === 'in-progress';
}

function isCompletedStatus(status?: string): boolean {
  return (status || '').toLowerCase() === 'completed';
}

function buildSummary(transactions: FinancialTransaction[], workItems: WorkItem[], team: TeamMember[]): DashboardSummary {
  const totalRevenue = transactions
    .filter((item) => item.type === 'credit' && (item.status || 'completed') === 'completed')
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const pendingPayouts = transactions
    .filter((item) => item.type === 'debit' && (item.status || '') === 'pending')
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  const activeWorkItems = workItems.filter((item) => isActiveStatus(item.status)).length;
  const teamSize = team.filter((member) => isActiveStatus(member.status)).length;

  const totalWorkItems = workItems.length;
  const completedWorkItems = workItems.filter((item) => isCompletedStatus(item.status)).length;
  const completionRate = totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 0;

  return {
    totalRevenue,
    pendingPayouts,
    activeWorkItems,
    teamSize,
    completionRate,
  };
}

function buildTrends(transactions: FinancialTransaction[]): DashboardTrendPoint[] {
  const points = WEEK_DAYS.map((name) => ({ name, income: 0, expense: 0 }));

  transactions.forEach((entry) => {
    const date = parseDate(entry.date || entry.createdAt);
    if (!date) return;

    const dayIndex = date.getDay();
    const normalizedIndex = dayIndex === 0 ? 6 : dayIndex - 1;

    if (entry.type === 'credit') {
      points[normalizedIndex].income += entry.amount || 0;
    } else {
      points[normalizedIndex].expense += entry.amount || 0;
    }
  });

  return points;
}

function buildProfitability(items: WorkItem[]): DashboardProfitItem[] {
  return items.slice(0, 3).map((item, index) => {
    const budget = item.budget ?? item.revenue ?? 0;
    const spent = item.spent ?? item.cost ?? 0;
    const percent = budget > 0 ? Math.round(((budget - spent) / budget) * 100) : 0;

    return {
      name: item.title || item.name || `Item ${index + 1}`,
      value: percent,
      color: ['#9f402d', '#fe9832', '#006972'][index % 3],
    };
  });
}

function buildActivities(items: WorkItem[]): DashboardActivity[] {
  const sorted = [...items].sort((a, b) => {
    const aTs = parseDate(a.createdAt)?.getTime() || 0;
    const bTs = parseDate(b.createdAt)?.getTime() || 0;
    return bTs - aTs;
  });

  return sorted.slice(0, 4).map((item) => ({
    id: item.id,
    title: item.title || item.name || 'Work item',
    status: item.status || 'unknown',
    timeLabel: getTimeLabel(item.createdAt),
  }));
}

function buildPayload(transactions: FinancialTransaction[], workItems: WorkItem[], team: TeamMember[]): DashboardData {
  return {
    summary: buildSummary(transactions, workItems, team),
    trends: buildTrends(transactions),
    profitability: buildProfitability(workItems),
    activities: buildActivities(workItems),
  };
}

interface SubscribeDashboardInput {
  userId: string;
  businessType: BusinessType;
  onData: (payload: DashboardData) => void;
}

export function subscribeDashboardData({ userId, businessType, onData }: SubscribeDashboardInput): () => void {
  const workCollection = businessType === 'service' ? 'services' : 'jobs';
  const teamCollection = businessType === 'service' ? 'staff' : 'workers';

  let transactions: FinancialTransaction[] = [];
  let workItems: WorkItem[] = [];
  let teamMembers: TeamMember[] = [];

  const emit = () => onData(buildPayload(transactions, workItems, teamMembers));

  const unsubscribeTransactions = subscribeToDocuments<FinancialTransaction>(
    'transactions',
    [where('ownerUid', '==', userId)],
    (data) => {
      transactions = data;
      emit();
    },
  );

  const unsubscribeWork = subscribeToDocuments<WorkItem>(
    workCollection,
    [where('ownerUid', '==', userId)],
    (data) => {
      workItems = data;
      emit();
    },
  );

  const unsubscribeTeam = subscribeToDocuments<TeamMember>(
    teamCollection,
    [where('ownerUid', '==', userId)],
    (data) => {
      teamMembers = data;
      emit();
    },
  );

  return () => {
    unsubscribeTransactions();
    unsubscribeWork();
    unsubscribeTeam();
  };
}
