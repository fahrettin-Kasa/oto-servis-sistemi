"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function HomePage() {
  const [firms, setFirms] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState("");
  const [formData, setFormData] = useState({ name: "", limit: "" });
  const [jobData, setJobData] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    plate: "",
    job: "",
    price: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalExpenses: 0,
    totalIncome: 0,
  });

  useEffect(() => {
    fetchFirms();
    fetchJobs();
    fetchStats();
  }, []);

  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/firms");
      setFirms(response.data);
    } catch (err) {
      setError("Firma verileri alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      if (!response.ok) {
        throw new Error("İşler yüklenirken bir hata oluştu");
      }
      const data = await response.json();

      // Verileri işle
      const jobs = data?.jobs || [];
      setJobs(jobs);

      // İstatistikleri hesapla
      const totalRev = jobs.reduce((sum, job) => sum + (job.price || 0), 0);

      setStats((prevStats) => ({
        ...prevStats,
        totalJobs: jobs.length,
        totalIncome: totalRev,
      }));
    } catch (err) {
      console.error("İşler yüklenirken hata:", err);
      setError("İşler yüklenirken bir hata oluştu");
      setJobs([]);
    }
  };

  const fetchStats = async () => {
    try {
      const [jobsRes, expensesRes] = await Promise.all([
        fetch("/api/jobs"),
        fetch("/api/expenses"),
      ]);

      if (!jobsRes.ok || !expensesRes.ok) {
        throw new Error("İstatistikler yüklenirken bir hata oluştu");
      }

      const jobsData = await jobsRes.json();
      const expensesData = await expensesRes.json();

      // Güvenli erişim için kontroller ekle
      const jobs = jobsData?.jobs || [];
      const expenses = expensesData?.expenses || [];

      const totalIncome = jobs.reduce((sum, job) => sum + (job.price || 0), 0);

      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
      );

      setStats({
        totalJobs: jobs.length,
        totalExpenses: totalExpenses,
        totalIncome: totalIncome,
      });
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
      setStats({
        totalJobs: 0,
        totalExpenses: 0,
        totalIncome: 0,
      });
    }
  };

  const handleFirmSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.limit) {
      setError("Firma adı ve kredi limiti boş olamaz.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/firms", formData);
      setFormData({ name: "", limit: "" });
      fetchFirms();
    } catch (err) {
      setError("Firma eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobData.name || !jobData.phone || !jobData.price || !selectedFirm) {
      setError("Tüm alanları doldurduğunuzdan emin olun.");
      return;
    }

    try {
      setLoading(true);

      if (editingJobId) {
        // Düzenleme işlemi
        await axios.put(`/api/jobs/${editingJobId}`, {
          ...jobData,
          firmId: selectedFirm,
        });
      } else {
        // Yeni kayıt işlemi
        await axios.post("/api/jobs", { ...jobData, firmId: selectedFirm });
      }

      setJobData({
        name: "",
        phone: "",
        brand: "",
        model: "",
        plate: "",
        job: "",
        price: "",
      });
      setSelectedFirm("");
      setEditingJobId(null);
      fetchJobs();
    } catch (err) {
      setError(
        editingJobId
          ? "İş güncellenirken bir hata oluştu."
          : "İş eklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setJobData({
      name: job.name,
      phone: job.phone,
      brand: job.brand,
      model: job.model,
      plate: job.plate,
      job: job.job,
      price: job.price,
    });
    setSelectedFirm(job.firmId._id);
    setEditingJobId(job._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/jobs/${jobId}`);
      fetchJobs();
    } catch (err) {
      setError("İş silinirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Veri Giriş Sistemi
            </h1>
            <p className="text-xl text-gray-300">
              İş ve gider takibinizi kolaylaştırın
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-blue-400/20">
              <h3 className="text-lg font-semibold text-blue-100 mb-2">
                Toplam İş
              </h3>
              <p className="text-4xl font-bold text-white">{stats.totalJobs}</p>
              <p className="text-sm text-blue-200 mt-2">
                Sistemde kayıtlı toplam iş sayısı
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-green-400/20">
              <h3 className="text-lg font-semibold text-green-100 mb-2">
                Toplam Gelir
              </h3>
              <p className="text-4xl font-bold text-white">
                ₺{stats.totalIncome.toLocaleString()}
              </p>
              <p className="text-sm text-green-200 mt-2">Toplam gelir tutarı</p>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 border border-red-400/20">
              <h3 className="text-lg font-semibold text-red-100 mb-2">
                Toplam Gider
              </h3>
              <p className="text-4xl font-bold text-white">
                ₺{stats.totalExpenses.toLocaleString()}
              </p>
              <p className="text-sm text-red-200 mt-2">
                Sistemde kayıtlı toplam gider tutarı
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Hızlı İşlemler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/jobs/new"
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
              >
                Yeni İş Ekle
              </Link>
              <Link
                href="/expenses/new"
                className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
              >
                Yeni Gider Ekle
              </Link>
              <Link
                href="/firms/new"
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
              >
                Yeni Firma Ekle
              </Link>
              <Link
                href="/customers/new"
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
              >
                Yeni Müşteri Ekle
              </Link>
              <Link
                href="/reports"
                className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
              >
                Raporları Görüntüle
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Son Aktiviteler
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                <p className="text-gray-300">
                  Sistem başarıyla kuruldu ve kullanıma hazır.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date().toLocaleDateString("tr-TR")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
