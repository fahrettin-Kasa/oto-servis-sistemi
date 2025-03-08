"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditJobPage({ params }) {
  const [firms, setFirms] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
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
    jobPrice: "",
    initialPartsTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchJobDetails();
    fetchFirms();
    fetchStocks();
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
        status: job.status || "Beklemede",
        firm: job.firm || null,
        vehicle: job.vehicle || "sedan",
        type: job.firm ? "firm" : "customer",
        customer: job.customer || null,
        date: job.date || new Date().toISOString(),
        jobPrice: job.price || 0,
        parts:
          job.parts.map((part) => ({
            part: part.part?._id || part.part,
            quantity: part.quantity,
            price: part.part?.salePrice || part.price,
            _tempData: part.part,
          })) || [],
        partsTotal:
          job.parts?.reduce(
            (total, part) =>
              total + (part.part?.salePrice || part.price) * part.quantity,
            0
          ) || 0,
        initialPartsTotal:
          job.parts?.reduce(
            (total, part) =>
              total + (part.part?.salePrice || part.price) * part.quantity,
            0
          ) || 0,
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

  const fetchStocks = async () => {
    try {
      const response = await axios.get("/api/stock");
      if (response.data.success) {
        setStocks(response.data.stocks);
      }
    } catch (err) {
      setError("Stok listesi alınırken bir hata oluştu.");
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
      price:
        Number(jobData.jobPrice) +
        (jobData.partsTotal - jobData.initialPartsTotal),
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

  const handleAddPart = () => {
    if (!selectedStock) {
      toast.error("Lütfen bir parça seçin");
      return;
    }

    const stock = stocks.find((s) => s._id === selectedStock);
    if (!stock) {
      toast.error("Seçili parça bulunamadı");
      return;
    }

    if (selectedQuantity < 1) {
      toast.error("Miktar en az 1 olmalıdır");
      return;
    }

    const partTotal = stock.salePrice * selectedQuantity;

    const newPart = {
      part: stock._id,
      quantity: selectedQuantity,
      price: stock.salePrice,
      _tempData: stock,
    };

    setJobData((prev) => ({
      ...prev,
      parts: [...prev.parts, newPart],
      partsTotal: prev.partsTotal + partTotal,
    }));

    setSelectedStock("");
    setSelectedQuantity(1);
    toast.success("Parça eklendi");
  };

  const handleRemovePart = (index) => {
    const removedPart = jobData.parts[index];
    const partTotal = removedPart.price * removedPart.quantity;

    setJobData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
      partsTotal: prev.partsTotal - partTotal,
    }));

    toast.success("Parça kaldırıldı");
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
                  İş Ücreti
                </label>
                <input
                  type="number"
                  name="jobPrice"
                  value={jobData.jobPrice}
                  onChange={(e) =>
                    setJobData({ ...jobData, jobPrice: Number(e.target.value) })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="İş Ücreti"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Toplam Tutar
                </label>
                <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white">
                  ₺
                  {(
                    Number(jobData.jobPrice) +
                    (jobData.partsTotal - jobData.initialPartsTotal)
                  )?.toLocaleString("tr-TR")}
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  Not: Toplam tutar, iş ücreti ve yeni eklenen parçaların
                  tutarlarının toplamı olarak hesaplanır.
                </p>
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

            <div className="mt-8 border-t border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Parça Ekle
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Parça
                  </label>
                  <select
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                  >
                    <option value="">Parça Seç</option>
                    {stocks.map((stock) => (
                      <option key={stock._id} value={stock._id}>
                        {stock.name} - ₺
                        {stock.salePrice?.toLocaleString("tr-TR")} (
                        {stock.quantity} {stock.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Miktar
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedQuantity}
                    onChange={(e) =>
                      setSelectedQuantity(parseInt(e.target.value) || 1)
                    }
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors duration-200"
                  >
                    Ekle
                  </button>
                </div>
              </div>

              {jobData.parts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Eklenen Parçalar
                  </h4>
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
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">
                            İşlem
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {jobData.parts.map((part, index) => {
                          const stockData =
                            part._tempData ||
                            stocks.find((s) => s._id === part.part);
                          return (
                            <tr key={index} className="hover:bg-gray-800/50">
                              <td className="px-4 py-3 text-sm text-white">
                                <div>
                                  <div className="font-medium">
                                    {stockData?.name || "Bilinmeyen Parça"}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    Kod: {stockData?.code}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                {part.quantity} {stockData?.unit || "Adet"}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                ₺{part.price?.toLocaleString("tr-TR")}
                              </td>
                              <td className="px-4 py-3 text-sm text-white">
                                ₺
                                {(part.price * part.quantity)?.toLocaleString(
                                  "tr-TR"
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-white text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemovePart(index)}
                                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                                >
                                  Kaldır
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-800/50">
                        <tr>
                          <td
                            colSpan="3"
                            className="px-4 py-3 text-sm font-medium text-gray-400 text-right"
                          >
                            Parça Toplamı:
                          </td>
                          <td
                            colSpan="2"
                            className="px-4 py-3 text-sm font-medium text-white"
                          >
                            ₺{jobData.partsTotal?.toLocaleString("tr-TR")}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <Link
                href="/jobs"
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2.5 rounded-lg transition-colors duration-200 text-center"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
