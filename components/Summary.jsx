'use client';
import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Summary({ dateRange, refreshKey }) {
  const [summaryType, setSummaryType] = useState('category');
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState('');
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setError('');
        setSummaries([]);
        const url = dateRange
          ? `/api/expenses/summary?type=${summaryType}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          : `/api/expenses/summary?type=${summaryType}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          setSummaries([]);
        } else {
          setSummaries(data);
          setChartKey((prev) => prev + 1);
        }
      } catch (err) {
        setError('Failed to load summaries');
        setSummaries([]);
      }
    };
    fetchSummaries();
  }, [summaryType, dateRange, refreshKey]);

  const chartData = {
    labels: summaries.map((s) => s.label),
    datasets: [
      {
        label: `Total Expenses by ${summaryType === 'category' ? 'Category' : 'Month'}`,
        data: summaries.map((s) => s.total),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `Expenses by ${summaryType === 'category' ? 'Category' : 'Month'}`,
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `$${value}`,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Summary Type</label>
        <select
          value={summaryType}
          onChange={(e) => setSummaryType(e.target.value)}
          className="w-full sm:w-48 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="category">By Category</option>
          <option value="month">By Month</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!error && summaries.length === 0 ? (
        <p className="text-gray-500">No data available for the selected range.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full bg-white text-sm text-gray-700">
              <thead className="bg-gray-100">
                <tr className="text-left uppercase tracking-wide font-semibold text-sm">
                  <th className="py-3 px-4 border-b">{summaryType === 'category' ? 'Category' : 'Month'}</th>
                  <th className="py-3 px-4 border-b">Total ($)</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary) => (
                  <tr key={summary.label} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 border-b">{summary.label}</td>
                    <td className="py-3 px-4 border-b">${summary.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-w-3xl mx-auto pt-6">
            <Bar key={chartKey} data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}
