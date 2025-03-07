"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditJobPage({ params }) {
  const [firms, setFirms] = useState([]);
  const [jobData, setJobData] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    plate: "",
    job: "",
    price: "",
    status: "",
    firm: "",
    vehicle: "",
    customer: "",
    type: "",
    date: "",
    parts: [],
    partsTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchJobDetails();
    fetchFirms();
  }, []);

  const fetchJobDetails = async () => {
    try {
      console.log("Fetching job details for ID:", params.id);
      const response = await axios.get(`/api/jobs/${params.id}`);

      if (!response.data.success || !response.data.job) {
        throw new Error("Invalid API response format");
      }

      const job = response.data.job;

      // API yanıtını detaylı loglama
      console.log("Raw API Response:", JSON.stringify(response.data, null, 2));
      console.log("Available fields in job:", Object.keys(job));
      console.log("Job data from API (detailed):", job);

      // State'i güncelleme - varsayılan değerleri kullan
      const updatedJobData = {
        name: job.name || "",
        phone: job.phone || "",
        brand: job.brand || "",
        model: job.model || "",
        plate: job.plate || "",
        job: job.job || "",
        price: job.price ? job.price.toString() : "",
        status: job.status || "Beklemede",
        firm: job.firm || null,
        vehicle: job.vehicle || "sedan",
        type: job.firm ? "firm" : "customer",
        customer: job.customer || null,
        date: job.date || new Date().toISOString(),
        parts: job.parts || [],
        partsTotal: job.partsTotal || 0,
      };

      console.log("Setting job data:", updatedJobData);
      setJobData(updatedJobData);
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("İş detayları alınırken bir hata oluştu.");
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await axios.get("/api/firms");
      setFirms(response.data.firms || []);
    } catch (err) {
      setError("Firma listesi alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFirmChange = (e) => {
    const firmId = e.target.value;
    setJobData({
      ...jobData,
      firm: firmId ? { _id: firmId } : null,
      type: firmId ? "firm" : "customer",
      // Firma seçildiğinde customer null olmalı
      customer: firmId ? null : jobData.customer,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("=== Form submission started ===");
    console.log("Current form data:", jobData);

    // Form validation
    const missingFields = [];

    // Her zaman zorunlu olan alanları kontrol et
    if (!jobData.name?.trim()) missingFields.push("Ad - Soyad");
    if (!jobData.phone?.trim()) missingFields.push("Telefon");
    if (!jobData.price) missingFields.push("Tutar");
    if (!jobData.vehicle?.trim()) missingFields.push("Araç Tipi");

    // Sadece firma işi ise firma kontrolü yap
    if (jobData.type === "firm" && (!jobData.firm || !jobData.firm._id)) {
      missingFields.push("Firma");
    }

    if (missingFields.length > 0) {
      const errorMessage = `Lütfen şu alanları doldurun: ${missingFields.join(
        ", "
      )}`;
      console.log("Validation failed:", errorMessage);
      setError(errorMessage);
      return;
    }

    // API'ye gönderilecek veriyi hazırla
    const submitData = {
      _id: params.id,
      name: jobData.name.trim(),
      phone: jobData.phone.trim(),
      brand: (jobData.brand || "").trim(),
      model: (jobData.model || "").trim(),
      plate: (jobData.plate || "").trim(),
      job: (jobData.job || "").trim(),
      price: Number(jobData.price),
      status: jobData.status,
      firm: jobData.type === "firm" ? jobData.firm : null,
      customer: jobData.type === "customer" ? { _id: jobData.customer } : null,
      vehicle: jobData.vehicle.trim(),
      parts: jobData.parts.map((part) => ({
        part: part.part,
        quantity: part.quantity,
        price: part.price,
      })),
      partsTotal: jobData.partsTotal || 0,
      date: jobData.date,
    };

    try {
      setLoading(true);
      setError(null);

      // Detaylı loglama
      console.log("=== Making API request ===");
      console.log("URL:", `/api/jobs/${params.id}`);
      console.log(
        "Data being sent to API:",
        JSON.stringify(submitData, null, 2)
      );

      const response = await axios.put(`/api/jobs/${params.id}`, submitData);

      // API yanıtını logla
      console.log("=== API Response ===");
      console.log("Status:", response.status);
      console.log("Data:", JSON.stringify(response.data, null, 2));

      if (!response.data.success) {
        throw new Error(
          response.data.error || "İş güncellenirken bir hata oluştu"
        );
      }

      toast.success("İş başarıyla güncellendi");
      // Önce sayfayı yenile
      window.location.href = "/jobs";
    } catch (err) {
      console.error("=== Submit error ===", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: `/api/jobs/${params.id}`,
        data: submitData,
        error: err.response?.data?.error || err.message,
      });

      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "İş güncellenirken bir hata oluştu";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">İş Düzenle</h1>
        </div>

        {error && (
          <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-8">
            {error}
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Firma{" "}
                {jobData.type === "firm" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={jobData.firm?._id || ""}
                onChange={handleFirmChange}
              >
                <option value="">Firma Seç</option>
                {firms.map((firm) => (
                  <option key={firm._id} value={firm._id}>
                    {firm.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ad - Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={jobData.name}
                  onChange={(e) =>
                    setJobData({ ...jobData, name: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Müşteri Adı"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={jobData.phone}
                  onChange={(e) =>
                    setJobData({ ...jobData, phone: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Telefon"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Araç Tipi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vehicle"
                  value={jobData.vehicle}
                  onChange={(e) =>
                    setJobData({ ...jobData, vehicle: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Araç Tipi"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marka
                </label>
                <input
                  type="text"
                  name="brand"
                  value={jobData.brand}
                  onChange={(e) =>
                    setJobData({ ...jobData, brand: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Marka"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Model
                </label>
                <input
                  type="text"
                  name="model"
                  value={jobData.model}
                  onChange={(e) =>
                    setJobData({ ...jobData, model: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Model"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plaka
                </label>
                <input
                  type="text"
                  name="plate"
                  value={jobData.plate}
                  onChange={(e) =>
                    setJobData({ ...jobData, plate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Plaka"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tutar <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={jobData.price}
                  onChange={(e) =>
                    setJobData({ ...jobData, price: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Fiyat"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Durum
                </label>
                <select
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={jobData.status}
                  onChange={(e) =>
                    setJobData({ ...jobData, status: e.target.value })
                  }
                >
                  <option value="Beklemede">Beklemede</option>
                  <option value="Devam Ediyor">Devam Ediyor</option>
                  <option value="Tamamlandı">Tamamlandı</option>
                  <option value="İptal">İptal</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Yapılan İşler
              </label>
              <textarea
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                rows="4"
                name="job"
                value={jobData.job}
                onChange={(e) =>
                  setJobData({ ...jobData, job: e.target.value })
                }
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <Link
                href={`/jobs/${params.id}`}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                İptal
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
