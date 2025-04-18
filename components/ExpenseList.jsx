'use client';
import { useState, useEffect } from 'react';

export default function ExpenseList({ dateRange, refreshKey, onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', category: '', date: '' });

  const fetchExpenses = async () => {
    try {
      const url = dateRange
        ? `/api/expenses?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        : '/api/expenses';
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setExpenses([]);
      } else {
        setExpenses(data);
        setError('');
      }
    } catch (err) {
      setError('Failed to load expenses');
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [dateRange, refreshKey]);

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setEditForm({
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('id', editingId);
      formData.append('amount', editForm.amount);
      formData.append('category', editForm.category);
      formData.append('date', editForm.date);

      const response = await fetch('/api/expenses', {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setEditingId(null);
        setEditForm({ amount: '', category: '', date: '' });
        await fetchExpenses();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError('Failed to update expense');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        await fetchExpenses();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  return (
    <div className="mb-12">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {expenses.length === 0 ? (
        <p className="text-gray-600">No expenses found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100 text-left text-sm uppercase tracking-wide font-semibold">
                <th className="py-3 px-4 border-b">Amount</th>
                <th className="py-3 px-4 border-b">Category</th>
                <th className="py-3 px-4 border-b">Date</th>
                <th className="py-3 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50 transition">
                  {editingId === expense._id ? (
                    <>
                      <td className="py-3 px-4 border-b">
                        <input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          step="0.01"
                          required
                        />
                      </td>
                      <td className="py-3 px-4 border-b">
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          required
                        >
                          <option value="Food">Food</option>
                          <option value="Travel">Travel</option>
                          <option value="Utilities">Utilities</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Other">Other</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 border-b">
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                          required
                        />
                      </td>
                      <td className="py-3 px-4 border-b flex space-x-2">
                        <button
                          onClick={handleEditSubmit}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 border-b">${expense.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 border-b">{expense.category}</td>
                      <td className="py-3 px-4 border-b">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 border-b flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
