"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StockPage() {
  const router = useRouter();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await fetch("/api/stock");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStocks(data.stocks);
    } catch (err) {
      setError("Stok bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu stok kaydını silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/stock/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setStocks(stocks.filter((stock) => stock._id !== id));
    } catch (err) {
      setError("Stok silinirken bir hata oluştu");
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(stocks.map((stock) => stock.category))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Stok Takibi</h1>
        <Link
          href="/stock/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Yeni Ürün Ekle
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-gray-300">Ürün Kodu</th>
                <th className="pb-3 text-gray-300">Ürün Adı</th>
                <th className="pb-3 text-gray-300">Kategori</th>
                <th className="pb-3 text-gray-300">Miktar</th>
                <th className="pb-3 text-gray-300">Birim</th>
                <th className="pb-3 text-gray-300">Alış Fiyatı</th>
                <th className="pb-3 text-gray-300">Satış Fiyatı</th>
                <th className="pb-3 text-gray-300">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr
                  key={stock._id}
                  className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors duration-200"
                >
                  <td className="py-3 text-gray-300">{stock.code}</td>
                  <td className="py-3 text-gray-300">{stock.name}</td>
                  <td className="py-3 text-gray-300">{stock.category}</td>
                  <td className="py-3 text-gray-300">{stock.quantity}</td>
                  <td className="py-3 text-gray-300">{stock.unit}</td>
                  <td className="py-3 text-gray-300">
                    {stock.purchasePrice.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="py-3 text-gray-300">
                    {stock.salePrice.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="py-3">
                    <div className="flex space-x-2">
                      <Link
                        href={`/stock/${stock._id}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        Detay
                      </Link>
                      <Link
                        href={`/stock/${stock._id}/edit`}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => handleDelete(stock._id)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
