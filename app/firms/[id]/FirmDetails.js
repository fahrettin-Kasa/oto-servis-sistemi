"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function FirmDetails({ id }) {
  const router = useRouter();
  const [firm, setFirm] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchFirmDetails();
    }
  }, [id]);

  const fetchFirmDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Firma detayları isteniyor, ID:", id);
      const response = await axios.get(`/api/firms/${id}`);
      console.log("API yanıtı:", response.data);

      if (!response.data.firm) {
        setError("Firma bulunamadı");
        setFirm(null);
        return;
      }

      setFirm(response.data.firm);
      setJobs(response.data.jobs || []);
    } catch (err) {
      console.error("Firma detayları alınamadı:", err);
      console.error("Hata detayları:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Firma bilgileri alınamadı";

      setError(errorMessage);
      setFirm(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu firmayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axios.delete(`/api/firms/${id}`);
      router.push("/firms");
    } catch (err) {
      setError("Firma silinirken bir hata oluştu");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    const amount = Number(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      setError("Geçerli bir ödeme tutarı giriniz");
      return;
    }

    setPaymentLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const paymentData = {
        amount: amount,
        description: paymentDescription || "Ödeme",
      };

      console.log("Ödeme gönderiliyor:", paymentData);
      console.log("Firma mevcut durumu:", {
        totalBalance: firm.totalBalance,
        currentBalance: firm.currentBalance,
        payments: firm.payments,
      });

      const response = await axios.post(
        `/api/firms/${id}/payments`,
        paymentData
      );

      console.log("API yanıtı:", response.data);

      if (response.data.success) {
        // Firma bilgilerini ve işleri yeniden yükle
        await fetchFirmDetails();

        // Formu sıfırla ve kapat
        setPaymentAmount("");
        setPaymentDescription("");
        setShowPaymentForm(false);

        // Başarı mesajı göster
        setSuccess("Ödeme başarıyla kaydedildi!");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.error || "Ödeme kaydedilirken bir hata oluştu");
      }
    } catch (err) {
      console.error("Ödeme hatası:", err);
      console.error("Hata detayları:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        details: err.response?.data?.details,
      });

      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.details ||
        err.message ||
        "Ödeme kaydedilirken bir hata oluştu";

      setError(errorMessage);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Firma bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Firma Detayı</h1>
          <div className="flex gap-4 mt-2">
            <p className="text-lg text-gray-300">
              Toplam Bakiye:{" "}
              <span className="font-semibold text-green-400">
                ₺{(firm.totalBalance || 0).toLocaleString()}
              </span>
            </p>
            <p className="text-lg text-gray-300">
              Güncel Bakiye:{" "}
              <span className="font-semibold text-blue-400">
                ₺{(firm.currentBalance || 0).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowPaymentForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Ödeme Al
          </button>
          <Link
            href={`/firms/${id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Düzenle
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Sil
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-8">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/50 backdrop-blur-lg border border-green-500 text-green-200 px-6 py-4 rounded-xl mb-8">
          {success}
        </div>
      )}

      {/* Ödeme Formu */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Ödeme Al</h2>
              <button
                onClick={() => setShowPaymentForm(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ödeme Tutarı
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentLoading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Firma Bilgileri */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{firm.name}</h2>
            <p className="text-gray-300">{firm.address}</p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/firms/${id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Düzenle
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Sil
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Telefon</h3>
            <p className="text-white">{firm.phone}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">E-posta</h3>
            <p className="text-white">{firm.email}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Vergi Numarası</h3>
            <p className="text-white">{firm.taxNumber}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Kayıt Tarihi</h3>
            <p className="text-white">
              {new Date(firm.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Toplam İş Sayısı</h3>
            <p className="text-white">{jobs.length}</p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <h3 className="text-gray-400 text-sm mb-1">Güncel Bakiye</h3>
            <p className="text-white">
              ₺{(firm.currentBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Ödeme Geçmişi */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden mb-6">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Ödeme Geçmişi</h3>
          {!firm.payments || firm.payments.length === 0 ? (
            <p className="text-gray-400">Henüz ödeme geçmişi bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Açıklama
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {firm.payments.map((payment, index) => (
                    <tr key={index} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(payment.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-300">
                        -₺{Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {payment.description || "Belirtilmemiş"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* İş Geçmişi */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">İş Geçmişi</h3>
          {jobs.length === 0 ? (
            <p className="text-gray-400">Henüz iş geçmişi bulunmuyor.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Plaka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      İş Açıklaması
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(job.date).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {job.plate || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {job.job || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ₺{(job.price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
