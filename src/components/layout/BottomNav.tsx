import React from "react";
import { NavLink } from "react-router";
import { ReceiptText, BarChart2 } from "lucide-react";

const tabs = [
  { to: "/", label: "Log Expenses", icon: ReceiptText },
  { to: "/statistics", label: "Statistics", icon: BarChart2 },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 flex transition-colors duration-200" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="max-w-[760px] w-full mx-auto flex px-2 sm:px-4">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-indigo-50 dark:bg-indigo-900/30" : ""
                    }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}