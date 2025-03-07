"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Müşteriler yüklenirken bir hata oluştu");
      }

      setCustomers(data.customers);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bu müşteriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Müşteri silinirken bir hata oluştu");
      }

      setCustomers(customers.filter((customer) => customer._id !== id));
    } catch (error) {
      setError(error.message);
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
        <h1 className="text-3xl font-bold text-white">Müşteriler</h1>
        <Link
          href="/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Yeni Müşteri Ekle
        </Link>
      </div>

      {error && (
        <div className="bg-red-900/50 backdrop-blur-lg border border-red-500 text-red-200 px-6 py-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div
            key={customer._id}
            className="bg-gray-800/50 backdrop-blur-lg p-6 rounded-xl shadow-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">
                {customer.name}
              </h3>
              <div className="space-x-2">
                <Link
                  href={`/customers/${customer._id}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Detay
                </Link>
                <Link
                  href={`/customers/${customer._id}/edit`}
                  className="text-green-400 hover:text-green-300 transition-colors duration-200"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(customer._id)}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  Sil
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customer.phone && (
                <div>
                  <p className="text-sm text-gray-400">Telefon</p>
                  <p className="text-gray-300">{customer.phone}</p>
                </div>
              )}

              {customer.email && (
                <div>
                  <p className="text-sm text-gray-400">E-posta</p>
                  <p className="text-gray-300">{customer.email}</p>
                </div>
              )}

              {customer.address && (
                <div>
                  <p className="text-sm text-gray-400">Adres</p>
                  <p className="text-gray-300">{customer.address}</p>
                </div>
              )}

              {customer.vehicle && (
                <div>
                  <p className="text-sm text-gray-400">Araç</p>
                  <p className="text-gray-300">{customer.vehicle}</p>
                </div>
              )}

              {customer.notes && (
                <div>
                  <p className="text-sm text-gray-400">Notlar</p>
                  <p className="text-gray-300">{customer.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
