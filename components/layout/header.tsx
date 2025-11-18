'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Film, 
  Search, 
  User, 
  Menu, 
  X, 
  Ticket,
  Home,
  MapPin,
  Heart,
  LogOut,
  Settings,
  Shield
} from 'lucide-react'
import { useAuthStore, useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'

export function Header() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { setSearchOpen } = useUIStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Phim', href: '/movies', icon: Film },
    { name: 'Rạp', href: '/cinemas', icon: MapPin },
    { name: 'Ưu đãi', href: '/promotions', icon: Heart },
  ]

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Film className="w-8 h-8 text-cinema-500 group-hover:scale-110 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-cinema-500 rounded-full blur-lg opacity-50"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-xl font-bold gradient-text">CINEMA</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'relative text-gray-300 hover:text-white',
                      isActive && 'text-cinema-500'
                    )}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-cinema-500"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="text-gray-300 hover:text-white"
                >
                  <User className="w-5 h-5" />
                </Button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-64 glass rounded-lg shadow-lg p-4 z-50"
                      >
                        <div className="mb-4 pb-4 border-b border-gray-700">
                          <p className="font-semibold text-white">{user?.fullName}</p>
                          <p className="text-sm text-gray-400">{user?.email}</p>
                          {user?.loyaltyTier && (
                            <span className={cn(
                              'inline-block mt-2 px-2 py-1 rounded text-xs font-semibold',
                              'bg-gradient-to-r from-yellow-400 to-yellow-600'
                            )}>
                              {user.loyaltyTier.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Link href="/profile" onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                              <Settings className="w-4 h-4 mr-2" />
                              Tài khoản
                            </Button>
                          </Link>
                          <Link href="/my-bookings" onClick={() => setIsUserMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                              <Ticket className="w-4 h-4 mr-2" />
                              Vé của tôi
                            </Button>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link href="/admin" onClick={() => setIsUserMenuOpen(false)}>
                              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                                <Shield className="w-4 h-4 mr-2" />
                                Quản trị
                              </Button>
                            </Link>
                          )}
                          {user?.role === 'staff' && (
                            <Link href="/staff" onClick={() => setIsUserMenuOpen(false)}>
                              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                                <Ticket className="w-4 h-4 mr-2" />
                                Quầy vé
                              </Button>
                            </Link>
                          )}
                          {user?.role === 'staff' && (
                            <Link href="/staff/counter-booking" onClick={() => setIsUserMenuOpen(false)}>
                              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                                <Settings className="w-4 h-4 mr-2" />
                                Đặt vé tại quầy
                              </Button>
                            </Link>
                          )}
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:text-red-300"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Đăng xuất
                          </Button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-cinema-600 hover:bg-cinema-700">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-800 space-y-2">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-gray-300 hover:text-white">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-cinema-600 hover:bg-cinema-700">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
