import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Calendar, Repeat, ArrowRight, Store, FileText } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { useTransactions } from '@/contexts/TransactionContext';
import { Category, CATEGORIES, Transaction, CATEGORY_ICONS } from '@/lib/types';
import { toast } from "sonner";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  editing?: Transaction | null;
  selectedDate: string;
}

export function AddExpenseModal({ open, onClose, editing, selectedDate }: AddExpenseModalProps) {
  const { add, update, addRecurring, updateRecurring, stopRecurring } = useTransactions();
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(selectedDate);
  const [saving, setSaving] = useState(false);

  // Recurring state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [endDate, setEndDate] = useState("");
  const [editMode, setEditMode] = useState<"instance" | "series">("instance");

  useEffect(() => {
    if (open) {
      if (editing) {
        setAmount(editing.amount.toString());
        setMerchant(editing.merchant || "");
        setCategory(editing.category);
        setNotes(editing.notes || "");
        setDate(editing.date);
        setIsRecurring(!!editing.recurring);
        setRecurrenceType(editing.recurrenceType || "monthly");
        // End date is usually on the rule, if we have recurrenceRuleId we could look it up
        setEndDate("");
      } else {
        setAmount("");
        setMerchant("");
        setCategory("Food");
        setNotes("");
        setDate(selectedDate);
        setIsRecurring(false);
        setRecurrenceType("monthly");
        setEndDate("");
      }
    }
  }, [editing, selectedDate, open]);

  const handleSave = async () => {
    const amt = Number(amount);
    if (!amount || amt <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    if (!merchant.trim()) {
      toast.error("Please enter merchant/description.");
      return;
    }
    if (isRecurring && endDate && !isValid(parseISO(endDate))) {
      toast.error("Please enter a valid end date for recurring expense.");
      return;
    }

    setSaving(true);
    try {
      const txnData = {
        amount: amt,
        merchant: merchant.trim(),
        category,
        notes: notes.trim(),
        date,
        source: "manual" as const,
        recurring: isRecurring,
        recurrenceType: isRecurring ? recurrenceType : undefined
      };

      if (editing) {
        if (editMode === "series" && editing.recurrenceRuleId) {
          await updateRecurring(editing.recurrenceRuleId, {
            amount: amt,
            merchant: merchant.trim(),
            category,
            notes: notes.trim(),
            recurrenceType,
            startDate: date,
            endDate: endDate || undefined,
          });
          toast.success("Recurring series updated!");
        } else {
          await update(editing.id, txnData);
          toast.success("Expense updated!");
        }
      } else {
        if (isRecurring) {
          await addRecurring({
            amount: amt,
            merchant: merchant.trim(),
            category,
            notes: notes.trim(),
            recurrenceType,
            startDate: date,
            endDate: endDate || undefined,
          });
          toast.success("Recurring expense created!");
        } else {
          await add(txnData);
          toast.success("Expense added!");
        }
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Failed to save.");
      } else {
        toast.error("Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-[640px] bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-slate-100 dark:border-slate-800"
          >
            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-slate-900 dark:text-white" style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                {editing ? (editMode === "series" ? "Edit Recurring Series" : "Edit Expense Instance") : "Add Expense"}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Edit Mode Toggle for Recurring */}
            {editing && editing.recurring && (
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => setEditMode("instance")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${editMode === "instance"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-600"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  Edit instance only
                </button>
                <button
                  onClick={() => setEditMode("series")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${editMode === "series"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-600"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
                >
                  Edit entire series
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 px-5 pt-4 pb-10 space-y-5">
              {/* ── Amount ── */}
              <div>
                <label className="text-slate-600 dark:text-slate-400 mb-1.5 block" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Amount *</label>
                <div className="relative">
                  <ArrowRight size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 outline-none focus:bg-white dark:focus:bg-slate-800 transition-all border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-white font-bold text-lg"
                  />
                </div>
              </div>

              {/* ── Merchant ── */}
              <div>
                <label className="text-slate-600 dark:text-slate-400 mb-1.5 block" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Merchant / Description *</label>
                <div className="relative">
                  <Store size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Netflix, Rent, Uber"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 outline-none focus:bg-white dark:focus:bg-slate-800 transition-all border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* ── Category ── */}
              <div>
                <label className="text-slate-600 dark:text-slate-400 mb-2.5 block" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Category *</label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat: Category) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl border transition-all ${category === cat
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                    >
                      <span className="text-xl">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-[0.7rem] font-semibold">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Notes ── */}
              <div>
                <label className="text-slate-600 dark:text-slate-400 mb-1.5 block" style={{ fontSize: "0.8rem", fontWeight: 600 }}>Notes (Optional)</label>
                <div className="relative">
                  <FileText size={16} className="absolute left-3 top-3.5 text-slate-400" />
                  <textarea
                    placeholder="What was this for?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none text-slate-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              {/* ── Recurring Section ── */}
              {(!editing || (editing && editMode === "series")) ? (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-4 border border-indigo-100/50 dark:border-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Repeat size={20} />
                      </div>
                      <div>
                        <p className="text-slate-900 dark:text-white" style={{ fontWeight: 600, fontSize: "0.9rem" }}>Recurring Expense</p>
                        <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.75rem" }}>Create a repeating schedule</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecurring(!isRecurring)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none ${isRecurring ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-700"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isRecurring ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  {isRecurring && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-4 pt-4 border-t border-indigo-100/50 dark:border-indigo-500/10 space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-indigo-900/60 dark:text-indigo-400/60 mb-1.5 block" style={{ fontSize: "0.75rem", fontWeight: 600 }}>Repeat Frequency</label>
                          <select
                            value={recurrenceType}
                            onChange={(e) => setRecurrenceType(e.target.value as any)}
                            className="w-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-indigo-900/60 dark:text-indigo-400/60 mb-1.5 block" style={{ fontSize: "0.75rem", fontWeight: 600 }}>End Date (Optional)</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-500/20 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-indigo-200 dark:shadow-none font-bold text-[0.95rem]"
              >
                {saving ? "Saving..." : editing ? (editMode === "series" ? "Update Series" : "Update Instance") : "Save Expense"}
              </button>

              {editing && editing.recurring && editMode === "series" && (
                <button
                  type="button"
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await stopRecurring(editing.recurrenceRuleId!);
                      toast.success("Recurrence stopped");
                      onClose();
                    } catch (err: any) {
                      toast.error("Failed to stop recurrence");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all font-semibold text-xs"
                >
                  End Recurrence (Stop future payments)
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}