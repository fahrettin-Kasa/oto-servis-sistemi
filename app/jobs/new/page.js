"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewJobPage() {
  const router = useRouter();
  const [firms, setFirms] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedParts, setSelectedParts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    brand: "",
    model: "",
    plate: "",
    job: "",
    price: "",
    firmId: "",
    customerId: "",
    status: "Beklemede",
    date: new Date().toISOString().split("T")[0],
    vehicle: "sedan",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchFirms(), fetchCustomers(), fetchParts()]);
      } catch (err) {
        setError("Veriler yüklenirken bir hata oluştu");
        console.error("Veri yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch("/api/firms");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setFirms(data.firms || []);
    } catch (err) {
      console.error("Firma yükleme hatası:", err);
      setFirms([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Müşteri yükleme hatası:", err);
      setCustomers([]);
    }
  };

  const fetchParts = async () => {
    try {
      const response = await fetch("/api/stock");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      console.log(
        "Yüklenen parçalar:",
        data.stocks.map((part) => ({
          id: part._id,
          name: part.name,
          quantity: part.quantity,
          price: part.salePrice,
        }))
      );

      setParts(data.stocks || []);
    } catch (err) {
      console.error("Parça yükleme hatası:", err);
      setError("Parçalar yüklenirken bir hata oluştu");
      setParts([]);
    }
  };

  const handleFirmSelect = (firmId) => {
    setSelectedFirm(firmId);
    if (firmId) {
      setSelectedCustomer("");
      setFormData({
        ...formData,
        customerId: "",
        firmId: firmId,
      });
    } else {
      setFormData({
        ...formData,
        firmId: "",
      });
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId);
    if (customerId) {
      setSelectedFirm("");
      const customer = customers.find((c) => c._id === customerId);
      if (customer) {
        setFormData({
          ...formData,
          name: customer.name,
          phone: customer.phone,
          brand: customer.brand || "",
          model: customer.model || "",
          plate: customer.plate || "",
          customerId: customer._id,
        });
      }
    } else {
      setFormData({
        ...formData,
        name: "",
        phone: "",
        brand: "",
        model: "",
        plate: "",
        customerId: "",
      });
    }
  };

  const handlePartSelect = (part) => {
    if (part.quantity <= 0) {
      setError("Bu parçadan stokta kalmamış!");
      return;
    }
    console.log("Seçilen parça:", {
      id: part._id,
      name: part.name,
      quantity: part.quantity,
      price: part.salePrice,
    });
    setSelectedParts([...selectedParts, { ...part, usedQuantity: 1 }]);
  };

  const handlePartQuantityChange = (partId, newQuantity) => {
    const part = parts.find((p) => p._id === partId);
    if (newQuantity > part.quantity) {
      setError("Stokta yeterli parça yok!");
      return;
    }
    setSelectedParts(
      selectedParts.map((p) =>
        p._id === partId ? { ...p, usedQuantity: newQuantity } : p
      )
    );
  };

  const removePart = (partId) => {
    setSelectedParts(selectedParts.filter((p) => p._id !== partId));
  };

  const calculateTotalPrice = () => {
    const partsTotal = selectedParts.reduce(
      (sum, part) => sum + part.salePrice * part.usedQuantity,
      0
    );
    const jobPrice = parseFloat(formData.price) || 0;
    return partsTotal + jobPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalPrice = calculateTotalPrice();
      const requestData = {
        name: formData.name,
        phone: formData.phone,
        brand: formData.brand,
        model: formData.model,
        plate: formData.plate,
        job: formData.job,
        price: totalPrice,
        vehicle: formData.vehicle,
        firm: selectedFirm || undefined,
        customer: selectedCustomer || undefined,
        parts: selectedParts.map((part) => ({
          part: part._id,
          quantity: part.usedQuantity || 1,
          price: part.salePrice || 0,
        })),
        status: formData.status,
        date: formData.date,
      };

      // Boş string değerleri undefined'a çevir
      Object.keys(requestData).forEach((key) => {
        if (requestData[key] === "") {
          requestData[key] = undefined;
        }
      });

      console.log("Seçilen firma:", selectedFirm);
      console.log("İş durumu:", formData.status);
      console.log("Toplam tutar:", totalPrice);
      console.log("Gönderilen veri:", requestData);

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("API Yanıtı:", data);

      if (!response.ok) {
        console.error("API Hatası:", {
          status: response.status,
          statusText: response.statusText,
          data: data,
        });
        throw new Error(data.error || data.details || "İş kaydedilemedi");
      }

      toast.success("İş başarıyla kaydedildi");
      router.push("/jobs");
    } catch (error) {
      console.error("Hata detayı:", error);
      console.error("Tam hata:", error.message);
      console.error("Hata stack:", error.stack);
      toast.error(error.message || "İş kaydedilemedi");
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Yeni İş Ekle</h1>
        <Link
          href="/jobs"
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Geri Dön
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Firma
            </label>
            <select
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={selectedFirm}
              onChange={(e) => handleFirmSelect(e.target.value)}
            >
              <option value="">Firma Seçin</option>
              {firms.map((firm) => (
                <option key={firm._id} value={firm._id}>
                  {firm.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Müşteri
            </label>
            <select
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={selectedCustomer}
              onChange={(e) => handleCustomerSelect(e.target.value)}
            >
              <option value="">Müşteri Seçin</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              İş Adı
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Marka
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.model}
              onChange={(e) =>
                setFormData({ ...formData, model: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Plaka
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.plate}
              onChange={(e) =>
                setFormData({ ...formData, plate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              İş Açıklaması
            </label>
            <textarea
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.job}
              onChange={(e) =>
                setFormData({ ...formData, job: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              İş Ücreti
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Durum
            </label>
            <select
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="Beklemede">Beklemede</option>
              <option value="Devam Ediyor">Devam Ediyor</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="İptal">İptal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tarih
            </label>
            <input
              type="date"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Araç Tipi
            </label>
            <select
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              value={formData.vehicle}
              onChange={(e) =>
                setFormData({ ...formData, vehicle: e.target.value })
              }
            >
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
              <option value="suv">SUV</option>
              <option value="pickup">Pickup</option>
              <option value="van">Van</option>
              <option value="truck">Kamyon</option>
              <option value="other">Diğer</option>
            </select>
          </div>
        </div>

        {/* Parça Seçimi */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-white">Parça Seçimi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.isArray(parts) && parts.length > 0 ? (
              parts.map((part) => (
                <div
                  key={part._id}
                  className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-white font-medium">{part.name}</h3>
                      <p className="text-gray-400 text-sm">
                        Stok: {part.quantity} | Fiyat: ₺{part.salePrice}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePartSelect(part)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors duration-200"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-400 py-4">
                Stokta parça bulunmuyor
              </div>
            )}
          </div>

          {/* Seçilen Parçalar */}
          {selectedParts.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Seçilen Parçalar
              </h3>
              <div className="space-y-4">
                {selectedParts.map((part) => (
                  <div
                    key={part._id}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-white font-medium">{part.name}</h4>
                      <p className="text-gray-400 text-sm">
                        Birim Fiyat: ₺{part.salePrice}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        max={part.quantity}
                        value={part.usedQuantity}
                        onChange={(e) =>
                          handlePartQuantityChange(
                            part._id,
                            parseInt(e.target.value)
                          )
                        }
                        className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removePart(part._id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Kaldır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toplam Fiyat */}
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Toplam Fiyat</h2>
            <p className="text-2xl font-bold text-white">
              ₺{calculateTotalPrice().toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/jobs"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
