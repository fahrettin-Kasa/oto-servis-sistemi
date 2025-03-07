"use client";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7C43",
];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("daily"); // daily, weekly, monthly
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().setHours(23, 59, 59, 999))
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    // Varsayılan tarih aralığını ayarla (son 30 gün)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setDateRange({
      startDate: thirtyDaysAgo.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    });
  }, []);

  useEffect(() => {
    fetchReport();
  }, [dateRange, reportType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (dateRange.startDate)
        queryParams.append("startDate", dateRange.startDate);
      if (dateRange.endDate) queryParams.append("endDate", dateRange.endDate);
      queryParams.append("reportType", reportType);

      const response = await fetch(`/api/reports?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Rapor yüklenirken bir hata oluştu");
      }

      setReportData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
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

  // Gider dağılımı için pie chart verisi
  const pieChartData = reportData?.expensesByCategory
    ? Object.entries(reportData.expensesByCategory).map(([name, value]) => ({
        name: categoryLabels[name],
        value,
      }))
    : [];

  // Gelir-gider trend grafiği için veri
  const trendData = reportData?.trendData || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <h1 className="text-3xl font-bold mb-8 text-white text-center">
        Raporlar
      </h1>

      {/* Filtreler */}
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl mb-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rapor Tipi
            </label>
            <select
              value={reportType}
              onChange={handleReportTypeChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="daily">Günlük Rapor</option>
              <option value="weekly">Haftalık Rapor</option>
              <option value="monthly">Aylık Rapor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleDateChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleDateChange}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      {reportData && (
        <>
          {/* Özet Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-400/20">
              <h3 className="text-lg font-semibold text-blue-100 mb-2">
                Toplam Gelir
              </h3>
              <p className="text-4xl font-bold text-white">
                ₺{(reportData.totalIncome || 0).toLocaleString()}
              </p>
              <p className="text-sm text-blue-200 mt-2">
                Seçili tarih aralığındaki toplam gelir
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-red-400/20">
              <h3 className="text-lg font-semibold text-red-100 mb-2">
                Toplam Gider
              </h3>
              <p className="text-4xl font-bold text-white">
                ₺{(reportData.totalExpenses || 0).toLocaleString()}
              </p>
              <p className="text-sm text-red-200 mt-2">
                Seçili tarih aralığındaki toplam gider
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-400/20">
              <h3 className="text-lg font-semibold text-green-100 mb-2">
                Net Kar
              </h3>
              <p className="text-4xl font-bold text-white">
                ₺{(reportData.netProfit || 0).toLocaleString()}
              </p>
              <p className="text-sm text-green-200 mt-2">
                Seçili tarih aralığındaki net kar/zarar
              </p>
            </div>
          </div>

          {/* Gelir Detayları */}
          <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Gelir Detayları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reportData.incomeByType &&
                Object.entries(reportData.incomeByType).map(([type, data]) => (
                  <div
                    key={type}
                    className="bg-gray-700/50 rounded-xl p-6 border border-gray-600"
                  >
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">
                      {type} Gelirleri
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(data.sources).map(([source, amount]) => (
                        <div
                          key={source}
                          className="flex justify-between items-center bg-gray-800/50 p-3 rounded-lg"
                        >
                          <span className="text-gray-300">{source}</span>
                          <span className="font-medium text-green-400">
                            ₺{amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-gray-600 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-200">
                            Toplam
                          </span>
                          <span className="font-bold text-green-400">
                            ₺{data.total.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Grafikler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Gider Dağılımı Pie Chart */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Gider Dağılımı
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₺${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(75, 85, 99, 0.4)",
                        borderRadius: "0.5rem",
                        color: "white",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gelir-Gider Trend Grafiği */}
            <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Gelir-Gider Trend Grafiği
              </h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      formatter={(value) => `₺${value.toLocaleString()}`}
                      contentStyle={{
                        backgroundColor: "rgba(17, 24, 39, 0.8)",
                        border: "1px solid rgba(75, 85, 99, 0.4)",
                        borderRadius: "0.5rem",
                        color: "white",
                      }}
                    />
                    <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#4CAF50"
                      name="Gelir"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#F44336"
                      name="Gider"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detaylı Gider Listesi */}
          <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Detaylı Gider Listesi
            </h2>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {reportData.expenses?.map((expense) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
