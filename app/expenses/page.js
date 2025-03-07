"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    startDate: "",
    endDate: "",
    category: "",
  });
  const [pagination, setPagination] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        ...filters,
      });

      const response = await fetch(`/api/expenses?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Giderler yüklenirken bir hata oluştu");
      }

      setExpenses(data.expenses);
      setPagination(data.pagination);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu gideri silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Gider silinirken bir hata oluştu");
      }

      setExpenses(expenses.filter((expense) => expense._id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const categoryLabels = {
    elektrik: "Elektrik",
    su: "Su",
    doğalgaz: "Doğalgaz",
    kira: "Kira",
    maaş: "Maaş",
    malzeme: "Malzeme",
    bakım: "Bakım",
    diğer: "Diğer",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Giderler</h1>
        <Link
          href="/expenses/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Yeni Gider Ekle
        </Link>
      </div>

      {/* Filtreler */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {expenses.map((expense) => (
                <tr
                  key={expense._id}
                  className="hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-200">
                      {expense.title}
                    </div>
                    {expense.description && (
                      <div className="text-sm text-gray-400">
                        {expense.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900/50 text-blue-200 border border-blue-700/50">
                      {categoryLabels[expense.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(expense.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-red-400">
                    ₺{(expense.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <Link
                      href={`/expenses/${expense._id}/edit`}
                      className="text-green-400 hover:text-green-300 transition-colors duration-200"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sayfalama */}
      {pagination && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Toplam {pagination.total} kayıt
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Önceki
            </button>
            <span className="px-4 py-2">
              Sayfa {filters.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={!pagination.hasMore}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
