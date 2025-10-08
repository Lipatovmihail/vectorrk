"use client";

import { Home, BarChart3, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingMenu() {
  const pathname = usePathname();

  const menuItems = [
    {
      href: "/",
      icon: Home,
      label: "Главная",
      isActive: pathname === "/"
    },
    {
      href: "/analytics",
      icon: BarChart3,
      label: "Аналитика",
      isActive: pathname === "/analytics"
    },
    {
      href: "/request",
      icon: FileText,
      label: "Добавить заявку",
      isActive: pathname === "/request"
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg px-3 py-3">
        <div className="flex items-center gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                  item.isActive
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
