import React from "react";
import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";
import { TransactionProvider } from '@/contexts/TransactionContext';

export function Layout() {
  return (
    <TransactionProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 flex justify-center">
        <div className="w-full max-w-[760px] min-h-screen border-x border-transparent sm:border-slate-200 dark:sm:border-slate-800 bg-slate-50 dark:bg-slate-900 relative pb-28">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </TransactionProvider>
  );
}
