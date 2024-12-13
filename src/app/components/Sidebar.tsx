'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Users, Settings, BarChart2 } from 'lucide-react'
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: Home, label: 'Dashboard', href: '/' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: Users, label: 'Players', href: '/dashboard' },
    { icon: Settings, label: 'Admin', href: '/admin' },
    { icon: BarChart2, label: 'Statistics', href: '/stats' },
  ]

  return (
    <div className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Billiards Ladder</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 mt-2 text-gray-600 rounded-lg hover:bg-gray-100",
                pathname === item.href && "bg-blue-50 text-blue-600"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="mx-4">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

