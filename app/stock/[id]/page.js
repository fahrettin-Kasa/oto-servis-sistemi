"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StockDetailPage({ params }) {
  const router = useRouter();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/stock/${params.id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStock(data);
    } catch (err) {
      setError("Stok bilgileri yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu stok kaydını silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/stock/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      router.push("/stock");
      router.refresh();
    } catch (err) {
      setError("Stok silinirken bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-900/50 backdrop-blur-lg border border-yellow-500 text-yellow-200 px-6 py-4 rounded-xl">
          Stok bulunamadı
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Stok Detayı</h1>
        <div className="flex space-x-4">
          <Link
            href={`/stock/${params.id}/edit`}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Sil
          </button>
          <Link
            href="/stock"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Geri Dön
          </Link>
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-400">Ürün Adı</h3>
            <p className="mt-1 text-lg text-white">{stock.name}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Ürün Kodu</h3>
            <p className="mt-1 text-lg text-white">{stock.code}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Kategori</h3>
            <p className="mt-1 text-lg text-white">{stock.category}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Miktar</h3>
            <p className="mt-1 text-lg text-white">
              {stock.quantity} {stock.unit}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">
              Minimum Miktar
            </h3>
            <p className="mt-1 text-lg text-white">
              {stock.minQuantity} {stock.unit}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Alış Fiyatı</h3>
            <p className="mt-1 text-lg text-white">
              {stock.purchasePrice.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Satış Fiyatı</h3>
            <p className="mt-1 text-lg text-white">
              {stock.salePrice.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Tedarikçi</h3>
            <p className="mt-1 text-lg text-white">{stock.supplier || "-"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">Konum</h3>
            <p className="mt-1 text-lg text-white">{stock.location || "-"}</p>
          </div>

          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-400">Notlar</h3>
            <p className="mt-1 text-lg text-white">{stock.notes || "-"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">
              Oluşturulma Tarihi
            </h3>
            <p className="mt-1 text-lg text-white">
              {new Date(stock.createdAt).toLocaleString("tr-TR")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-400">
              Son Güncelleme
            </h3>
            <p className="mt-1 text-lg text-white">
              {new Date(stock.updatedAt).toLocaleString("tr-TR")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
