import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, Trash2, Image, ChevronDown, ChevronUp, Repeat } from "lucide-react";
import { Transaction, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';
import { useTransactions } from '@/contexts/TransactionContext';
import { toast } from "sonner";

interface ExpenseCardProps {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
}

export function ExpenseCard({ transaction, onEdit }: ExpenseCardProps) {
  const { remove } = useTransactions();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    await remove(transaction.id);
    toast.success("Expense deleted.");
  };

  const color = CATEGORY_COLORS[transaction.category];
  const icon = CATEGORY_ICONS[transaction.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-200"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Category Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-slate-900 dark:text-white truncate" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {transaction.merchant}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-slate-500 dark:text-slate-400 text-[0.8rem] truncate font-medium">
              {transaction.category}
            </span>
            {transaction.source === "screenshot" && (
              <Image size={12} className="text-slate-400 dark:text-slate-500" />
            )}
            {transaction.notes && (
              <span className="text-slate-400 dark:text-slate-500 truncate" style={{ fontSize: "0.75rem" }}>
                {transaction.notes}
              </span>
            )}
            {transaction.recurring && (
              <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider">
                <Repeat size={10} strokeWidth={3} />
                {transaction.recurrenceType}
              </div>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            ₹{transaction.amount.toLocaleString("en-IN")}
          </span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={handleDelete}
              className={`p-1 rounded-md transition-colors ${confirmDelete
                ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
                : "hover:bg-red-50 text-slate-400 hover:text-red-500 dark:hover:bg-red-900/20"
                }`}
            >
              <Trash2 size={12} />
            </button>
            {(transaction.notes || transaction.imageUrl) && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-slate-50 dark:border-slate-700/50 pt-3">
              {transaction.notes && (
                <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.85rem" }}>
                  📝 {transaction.notes}
                </p>
              )}
              {transaction.imageUrl && (
                <img
                  src={transaction.imageUrl}
                  alt="Receipt"
                  className="w-full max-h-48 object-contain rounded-lg border border-slate-100 dark:border-slate-700"
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm delete hint */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-3"
          >
            <p className="text-red-500 text-center" style={{ fontSize: "0.75rem" }}>
              Tap delete again to confirm
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
