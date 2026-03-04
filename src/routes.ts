import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { ExpenseLogScreen } from '@/pages/ExpenseLogScreen';
import { StatisticsScreen } from '@/pages/StatisticsScreen';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: ExpenseLogScreen },
      { path: "statistics", Component: StatisticsScreen },
    ],
  },
]);
