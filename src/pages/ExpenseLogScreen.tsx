import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, LogOut, User, TrendingDown, ChevronLeft, ChevronRight, Calendar, Repeat, Download } from "lucide-react";
import { format, subDays, addDays, isToday, isYesterday, startOfDay, isBefore, addWeeks, addMonths, addYears, parseISO } from "date-fns";
import { CATEGORY_ICONS } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { Transaction, RecurringExpense } from '@/lib/types';
import { ExpenseCard } from '@/components/log/ExpenseCard';
import { AddExpenseModal } from '@/modals/AddExpenseModal';
import { exportTransactionsToExcel } from '@/utils/exportExcel';

interface UpcomingBill {
  id: string;
  merchant: string;
  amount: number;
  category: RecurringExpense["category"];
  date: Date;
  recurrenceType: string;
}

export function ExpenseLogScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { transactions, loading, recurringExpenses } = useTransactions();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const upcomingBills = useMemo(() => {
    const bills: UpcomingBill[] = [];
    const today = startOfDay(new Date());
    const limit = addDays(today, 30);

    recurringExpenses.forEach(rule => {
      if (!rule.active) return;

      let nextDate = parseISO(rule.startDate);
      // Advance to the first occurrence >= today
      while (isBefore(nextDate, today)) {
        switch (rule.recurrenceType) {
          case "weekly": nextDate = addWeeks(nextDate, 1); break;
          case "monthly": nextDate = addMonths(nextDate, 1); break;
          case "yearly": nextDate = addYears(nextDate, 1); break;
        }
      }

      if (isBefore(nextDate, limit) || format(nextDate, "yyyy-MM-dd") === format(limit, "yyyy-MM-dd")) {
        bills.push({
          id: rule.id,
          merchant: rule.merchant,
          amount: rule.amount,
          category: rule.category,
          date: nextDate,
          recurrenceType: rule.recurrenceType
        });
      }
    });

    return bills.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [recurringExpenses]);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  const dateLabel = useMemo(() => {
    if (isToday(selectedDate)) return "Today";
    if (isYesterday(selectedDate)) return "Yesterday";
    return format(selectedDate, "MMMM d, yyyy");
  }, [selectedDate]);

  const selectedTransactions = useMemo(
    () => transactions.filter((t) => t.date === selectedDateStr),
    [transactions, selectedDateStr]
  );

  const totalSelected = useMemo(
    () => selectedTransactions.reduce((sum, t) => sum + t.amount, 0),
    [selectedTransactions]
  );

  const nextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const prevDay = () => setSelectedDate(prev => subDays(prev, 1));

  const handleEdit = (txn: Transaction) => {
    setEditingTxn(txn);
    setModalOpen(true);
  };

  const handleAddClose = () => {
    setModalOpen(false);
    setEditingTxn(null);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 px-5 pt-8 pb-5 shadow-sm border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Hello,</p>
            <p className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: "1.25rem", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
              {user?.displayName || user?.email?.split("@")[0]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Date + Summary */}
        <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-5 text-white shadow-sm border dark:border-slate-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4 bg-white/5 rounded-lg p-1.5 border border-white/10">
            <button
              onClick={prevDay}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-indigo-200" />
              <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {dateLabel}
              </span>
            </div>
            <button
              onClick={nextDay}
              disabled={isToday(selectedDate)}
              className={`p-2 rounded-lg transition-colors ${isToday(selectedDate) ? "opacity-50 cursor-not-allowed" : "hover:bg-white/20"
                }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-slate-300 dark:text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 500 }}>Total Spent ({dateLabel})</p>
              <p style={{ fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.02em" }}>
                ₹{totalSelected.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => exportTransactionsToExcel(transactions)}
                className="text-indigo-200 hover:text-white transition-colors flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2"
                title="Export all transactions to Excel"
              >
                <Download size={16} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-900 dark:text-white" style={{ fontWeight: 600, fontSize: "1rem" }}>
            {dateLabel}'s Expenses
          </h2>
          <span className="text-slate-400 dark:text-slate-500" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
            {format(selectedDate, "EEE, dd MMM")}
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 h-20 animate-pulse border border-slate-100 dark:border-slate-800" />
            ))}
          </div>
        ) : selectedTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            {transactions.length === 0 ? (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                <h3 className="text-xl font-bold mb-2">Welcome to ExpenseTracker! 👋</h3>
                <p className="opacity-90 text-sm mb-4">Start tracking your daily expenses to get better insights into your financial health. It's simple and secure.</p>
                <ul className="space-y-2 text-sm opacity-90">
                  <li className="flex items-center gap-2"><span>✨</span> Tap <strong className="bg-white/20 px-1.5 py-0.5 rounded">Log Expense</strong> to add your first transaction</li>
                  <li className="flex items-center gap-2"><span>📊</span> Check the Statistics tab to view category breakdowns</li>
                  <li className="flex items-center gap-2"><span>🔄</span> Add recurring bills to track your fixed monthly expenses</li>
                </ul>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-5xl mb-4 opacity-70">💸</div>
                <p className="text-slate-700 dark:text-slate-300" style={{ fontWeight: 500, fontSize: "0.95rem" }}>
                  No expenses {dateLabel.toLowerCase()}
                </p>
                <p className="text-slate-400 dark:text-slate-500 mt-1" style={{ fontSize: "0.82rem" }}>
                  Add a transaction to get started
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="flex flex-col gap-3">
              {selectedTransactions.map((txn) => (
                <ExpenseCard key={txn.id} transaction={txn} onEdit={handleEdit} />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Summary & Action Row */}
        <div className="mt-6 mb-12 bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="flex flex-col">
            <span className="text-slate-500 dark:text-slate-400" style={{ fontWeight: 500, fontSize: "0.75rem" }}>
              {dateLabel}'s Total
            </span>
            <span className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: "1.3rem" }}>
              ₹{totalSelected.toLocaleString("en-IN")}
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
            style={{ fontWeight: 600, fontSize: "0.9rem" }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Log Expense</span>
          </button>
        </div>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && isToday(selectedDate) && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Repeat size={18} className="text-indigo-500" />
              <h2 className="text-slate-900 dark:text-white" style={{ fontWeight: 600, fontSize: "1rem" }}>
                Upcoming Bills
              </h2>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
              {upcomingBills.map((bill, idx) => (
                <div
                  key={bill.id}
                  className={`flex items-center justify-between p-4 ${idx !== upcomingBills.length - 1 ? "border-b border-slate-50 dark:border-slate-700/50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-sm">
                      {CATEGORY_ICONS[bill.category]}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600, fontSize: "0.85rem" }}>{bill.merchant}</p>
                      <p className="text-slate-400 dark:text-slate-500" style={{ fontSize: "0.7rem" }}>
                        {format(bill.date, "MMM dd")} • {bill.recurrenceType}
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    ₹{bill.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>



      <AddExpenseModal
        open={modalOpen}
        onClose={handleAddClose}
        editing={editingTxn}
        selectedDate={selectedDateStr}
      />
    </>
  );
}
