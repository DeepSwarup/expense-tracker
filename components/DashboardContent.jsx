'use client';
import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import Summary from './Summary';
import DateRangeFilter from './DateRangeFilter';

export default function DashboardContent({ email }) {
  const [dateRange, setDateRange] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFilterChange = (newDateRange) => {
    setDateRange(newDateRange);
  };

  const handleExport = () => {
    const url = dateRange
      ? `/api/expenses/export?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      : '/api/expenses/export';
    window.location.href = url; // Trigger download
  };

  const handleExpenseChange = () => {
    setRefreshKey((prev) => prev + 1); // Trigger refresh
  };

  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome, <span className="font-medium">{email}</span>!</p>
        <form action="/api/auth/signout" method="POST" className="mt-4">
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition"
          >
            Sign Out
          </button>
        </form>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Expense</h2>
        <div className="bg-white shadow rounded-2xl p-6 max-w-xl">
          <ExpenseForm onSuccess={handleExpenseChange} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Filter Expenses</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <DateRangeFilter onFilterChange={handleFilterChange} />
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl transition"
          >
            Export to CSV
          </button>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Recent Expenses</h2>
        <div className="bg-white shadow rounded-2xl p-6">
          <ExpenseList
            dateRange={dateRange}
            refreshKey={refreshKey}
            onRefresh={handleExpenseChange}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Expense Summaries</h2>
        <div className="bg-white shadow rounded-2xl p-6">
          <Summary dateRange={dateRange} refreshKey={refreshKey} />
        </div>
      </section>
    </div>
  );
}
