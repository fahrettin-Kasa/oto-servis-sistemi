"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Filtre state'leri
  const [filters, setFilters] = useState({
    search: "",
    firmId: "",
    status: "",
    startDate: "",
    endDate: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const router = useRouter();

  useEffect(() => {
    fetchFirms();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [filters.page]); // Sayfa değiştiğinde verileri yeniden getir

  const fetchFirms = async () => {
    try {
      const response = await axios.get("/api/firms");
      setFirms(response.data.firms || []);
    } catch (err) {
      setError("Firma verileri alınamadı");
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // URL parametrelerini oluştur
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await axios.get(`/api/jobs?${params.toString()}`);
      setJobs(response.data.jobs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError("Veriler alınırken bir hata oluştu");
      console.error("Veri alma hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1, // Filtre değiştiğinde sayfa 1'e dön
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Bu işi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`/api/jobs/${jobId}`);

      if (response.data.success) {
        toast.success("İş başarıyla silindi");
        fetchJobs();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "İş silinirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (jobId) => {
    if (
      !window.confirm(
        "Bu işi iptal etmek istediğinizden emin misiniz? Firma bakiyesi iade edilecektir."
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      console.log("İptal işlemi başlatılıyor:", jobId);

      const response = await axios({
        method: "post",
        url: `/api/jobs/${jobId}/cancel`,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("API yanıtı:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || "İş iptal edilemedi");
      }

      // Başarılı yanıt alındıktan sonra listeyi yenile
      await fetchJobs();
    } catch (err) {
      console.error("İptal işlemi hatası:", {
        message: err.message || "Bilinmeyen hata",
        response: err.response?.data || "Yanıt verisi yok",
        status: err.response?.status || "Durum kodu yok",
        stack: err.stack,
      });

      setError(
        err.response?.data?.error ||
          err.message ||
          "İş iptal edilirken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        "TÜM iş kayıtlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!"
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete("/api/jobs/clear");
      console.log("Toplu silme yanıtı:", response.data);
      fetchJobs(); // Listeyi yenile
    } catch (err) {
      setError("İş kayıtları silinirken bir hata oluştu");
      console.error("Toplu silme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  const columns = [
    {
      key: "date",
      label: "Tarih",
      render: (job) => new Date(job.date).toLocaleDateString("tr-TR"),
    },
    {
      key: "firm",
      label: "Firma/Müşteri",
      render: (job) => {
        if (job.firm) {
          return job.firm.name;
        } else if (job.customer) {
          return job.customer.name;
        }
        return "Belirtilmemiş";
      },
    },
    {
      key: "description",
      label: "Yapılan İş",
      render: (job) => job.description || "Belirtilmemiş",
    },
    {
      key: "price",
      label: "Tutar",
      render: (job) => `₺${(job.price || 0).toLocaleString()}`,
    },
    {
      key: "status",
      label: "Durum",
      render: (job) => (
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            job.status === "Beklemede"
              ? "bg-yellow-900/50 text-yellow-200 border border-yellow-700/50"
              : job.status === "Devam Ediyor"
              ? "bg-blue-900/50 text-blue-200 border border-blue-700/50"
              : job.status === "Tamamlandı"
              ? "bg-green-900/50 text-green-200 border border-green-700/50"
              : "bg-red-900/50 text-red-200 border border-red-700/50"
          }`}
        >
          {job.status || "Beklemede"}
        </span>
      ),
    },
  ];

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
        <h1 className="text-3xl font-bold text-white">İşler</h1>
        <Link
          href="/jobs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Yeni İş Ekle
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Firma/Müşteri
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Araç
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  className="hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-200">
                        {job.firm?.name ||
                          job.customer?.name ||
                          "Belirtilmemiş"}
                      </div>
                      {job.firm && (
                        <Link
                          href={`/firms/${job.firm._id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs"
                        >
                          Detay
                        </Link>
                      )}
                      {job.customer && (
                        <Link
                          href={`/customers/${job.customer._id}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs"
                        >
                          Detay
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {job.vehicle || "Belirtilmemiş"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        job.status === "Beklemede"
                          ? "bg-yellow-900/50 text-yellow-200 border border-yellow-700/50"
                          : job.status === "Devam Ediyor"
                          ? "bg-blue-900/50 text-blue-200 border border-blue-700/50"
                          : job.status === "Tamamlandı"
                          ? "bg-green-900/50 text-green-200 border border-green-700/50"
                          : "bg-red-900/50 text-red-200 border border-red-700/50"
                      }`}
                    >
                      {job.status || "Beklemede"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    ₺{(job.amount || job.price || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(job.date).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                    >
                      Detay
                    </Link>
                    <Link
                      href={`/jobs/${job._id}/edit`}
                      className="text-green-400 hover:text-green-300 transition-colors duration-200"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
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

      {/* Pagination */}
      {jobs && jobs.length > 0 && (
        <div className="flex justify-end items-center gap-4 mt-6 bg-gray-800/50 backdrop-blur-lg p-4 rounded-xl border border-gray-700">
          <span className="text-gray-400 text-sm">
            Sayfa {pagination?.page || 1} / {pagination?.totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={!pagination?.page || pagination.page === 1}
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-lg"
            >
              <span>←</span>
              <span>Önceki</span>
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={
                !pagination?.totalPages ||
                pagination.page === pagination.totalPages
              }
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-lg"
            >
              <span>Sonraki</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
