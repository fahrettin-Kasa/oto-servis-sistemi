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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">İş bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">İş Detayları</h1>
          <div className="flex gap-2">
            <Link
              href={`/jobs/${params.id}/edit`}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Düzenle
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 cursor-pointer"
            >
              Sil
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-600 mb-1">Firma</h3>
              <p className="text-gray-900 font-medium">
                {job.firm?.name || "Belirtilmemiş"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Müşteri</h3>
              <p className="text-gray-900 font-medium">{job.name}</p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Telefon</h3>
              <p className="text-gray-900 font-medium">{job.phone}</p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Araç</h3>
              <p className="text-gray-900 font-medium">
                {job.brand} {job.model}
              </p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Plaka</h3>
              <p className="text-gray-900 font-medium">{job.plate}</p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Tutar</h3>
              <p className="text-gray-900 font-medium">
                ₺{job.price?.toLocaleString("tr-TR")}
              </p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Durum</h3>
              <p
                className={`inline-flex px-2 py-1 rounded-full text-sm font-medium
                ${
                  job.status === "Tamamlandı"
                    ? "bg-green-100 text-green-800"
                    : job.status === "Devam Ediyor"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {job.status || "Beklemede"}
              </p>
            </div>
            <div>
              <h3 className="text-gray-600 mb-1">Tarih</h3>
              <p className="text-gray-900 font-medium">
                {new Date(job.date).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-gray-600 mb-1">Yapılan İşler</h3>
            <p className="text-gray-900 whitespace-pre-wrap">{job.job}</p>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/jobs"
            className="text-blue-500 hover:text-blue-600 cursor-pointer"
          >
            ← İşler Listesine Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
