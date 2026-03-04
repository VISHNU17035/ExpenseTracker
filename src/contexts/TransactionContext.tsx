import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Transaction, RecurringExpense } from "@/lib/types";
import {
  getUserTransactions, addTransaction, updateTransaction, deleteTransaction,
  getUserRecurringRules, addRecurringRule, updateRecurringRule, deleteRecurringRule
} from "@/lib/store";
import { useAuth } from "@/contexts/AuthContext";
import {
  format, parseISO, addWeeks, addMonths, addYears,
  isBefore, startOfDay, addDays
} from "date-fns";

interface TransactionContextType {
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  loading: boolean;
  refresh: () => Promise<void>;
  add: (data: Omit<Transaction, "id" | "userId" | "createdAt">) => Promise<Transaction>;
  update: (id: string, data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>) => Promise<Transaction>;
  remove: (id: string) => Promise<void>;
  addRecurring: (data: Omit<RecurringExpense, "id" | "userId" | "createdAt" | "active">) => Promise<RecurringExpense>;
  updateRecurring: (id: string, data: Partial<Omit<RecurringExpense, "id" | "userId" | "createdAt">>) => Promise<RecurringExpense>;
  stopRecurring: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(false);

  const syncRecurring = useCallback(async (allTxns: Transaction[], rules: RecurringExpense[]) => {
    if (!user) return false;
    let modified = false;
    const todayPlus7 = addDays(startOfDay(new Date()), 7);

    for (const rule of rules) {
      if (!rule.active) continue;

      let currentDate = parseISO(rule.startDate);
      const endLimit = rule.endDate ? parseISO(rule.endDate) : todayPlus7;
      const actualLimit = isBefore(todayPlus7, endLimit) ? todayPlus7 : endLimit;

      while (isBefore(currentDate, actualLimit) || format(currentDate, "yyyy-MM-dd") === format(actualLimit, "yyyy-MM-dd")) {
        const dateStr = format(currentDate, "yyyy-MM-dd");

        // Check if transaction already exists for this rule and date
        const exists = allTxns.find(t => t.recurrenceRuleId === rule.id && t.date === dateStr);

        if (!exists) {
          await addTransaction(user.uid, {
            amount: rule.amount,
            merchant: rule.merchant,
            category: rule.category,
            notes: rule.notes,
            date: dateStr,
            source: "manual",
            recurring: true,
            recurrenceType: rule.recurrenceType,
            recurrenceRuleId: rule.id
          });
          modified = true;
        }

        // Advance to next instance
        switch (rule.recurrenceType) {
          case "weekly": currentDate = addWeeks(currentDate, 1); break;
          case "monthly": currentDate = addMonths(currentDate, 1); break;
          case "yearly": currentDate = addYears(currentDate, 1); break;
        }
      }
    }

    return modified;
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setRecurringExpenses([]);
      return;
    }

    setLoading(true);

    try {
      // 1. Get current data from Firestore
      const txns = await getUserTransactions(user.uid);
      const rules = await getUserRecurringRules(user.uid);

      // 2. Sync recurring rules (creates new transactions if needed)
      const wasModified = await syncRecurring(txns, rules);

      // 3. If modified, refetch transactions
      if (wasModified) {
        const updatedTxns = await getUserTransactions(user.uid);
        setTransactions(updatedTxns);
      } else {
        setTransactions(txns);
      }

      setRecurringExpenses(rules);
    } catch (error) {
      console.error("Failed to fetch data from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, [user, syncRecurring]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (data: Omit<Transaction, "id" | "userId" | "createdAt">) => {
    if (!user) throw new Error("Not authenticated");
    const txn = await addTransaction(user.uid, data);
    await refresh();
    return txn;
  };

  const update = async (id: string, data: Partial<Omit<Transaction, "id" | "userId" | "createdAt">>) => {
    const txn = await updateTransaction(id, data);
    await refresh();
    return txn;
  };

  const remove = async (id: string) => {
    await deleteTransaction(id);
    await refresh();
  };

  const addRecurring = async (data: Omit<RecurringExpense, "id" | "userId" | "createdAt" | "active">) => {
    if (!user) throw new Error("Not authenticated");
    const rule = await addRecurringRule(user.uid, data);
    await refresh();
    return rule;
  };

  const updateRecurring = async (id: string, data: Partial<Omit<RecurringExpense, "id" | "userId" | "createdAt">>) => {
    const rule = await updateRecurringRule(id, data);
    await refresh();
    return rule;
  };

  const stopRecurring = async (id: string) => {
    await updateRecurringRule(id, { active: false });
    await refresh();
  };

  return (
    <TransactionContext.Provider value={{
      transactions, recurringExpenses, loading, refresh,
      add, update, remove,
      addRecurring, updateRecurring, stopRecurring
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
}
