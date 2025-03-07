"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function EditJobPage({ params }) {
  const [firms, setFirms] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState("");
  const [jobData, setJobData] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    plate: "",
    job: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalPrice, setOriginalPrice] = useState(0);

  const router = useRouter();
  const jobId = params.id;

  useEffect(() => {
    fetchFirms();
    fetchJob();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await axios.get("/api/firms");
      setFirms(response.data);
    } catch (err) {
      setError("Firma verileri alınırken bir hata oluştu.");
    }
  };

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/jobs/${jobId}`);
      const job = response.data;
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
      setOriginalPrice(job.price);
    } catch (err) {
      setError("İş verisi alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobData.name || !jobData.phone || !jobData.price || !selectedFirm) {
      setError("Tüm alanları doldurduğunuzdan emin olun.");
      return;
    }

    try {
      setLoading(true);

      // İş kaydını güncelle
      await axios.put(`/api/jobs/${jobId}`, {
        ...jobData,
        firmId: selectedFirm,
      });

      router.push("/jobs");
    } catch (err) {
      setError("İş güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">İş Kaydını Düzenle</h1>

      {loading && <div className="text-center">Yükleniyor...</div>}
      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma Seç
            </label>
            <select
              className="w-full p-2 border rounded"
              value={selectedFirm}
              onChange={(e) => setSelectedFirm(e.target.value)}
            >
              <option value="">Firma Seç</option>
              {firms.map((firm) => (
                <option key={firm._id} value={firm._id}>
                  {firm.name} (Bakiye: {firm.limit.toLocaleString("tr-TR")} TL)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ad - Soyad
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={jobData.name}
                onChange={(e) =>
                  setJobData({ ...jobData, name: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={jobData.phone}
                onChange={(e) =>
                  setJobData({ ...jobData, phone: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marka
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={jobData.brand}
                onChange={(e) =>
                  setJobData({ ...jobData, brand: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={jobData.model}
                onChange={(e) =>
                  setJobData({ ...jobData, model: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plaka
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={jobData.plate}
                onChange={(e) =>
                  setJobData({ ...jobData, plate: e.target.value })
                }
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tutar
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={jobData.price}
                onChange={(e) =>
                  setJobData({ ...jobData, price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yapılan İşler
            </label>
            <textarea
              className="w-full p-2 border rounded"
              rows="4"
              value={jobData.job}
              onChange={(e) => setJobData({ ...jobData, job: e.target.value })}
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition-colors duration-200"
            >
              Güncelle
            </button>
            <button
              type="button"
              onClick={() => router.push("/jobs")}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
