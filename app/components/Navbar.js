"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white font-bold text-xl">
              Veri Giriş
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/jobs"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              İşler
            </Link>
            <Link
              href="/stock"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Stok
            </Link>
            <Link
              href="/customers"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Müşteriler
            </Link>
            <Link
              href="/firms"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Firmalar
            </Link>
            <Link
              href="/expenses"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Giderler
            </Link>
            <Link
              href="/reports"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Raporlar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
