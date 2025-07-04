export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'user';
  department: string;
  avatar?: string;
  lastLogin?: Date;
}

export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobile?: string;
  title?: string;
  company?: Company | string;
  department?: string;
  address?: Address;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'other';
  owner: User | string;
  tags?: string[];
  notes?: string;
  socialMedia?: SocialMedia;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  _id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+';
  revenue?: number;
  phone?: string;
  website?: string;
  address?: Address;
  type: 'prospect' | 'customer' | 'partner' | 'vendor' | 'other';
  status: 'active' | 'inactive' | 'pending';
  owner: User | string;
  description?: string;
  tags?: string[];
  socialMedia?: SocialMedia;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  _id: string;
  title: string;
  value: number;
  currency: string;
  stage: 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  contact: Contact | string;
  company: Company | string;
  owner: User | string;
  products?: Product[];
  description?: string;
  lostReason?: string;
  wonDetails?: string;
  nextStep?: string;
  tags?: string[];
  attachments?: Attachment[];
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'follow_up' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: Date;
  completedAt?: Date;
  assignedTo: User | string;
  relatedTo?: {
    type: 'contact' | 'company' | 'deal';
    id: string;
  };
  reminder?: {
    enabled: boolean;
    time?: Date;
  };
  notes?: string;
  createdBy: User | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  _id: string;
  type: string;
  title: string;
  description?: string;
  user: User | string;
  relatedTo?: {
    type: string;
    id: any;
  };
  metadata?: any;
  createdAt: Date;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface SocialMedia {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
}

export interface Product {
  name: string;
  quantity: number;
  price: number;
}

export interface Attachment {
  filename: string;
  url: string;
  uploadedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface DashboardStats {
  overview: {
    totalContacts: number;
    totalCompanies: number;
    totalDeals: number;
    pendingTasks: number;
    totalRevenue: number;
  };
  dealsByStage: Array<{
    _id: string;
    count: number;
    totalValue: number;
  }>;
  monthlyRevenue: Array<{
    _id: { year: number; month: number };
    revenue: number;
    count: number;
  }>;
  recentActivities: Activity[];
  upcomingTasks: Task[];
  recentDeals: Deal[];
}