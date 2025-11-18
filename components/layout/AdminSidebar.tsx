'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Film,
  MapPin,
  Calendar,
  Ticket,
  Users,
  Gift,
  Star,
  Settings,
  TrendingUp,
  DollarSign,
  BarChart3,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Bot,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Tổng quan',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Thống kê', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Doanh thu', href: '/admin/revenue', icon: DollarSign }
    ]
  },
  {
    title: 'Quản lý',
    items: [
      { name: 'Phim', href: '/admin/movies', icon: Film },
      { name: 'Rạp', href: '/admin/cinemas', icon: MapPin },
      { name: 'Lịch chiếu', href: '/admin/showtimes', icon: Calendar },
      { name: 'Đặt vé', href: '/admin/bookings', icon: Ticket },
      { name: 'Khách hàng', href: '/admin/customers', icon: Users },
      { name: 'Khuyến mãi', href: '/admin/promotions', icon: Gift },
      { name: 'Đánh giá', href: '/admin/reviews', icon: Star }
    ]
  },
  {
    title: 'AI & Tự động hóa',
    items: [
      { name: 'Dự báo doanh thu', href: '/admin/revenue-forecast', icon: TrendingUp },
      { name: 'Khuyến mãi tự động', href: '/admin/auto-promotions', icon: Sparkles },
      { name: 'Chatbot AI', href: '/admin/chatbot', icon: Bot }
    ]
  },
  {
    title: 'Hệ thống',
    items: [
      { name: 'Nhân viên', href: '/admin/staff', icon: UserCog },
      { name: 'Cài đặt', href: '/admin/settings', icon: Settings }
    ]
  }
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        'fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 z-40 transition-all',
        className
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <Film className="w-6 h-6 text-cinema-500" />
            <span className="font-bold text-white text-lg">ADMIN</span>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            {!isCollapsed && (
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                {section.title}
              </motion.h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                
                return (
                  <Link key={item.href} href={item.href}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative',
                        isActive
                          ? 'bg-cinema-500/10 text-cinema-500'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-indicator"
                          className="absolute left-0 w-1 h-8 bg-cinema-500 rounded-r"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-cinema-500')} />
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </motion.aside>
  )
}
