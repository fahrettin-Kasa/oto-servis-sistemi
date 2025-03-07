"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/login");
    } catch (err) {
      console.error("Çıkış yapılırken hata oluştu:", err);
    }
  };

  const menuItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/firms", label: "Firma İşlemleri" },
    { href: "/customers", label: "Müşteri Yönetimi" },
    { href: "/jobs", label: "İş Listesi" },
    { href: "/jobs/new", label: "İş Kayıt" },
    { href: "/parts", label: "Parça Stok" },
    { href: "/expenses", label: "Giderler" },
    { href: "/reports", label: "Raporlar" },
  ];

  return (
    <>
      {/* Mobil menü toggle butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-20 bg-white p-2 rounded-lg shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobil menü overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-200 ease-in-out bg-white w-64 min-h-screen shadow-lg z-30`}
        suppressHydrationWarning
      >
        <div className="p-4 border-b" suppressHydrationWarning>
          <h1 className="text-xl font-bold">Sanayi Takip</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2 rounded transition-colors ${
                    pathname === item.href
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t" suppressHydrationWarning>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
}
