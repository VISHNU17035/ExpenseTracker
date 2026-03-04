import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
  parseISO,
  isToday,
  isYesterday,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
} from "date-fns";
import { useTheme } from '@/contexts/ThemeContext';
import { useTransactions } from '@/contexts/TransactionContext';
import { Category, CATEGORY_COLORS, CATEGORY_ICONS, Transaction } from '@/lib/types';
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

type Tab = "Daily" | "Weekly" | "Monthly" | "Yearly";
const TABS: Tab[] = ["Daily", "Weekly", "Monthly", "Yearly"];

function NoData() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-5xl mb-3 opacity-60">📊</div>
      <p className="text-slate-700 dark:text-slate-300" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
        Not enough data yet
      </p>
      <p className="text-slate-400 dark:text-slate-500 mt-1" style={{ fontSize: "0.82rem" }}>
        Start logging expenses to see insights.
      </p>
    </div>
  );
}

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 flex-1 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
      <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p className="text-slate-900 dark:text-white mt-1" style={{ fontWeight: 700, fontSize: "1.6rem" }}>
        {value}
      </p>
      {sub && <p className="text-indigo-500 dark:text-indigo-400 font-medium" style={{ fontSize: "0.75rem" }}>{sub}</p>}
    </div>
  );
}

function CategoryBreakdown({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    transactions.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([cat, amt]) => ({ name: cat as Category, value: amt! }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) return <NoData />;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <PieChart width={220} height={180}>
          <Pie
            data={data}
            cx={110}
            cy={90}
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
            itemStyle={{ color: "#fff" }}
          />
        </PieChart>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[d.name] }}
            />
            <span className="text-slate-600 dark:text-slate-300 flex-1" style={{ fontSize: "0.85rem" }}>
              {CATEGORY_ICONS[d.name]} {d.name}
            </span>
            <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              ₹{d.value.toLocaleString("en-IN")}
            </span>
            <span className="text-slate-400 dark:text-slate-500 w-10 text-right" style={{ fontSize: "0.75rem" }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- DAILY TAB ----
function DailyTab({ transactions, selectedDate }: { transactions: Transaction[], selectedDate: Date }) {
  const targetDateStr = useMemo(() => format(selectedDate, "yyyy-MM-dd"), [selectedDate]);
  const selectedTxns = useMemo(() => transactions.filter((t) => t.date === targetDateStr), [transactions, targetDateStr]);
  const total = useMemo(() => selectedTxns.reduce((s, t) => s + t.amount, 0), [selectedTxns]);

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SummaryCard
          label="Total Spent"
          value={`₹${total.toLocaleString("en-IN")}`}
          sub={format(selectedDate, "EEEE")}
        />
        <SummaryCard
          label="Transactions"
          value={String(selectedTxns.length)}
          sub="for this day"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
        <h3 className="text-slate-800 dark:text-slate-200 mb-4" style={{ fontWeight: 700, fontSize: "1rem" }}>
          Category Breakdown
        </h3>
        <CategoryBreakdown transactions={selectedTxns} />
      </div>

      {selectedTxns.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-slate-800 dark:text-slate-200 mb-4" style={{ fontWeight: 700, fontSize: "1rem" }}>
            Transactions Map
          </h3>
          <div className="flex flex-col gap-3">
            {selectedTxns.map((t) => (
              <div key={t.id} className="flex items-center gap-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors rounded-lg px-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl shadow-sm">
                  {CATEGORY_ICONS[t.category]}
                </div>
                <div className="flex-1">
                  <span className="block text-slate-800 dark:text-slate-200" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {t.merchant}
                  </span>
                  {t.notes && <span className="block text-slate-400 dark:text-slate-500 mt-0.5" style={{ fontSize: "0.75rem" }}>{t.notes}</span>}
                </div>
                <span className="text-slate-900 dark:text-white" style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  ₹{t.amount.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- WEEKLY TAB ----
function WeeklyTab({
  transactions,
  selectedDate,
  onDayClick,
}: {
  transactions: Transaction[];
  selectedDate: Date;
  onDayClick: (date: Date) => void;
}) {
  const { weekStart, weekEnd } = useMemo(() => ({
    weekStart: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    weekEnd: endOfWeek(selectedDate, { weekStartsOn: 1 })
  }), [selectedDate]);

  const weekTxns = useMemo(() => transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start: weekStart, end: weekEnd })
  ), [transactions, weekStart, weekEnd]);

  const total = useMemo(() => weekTxns.reduce((s, t) => s + t.amount, 0), [weekTxns]);

  const barData = useMemo(() => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map((day) => {
      const label = format(day, "EEE");
      const amt = weekTxns
        .filter((t) => t.date === format(day, "yyyy-MM-dd"))
        .reduce((s, t) => s + t.amount, 0);
      return { day: label, amount: amt, fullDate: day };
    });
  }, [weekStart, weekEnd, weekTxns]);

  const hasData = weekTxns.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SummaryCard
          label="This Week"
          value={`₹${total.toLocaleString("en-IN")}`}
          sub={`${format(weekStart, "dd MMM")} – ${format(weekEnd, "dd MMM")}`}
        />
        <SummaryCard
          label="Transactions"
          value={String(weekTxns.length)}
          sub="this week"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
        <h3 className="text-slate-800 dark:text-slate-200 mb-5" style={{ fontWeight: 700, fontSize: "1rem" }}>
          Daily Spending Trend
        </h3>
        {!hasData ? (
          <NoData />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barSize={34}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Spent"]}
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff", fontWeight: 500 }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar
                dataKey="amount"
                radius={[6, 6, 6, 6]}
                onClick={(data) => {
                  if (data && data.fullDate) {
                    onDayClick(data.fullDate);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.amount > 0 ? "#6366f1" : "#cbd5e1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-slate-800 dark:text-slate-200 mb-4" style={{ fontWeight: 700, fontSize: "1rem" }}>
            Category Breakdown
          </h3>
          <CategoryBreakdown transactions={weekTxns} />
        </div>
      )}
    </div>
  );
}

// ---- MONTHLY TAB ----
function MonthlyTab({ transactions, selectedDate }: { transactions: Transaction[], selectedDate: Date }) {
  const { monthStart, monthEnd } = useMemo(() => ({
    monthStart: startOfMonth(selectedDate),
    monthEnd: endOfMonth(selectedDate)
  }), [selectedDate]);

  const monthTxns = useMemo(() => transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
  ), [transactions, monthStart, monthEnd]);

  const total = useMemo(() => monthTxns.reduce((s, t) => s + t.amount, 0), [monthTxns]);

  const lineData = useMemo(() => {
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const amt = monthTxns
        .filter((t) => t.date === dateStr)
        .reduce((s, t) => s + t.amount, 0);
      return { day: format(day, "d"), amount: amt };
    });
  }, [monthStart, monthEnd, monthTxns]);

  const hasData = monthTxns.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SummaryCard
          label="This Month"
          value={`₹${total.toLocaleString("en-IN")}`}
          sub={format(selectedDate, "MMMM yyyy")}
        />
        <SummaryCard
          label="Transactions"
          value={String(monthTxns.length)}
          sub="for this month"
        />
      </div>

      {!hasData ? (
        <NoData />
      ) : (
        <>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
            <h3 className="text-slate-800 dark:text-slate-200 mb-5" style={{ fontWeight: 700, fontSize: "1rem" }}>
              Daily Spending Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  interval={4}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Spent"]}
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff", fontWeight: 500 }}
                  itemStyle={{ color: "#fff" }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#1e293b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
            <h3 className="text-slate-800 dark:text-slate-200 mb-4" style={{ fontWeight: 700, fontSize: "1rem" }}>
              Category Breakdown
            </h3>
            <CategoryBreakdown transactions={monthTxns} />
          </div>
        </>
      )}
    </div>
  );
}

// ---- YEARLY TAB ----
function YearlyTab({
  transactions,
  selectedDate,
  onMonthClick,
}: {
  transactions: Transaction[];
  selectedDate: Date;
  onMonthClick: (date: Date) => void;
}) {
  const { yearStart, yearEnd } = useMemo(() => ({
    yearStart: startOfYear(selectedDate),
    yearEnd: endOfYear(selectedDate)
  }), [selectedDate]);

  const yearTxns = useMemo(() => transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start: yearStart, end: yearEnd })
  ), [transactions, yearStart, yearEnd]);

  const total = useMemo(() => yearTxns.reduce((s, t) => s + t.amount, 0), [yearTxns]);

  const barData = useMemo(() => {
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
    return months.map((month) => {
      const key = format(month, "yyyy-MM");
      const amt = yearTxns
        .filter((t) => t.date.startsWith(key))
        .reduce((s, t) => s + t.amount, 0);
      return { month: format(month, "MMM"), amount: amt, fullDate: month };
    });
  }, [yearStart, yearEnd, yearTxns]);

  const hasData = yearTxns.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <SummaryCard
          label="This Year"
          value={`₹${total.toLocaleString("en-IN")}`}
          sub={format(selectedDate, "yyyy")}
        />
        <SummaryCard
          label="Transactions"
          value={String(yearTxns.length)}
          sub="for the year"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
        <h3 className="text-slate-800 dark:text-slate-200 mb-5" style={{ fontWeight: 700, fontSize: "1rem" }}>
          Monthly Spending
        </h3>
        {!hasData ? (
          <NoData />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={26}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Spent"]}
                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff", fontWeight: 500 }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar
                dataKey="amount"
                radius={[6, 6, 6, 6]}
                onClick={(data) => {
                  if (data && data.fullDate) {
                    onMonthClick(data.fullDate);
                  }
                }}
                style={{ cursor: "pointer" }}
              >
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.amount > 0 ? "#ec4899" : "#cbd5e1"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {hasData && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
          <h3 className="text-slate-800 dark:text-slate-200 mb-4" style={{ fontWeight: 700, fontSize: "1rem" }}>
            Category Breakdown
          </h3>
          <CategoryBreakdown transactions={yearTxns} />
        </div>
      )}
    </div>
  );
}

// ---- MAIN SCREEN ----
export function StatisticsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<Tab>("Monthly");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleNext = () => {
    switch (activeTab) {
      case "Daily": setSelectedDate(addDays(selectedDate, 1)); break;
      case "Weekly": setSelectedDate(addWeeks(selectedDate, 1)); break;
      case "Monthly": setSelectedDate(addMonths(selectedDate, 1)); break;
      case "Yearly": setSelectedDate(addYears(selectedDate, 1)); break;
    }
  };

  const handlePrev = () => {
    switch (activeTab) {
      case "Daily": setSelectedDate(subDays(selectedDate, 1)); break;
      case "Weekly": setSelectedDate(subWeeks(selectedDate, 1)); break;
      case "Monthly": setSelectedDate(subMonths(selectedDate, 1)); break;
      case "Yearly": setSelectedDate(subYears(selectedDate, 1)); break;
    }
  };

  const dateLabel = useMemo(() => {
    switch (activeTab) {
      case "Daily":
        if (isToday(selectedDate)) return "Today";
        if (isYesterday(selectedDate)) return "Yesterday";
        return format(selectedDate, "EEE, dd MMM yyyy");
      case "Weekly":
        const ws = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const we = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(ws, "dd MMM")} – ${format(we, "dd MMM yyyy")}`;
      case "Monthly":
        return format(selectedDate, "MMMM yyyy");
      case "Yearly":
        return format(selectedDate, "yyyy");
    }
  }, [activeTab, selectedDate]);

  return (
    <>
      {/* Header (No longer sticky to allow scrolling naturally per requirements) */}
      <div className="bg-white dark:bg-slate-800 px-5 pt-8 pb-5 shadow-sm border-b border-slate-100 dark:border-slate-800 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-900 dark:text-white" style={{ fontWeight: 800, fontSize: "1.3rem" }}>
              Statistics
            </h1>
            <p className="text-slate-500 dark:text-slate-400" style={{ fontSize: "0.8rem", marginTop: "-2px" }}>
              Your spending insights
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Dynamic Date Navigator */}
        <div className="flex items-center justify-between mt-5 bg-slate-50 dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-600 dark:text-slate-400 transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500 dark:text-indigo-400" />
            <span className="text-slate-900 dark:text-white" style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              {dateLabel}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm text-slate-600 dark:text-slate-400 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-900/50 rounded-xl p-1.5 mt-5 transition-colors duration-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-center transition-all duration-200 ${activeTab === tab
                ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400 box-shadow-md"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              style={{
                fontSize: "0.85rem",
                fontWeight: activeTab === tab ? 600 : 500,
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        <motion.div
          key={activeTab + selectedDate.getTime()}
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
        >
          {activeTab === "Daily" && <DailyTab transactions={transactions} selectedDate={selectedDate} />}
          {activeTab === "Weekly" && (
            <WeeklyTab
              transactions={transactions}
              selectedDate={selectedDate}
              onDayClick={(date) => {
                setSelectedDate(date);
                setActiveTab("Daily");
              }}
            />
          )}
          {activeTab === "Monthly" && <MonthlyTab transactions={transactions} selectedDate={selectedDate} />}
          {activeTab === "Yearly" && (
            <YearlyTab
              transactions={transactions}
              selectedDate={selectedDate}
              onMonthClick={(date) => {
                setSelectedDate(date);
                setActiveTab("Monthly");
              }}
            />
          )}
        </motion.div>
      </div>
    </>
  );
}
