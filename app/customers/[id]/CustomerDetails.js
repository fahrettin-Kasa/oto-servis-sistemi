"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function CustomerDetails({ id }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/customers/${id}`);
      if (response.data.customer) {
        console.log("Müşteri detayları güncellendi:", response.data.customer);
        setCustomer(response.data.customer);
        setJobs(response.data.jobs);
        setError(null);
      }
    } catch (err) {
      console.error("Müşteri bilgileri alınamadı:", err);
      setError("Müşteri bilgileri alınamadı");
      setCustomer(null);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomerData();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axios.delete(`/api/customers/${id}`);
      router.push("/customers");
    } catch (err) {
      setError("Müşteri silinirken bir hata oluştu");
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Geçerli bir ödeme tutarı giriniz");
      return;
    }

    try {
      console.log("Sending payment request:", {
        amount: amount.toFixed(2),
        description: paymentDescription.trim(),
        customerId: id,
      });

      const response = await axios.post(`/api/customers/${id}/payments`, {
        amount: amount.toFixed(2),
        description: paymentDescription.trim(),
      });

      if (response.data.success) {
        console.log("Payment response:", response.data);

        // Form alanlarını temizle
        setPaymentAmount("");
        setPaymentDescription("");
        setShowPaymentModal(false);

        // Başarı mesajını göster
        setSuccess("Ödeme başarıyla kaydedildi");
        setTimeout(() => setSuccess(null), 3000);

        // Müşteri verilerini güncelle
        setCustomer(response.data.customer);
        setJobs(response.data.jobs);
      }
    } catch (err) {
      console.error("Payment error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error || "Ödeme kaydedilirken bir hata oluştu"
      );
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Müşteri bulunamadı.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      {/* Üst Başlık ve Bakiye Bilgileri */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Müşteri Detayı</h1>
          <div className="flex gap-6 mt-2">
            <div>
              <p className="text-sm text-gray-400">Toplam Bakiye</p>
              <p className="text-lg font-semibold text-blue-400">
                ₺{customer.totalBalance?.toLocaleString() || "0"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Güncel Bakiye</p>
              <p className="text-lg font-semibold text-red-400">
                ₺{customer.currentBalance?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowPaymentModal(true)}
            disabled={!customer.currentBalance || customer.currentBalance <= 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ödeme Al
          </button>
          <Link
            href={`/customers/${id}/edit`}
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

      {/* Bildirimler */}
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

      {/* Ödeme Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Ödeme Al</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ödeme Tutarı
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                  min="0"
                  max={customer.currentBalance}
                  step="0.01"
                  placeholder="Ödeme tutarını giriniz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Açıklama
                </label>
                <input
                  type="text"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Ödeme açıklaması (opsiyonel)"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={
                    !paymentAmount ||
                    parseFloat(paymentAmount) <= 0 ||
                    parseFloat(paymentAmount) > customer.currentBalance
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ödeme Al
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Müşteri Bilgileri */}
      <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6">
          Müşteri Bilgileri
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-400">Ad Soyad</p>
            <p className="text-lg font-medium text-white">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Telefon</p>
            <p className="text-lg font-medium text-white">{customer.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">E-posta</p>
            <p className="text-lg font-medium text-white">
              {customer.email?.trim() || "Belirtilmemiş"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Araç</p>
            <p className="text-lg font-medium text-white">
              {customer.vehicle?.trim() || "Belirtilmemiş"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Plaka</p>
            <p className="text-lg font-medium text-white">
              {customer.plate?.trim() || "Belirtilmemiş"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Kayıt Tarihi</p>
            <p className="text-lg font-medium text-white">
              {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>
      </div>

      {/* Ödeme Geçmişi */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Ödeme Geçmişi
          </h2>
          {customer.payments && customer.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Açıklama
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {customer.payments.map((payment, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          {new Date(payment.date).toLocaleDateString("tr-TR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          ₺{payment.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200">
                          {payment.description || "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Henüz ödeme kaydı bulunmuyor.
            </p>
          )}
        </div>
      </div>

      {/* İş Geçmişi */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">İş Geçmişi</h2>
            <div className="text-gray-300">
              Toplam:{" "}
              <span className="font-semibold text-blue-400">
                ₺{customer.totalBalance?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
          {jobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Firma
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Yapılan İş
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {jobs.map((job) => (
                    <tr
                      key={job._id}
                      className="hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          {new Date(job.date).toLocaleDateString("tr-TR")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          {job.firm?.name || customer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200">
                          {job.job || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-200">
                          ₺{(job.price || 0).toLocaleString()}
                        </div>
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
          ) : (
            <p className="text-gray-400 text-center py-8">
              Bu müşteriye ait iş bulunmuyor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
