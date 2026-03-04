export type Category =
  | "Food"
  | "Transport"
  | "Shopping"
  | "Bills"
  | "Entertainment"
  | "Transfers"
  | "Other";

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  category: Category;
  notes?: string;
  date: string; // YYYY-MM-DD
  source: "manual" | "screenshot";
  imageUrl?: string;
  createdAt: string; // ISO datetime

  // Recurring support
  recurring?: boolean;
  recurrenceType?: "weekly" | "monthly" | "yearly";
  recurrenceRuleId?: string;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  category: Category;
  notes?: string;
  recurrenceType: "weekly" | "monthly" | "yearly";
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  active: boolean;
  createdAt: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Transfers",
  "Other",
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#FF6B6B",
  Transport: "#4ECDC4",
  Shopping: "#45B7D1",
  Bills: "#96CEB4",
  Entertainment: "#FFEAA7",
  Transfers: "#C084FC",
  Other: "#94A3B8",
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: "🍽️",
  Transport: "🚗",
  Shopping: "🛍️",
  Bills: "📄",
  Entertainment: "🎬",
  Transfers: "💸",
  Other: "📦",
};
