"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Clapperboard,
  Image,
  Flag,
  Wallet,
  Gem,
  Banknote,
  BarChart3,
  Settings,
  ChevronsLeft,
  Crown,
} from "lucide-react"

const mainMenu = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Utilisateurs", icon: Users, href: "/admin/users" },
  { name: "Créateurs", icon: Clapperboard, href: "/admin/creators" },
  { name: "Contenu", icon: Image, href: "/admin/content" },
  { name: "Signalements", icon: Flag, href: "/admin/reports" },
]

const paymentsMenu = [
  { name: "Transactions", icon: Wallet, href: "/admin/transactions" },
  { name: "Abonnements", icon: Gem, href: "/admin/subscriptions" },
  { name: "Retraits", icon: Banknote, href: "/admin/withdrawals" },
]

const bottomMenu = [
  { name: "Statistiques", icon: BarChart3, href: "/admin/stats" },
  { name: "Paramètres", icon: Settings, href: "/admin/settings" },
]

export default function Sidebar() {
  const pathname = usePathname()

  const renderItem = (item: any) => {
    const Icon = item.icon
    const isActive = pathname === item.href

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mb-1 transition-colors ${
          isActive
            ? "bg-white/10 text-white"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon size={18} className={isActive ? "text-violet-400" : ""} />
        <span className="text-sm font-medium">{item.name}</span>
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-[#111113] border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <Crown size={18} className="text-white" />
          </div>
          <span className="text-white font-semibold">Afrifan Admin</span>
        </div>
        <button className="text-gray-500 hover:text-white">
          <ChevronsLeft size={18} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider px-4 mb-2 mt-2">
          Menu principal
        </p>
        {mainMenu.map(renderItem)}

        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider px-4 mb-2 mt-6">
          Monétisation
        </p>
        {paymentsMenu.map(renderItem)}
      </nav>

      {/* Bas du menu */}
      <div className="px-3 pb-4">
        {bottomMenu.map(renderItem)}

        {/* Profil admin */}
        <div className="flex items-center gap-3 mt-4 px-4 py-3 rounded-lg bg-white/5">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Admin</p>
            <p className="text-gray-500 text-xs truncate">admin@afrifan.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}