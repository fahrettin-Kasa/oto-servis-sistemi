"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

// Yardımcı fonksiyonlar
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${date.getFullYear()}`;
};

const formatNumber = (number) => {
  return new Intl.NumberFormat("tr-TR").format(number);
};

export default function FirmsPage() {
  const [firms, setFirms] = useState([]);
  const [firmJobs, setFirmJobs] = useState([]);
  const [selectedFirm, setSelectedFirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchFirms();
    fetchJobs();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch("/api/firms");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Firmalar yüklenirken bir hata oluştu");
      }

      setFirms(data.firms);
    } catch (error) {
      setError(error.message);
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
      setFirmJobs(data.jobs || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Firma adını girin");
      return;
    }

    try {
      const response = await fetch("/api/firms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Firma eklenirken bir hata oluştu");
      }

      toast.success("Firma başarıyla eklendi");
      setFormData({ name: "" });
      fetchFirms();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu firmayı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/firms/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Firma silinirken bir hata oluştu");
      }

      toast.success("Firma başarıyla silindi");
      setFirms(firms.filter((firm) => firm._id !== id));
    } catch (error) {
      toast.error(error.message);
    }
  };

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
        <h1 className="text-3xl font-bold text-white">Firmalar</h1>
        <Link
          href="/firms/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Yeni Firma Ekle
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {firms.map((firm) => (
          <div
            key={firm._id}
            className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{firm.name}</h3>
              <div className="space-x-2">
                <Link
                  href={`/firms/${firm._id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Detay
                </Link>
                <Link
                  href={`/firms/${firm._id}/edit`}
                  className="text-green-400 hover:text-green-300 transition-colors duration-200"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(firm._id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Sil
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {firm.address && (
                <div>
                  <p className="text-sm text-gray-400">Adres</p>
                  <p className="text-gray-300">{firm.address}</p>
                </div>
              )}

              {firm.phone && (
                <div>
                  <p className="text-sm text-gray-400">Telefon</p>
                  <p className="text-gray-300">{firm.phone}</p>
                </div>
              )}

              {firm.email && (
                <div>
                  <p className="text-sm text-gray-400">E-posta</p>
                  <p className="text-gray-300">{firm.email}</p>
                </div>
              )}

              {firm.taxNumber && (
                <div>
                  <p className="text-sm text-gray-400">Vergi Numarası</p>
                  <p className="text-gray-300">{firm.taxNumber}</p>
                </div>
              )}

              {firm.notes && (
                <div>
                  <p className="text-sm text-gray-400">Notlar</p>
                  <p className="text-gray-300">{firm.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
