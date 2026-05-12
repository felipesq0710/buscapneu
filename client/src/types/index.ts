export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface TireQuote {
  id: string;
  company: string;
  brand: string;
  model?: string | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  paymentConditions?: string | null;
  includedServices?: string | null;
  observations?: string | null;
  score: number;
  category: 'economy' | 'premium' | 'mid-range';
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface QuoteListResponse {
  quotes: TireQuote[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalQuotes: number;
  totalCompanies: number;
  avgPrice: number;
  lowestPrice: number | null;
  bestDeal: { company: string; brand: string; score: number; price: number } | null;
  premiumCount: number;
  economyCount: number;
}

export interface BrandPrice {
  brand: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export interface CompanyRanking {
  company: string;
  avgScore: number;
  avgPrice: number | null;
  quoteCount: number;
}

export interface PriceDistribution {
  distribution: { label: string; count: number }[];
  premiumVsEconomy: { name: string; value: number }[];
}

export interface Insight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
}

export interface QuoteFilters {
  search?: string;
  company?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  hasInstallment?: boolean;
  hasServices?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
