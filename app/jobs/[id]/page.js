"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function JobDetailPage({ params }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchJobDetails();
  }, []);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/jobs/${params.id}`);
      setJob(response.data.job);
    } catch (err) {
      setError("İş detayları alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu iş kaydını silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/jobs/${params.id}`);
      router.push("/jobs");
    } catch (err) {
      setError("İş silinirken bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-gray-400">İş bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">İş Detayları</h1>
          <div className="flex gap-3">
            <Link
              href={`/jobs/${params.id}/edit`}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 font-medium shadow-lg"
            >
              Düzenle
            </Link>
            <button
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-2.5 rounded-lg hover:from-red-700 hover:to-red-900 transition-all duration-200 font-medium shadow-lg"
            >
              Sil
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Firma</h3>
              <p className="text-white font-medium">
                {job.firm?.name || "Belirtilmemiş"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">
                Müşteri
              </h3>
              <p className="text-white font-medium">{job.name}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">
                Telefon
              </h3>
              <p className="text-white font-medium">{job.phone}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Araç</h3>
              <p className="text-white font-medium">
                {job.brand} {job.model}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Plaka</h3>
              <p className="text-white font-medium">{job.plate}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Tutar</h3>
              <p className="text-white font-medium">
                ₺{job.price?.toLocaleString("tr-TR")}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Durum</h3>
              <p
                className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium
                ${
                  job.status === "Tamamlandı"
                    ? "bg-green-900/50 text-green-200 border border-green-500"
                    : job.status === "Devam Ediyor"
                    ? "bg-yellow-900/50 text-yellow-200 border border-yellow-500"
                    : "bg-gray-900/50 text-gray-200 border border-gray-500"
                }`}
              >
                {job.status || "Beklemede"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm font-medium mb-2">Tarih</h3>
              <p className="text-white font-medium">
                {new Date(job.date).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-gray-400 text-sm font-medium mb-2">
              Yapılan İşler
            </h3>
            <p className="text-white whitespace-pre-wrap">{job.job}</p>
          </div>

          {job.parts && job.parts.length > 0 && (
            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-gray-400 text-sm font-medium mb-2">
                Kullanılan Parçalar
              </h3>
              <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Parça
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Miktar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                        Toplam
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {job.parts.map((part, index) => (
                      <tr key={index} className="hover:bg-gray-800/50">
                        <td className="px-4 py-3 text-sm text-white">
                          {part.part ? (
                            <div>
                              <div className="font-medium">
                                {part.part.name}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Kod: {part.part.code}
                              </div>
                            </div>
                          ) : (
                            "Bilinmeyen Parça"
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          {part.quantity} {part.part?.unit || "Adet"}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          ₺
                          {part.part?.salePrice?.toLocaleString("tr-TR") ||
                            part.price?.toLocaleString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 text-sm text-white">
                          ₺
                          {(
                            (part.part?.salePrice || part.price) * part.quantity
                          )?.toLocaleString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-800/50">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-3 text-sm font-medium text-gray-400 text-right"
                      >
                        Parça Toplamı:
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-white">
                        ₺
                        {job.parts
                          .reduce(
                            (total, part) =>
                              total +
                              (part.part?.salePrice || part.price) *
                                part.quantity,
                            0
                          )
                          .toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/jobs"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-2"
          >
            <span>←</span>
            <span>İşler Listesine Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
