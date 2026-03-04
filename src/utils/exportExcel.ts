import * as XLSX from "xlsx";
import { Transaction } from "./types";

/**
 * Exports an array of transactions to an Excel (.xlsx) file.
 * 
 * @param transactions - The list of transactions to export.
 * @param filename - Optional custom filename. Defaults to expenses-YYYY-MM-DD.xlsx.
 */
export function exportTransactionsToExcel(transactions: Transaction[], filename?: string) {
    // 1. Format the data for Excel
    const formatted = transactions.map(t => ({
        Date: t.date,
        Merchant: t.merchant,
        Category: t.category,
        Amount: t.amount,
        Notes: t.notes || "",
        Recurring: t.recurring ? "Yes" : "No",
        "Recurrence Type": t.recurrenceType || ""
    }));

    // 2. Create the worksheet
    const worksheet = XLSX.utils.json_to_sheet(formatted);

    // 3. Set column widths for better readability
    const wscols = [
        { wch: 12 }, // Date
        { wch: 25 }, // Merchant
        { wch: 15 }, // Category
        { wch: 10 }, // Amount
        { wch: 30 }, // Notes
        { wch: 10 }, // Recurring
        { wch: 15 }  // Recurrence Type
    ];
    worksheet["!cols"] = wscols;

    // 4. Create the workbook and append the sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // 5. Generate filename
    if (!filename) {
        const today = new Date().toISOString().split("T")[0];
        filename = `expenses-${today}.xlsx`;
    }

    // 6. Write the file and trigger download
    XLSX.writeFile(workbook, filename);
}
