'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, Ticket, Star, Gift, Settings, 
  LogOut, TrendingUp, Award, Clock 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatCurrency, getLoyaltyTierColor } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [loyaltyInfo, setLoyaltyInfo] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchProfileData()
  }, [isAuthenticated])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      const [loyaltyRes, bookingsRes, rewardsRes] = await Promise.all([
        api.getMyLoyaltyInfo(),
        api.getMyBookings({ limit: 10 }),
        api.getAvailableRewards()
      ])

      setLoyaltyInfo(loyaltyRes.loyalty)
      setBookings(bookingsRes.bookings || [])
      setRewards(rewardsRes.rewards || [])
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: 'Đăng xuất thành công',
      description: 'Hẹn gặp lại bạn!'
    })
    router.push('/')
  }

  const handleViewAllBookings = () => {
    router.push('/profile/bookings')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-24">
              {/* Profile Info */}
              <div className="text-center mb-6 pb-6 border-b border-gray-800">
                <div className="w-20 h-20 bg-gradient-to-br from-cinema-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-lg mb-1">{user?.fullName}</h3>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-cinema-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Tổng quan</span>
                </button>

                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'bookings'
                      ? 'bg-cinema-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  <span>Vé của tôi</span>
                </button>

                <button
                  onClick={() => setActiveTab('loyalty')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'loyalty'
                      ? 'bg-cinema-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span>Điểm thưởng</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-cinema-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>Cài đặt</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-3xl font-bold mb-2">Xin chào, {user?.fullName}!</h1>
                  <p className="text-gray-400">Chào mừng bạn quay trở lại</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-cinema-600 to-cinema-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Ticket className="w-8 h-8" />
                      <TrendingUp className="w-6 h-6 text-cinema-200" />
                    </div>
                    <p className="text-2xl font-bold mb-1">{loyaltyInfo?.totalBookings || 0}</p>
                    <p className="text-cinema-100 text-sm">Tổng vé đã đặt</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Star className="w-8 h-8" />
                      <TrendingUp className="w-6 h-6 text-yellow-200" />
                    </div>
                    <p className="text-2xl font-bold mb-1">{loyaltyInfo?.points || 0}</p>
                    <p className="text-yellow-100 text-sm">Điểm tích lũy</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Award className="w-8 h-8" />
                    </div>
                    <p className="text-2xl font-bold mb-1 capitalize">{loyaltyInfo?.tier || 'Bronze'}</p>
                    <p className="text-purple-100 text-sm">Hạng thành viên</p>
                  </motion.div>
                </div>

                {/* Recent Bookings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Vé gần đây</h2>
                    <Button onClick={handleViewAllBookings} variant="outline" size="sm">
                      Xem tất cả
                    </Button>
                  </div>

                  {bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.slice(0, 5).map((booking: any) => (
                        <div
                          key={booking._id}
                          className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                          onClick={() => router.push(`/payment/${booking._id}`)}
                        >
                          <div className="flex-shrink-0 w-16 h-24 bg-gray-700 rounded overflow-hidden">
                            {booking.showtimeId?.movieId?.poster && (
                              <img
                                src={booking.showtimeId.movieId.poster}
                                alt={booking.showtimeId.movieId.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold mb-1 truncate">
                              {booking.showtimeId?.movieId?.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {booking.showtimeId?.cinemaId?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {new Date(booking.showtimeId?.startTime).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400'
                                : booking.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                            </span>
                            <p className="text-sm font-bold mt-2">{formatCurrency(booking.totalAmount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400">Chưa có vé nào</p>
                      <Button
                        onClick={() => router.push('/movies')}
                        className="mt-4 bg-cinema-600 hover:bg-cinema-700"
                      >
                        Đặt vé ngay
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {activeTab === 'loyalty' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Chương trình thành viên</h2>

                {/* Loyalty Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative overflow-hidden rounded-lg p-8 ${getLoyaltyTierColor(loyaltyInfo?.tier || 'bronze')}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <p className="text-sm opacity-80 mb-1">Hạng thành viên</p>
                        <h3 className="text-3xl font-bold capitalize">{loyaltyInfo?.tier || 'Bronze'}</h3>
                      </div>
                      <Award className="w-16 h-16 opacity-50" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm opacity-80 mb-1">Điểm hiện tại</p>
                        <p className="text-2xl font-bold">{loyaltyInfo?.points || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-80 mb-1">Điểm cần để lên hạng</p>
                        <p className="text-2xl font-bold">{loyaltyInfo?.pointsToNextTier || 0}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              ((loyaltyInfo?.points || 0) / (loyaltyInfo?.nextTierPoints || 1000)) * 100
                            )}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                  </div>
                </motion.div>

                {/* Benefits */}
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-bold mb-4">Quyền lợi thành viên</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: Gift, title: 'Giảm giá đặc biệt', desc: 'Giảm 10-20% cho vé và combo' },
                      { icon: Star, title: 'Tích điểm x2', desc: 'Nhận điểm gấp đôi mọi giao dịch' },
                      { icon: Ticket, title: 'Ưu tiên đặt vé', desc: 'Đặt vé sớm cho phim hot' },
                      { icon: Award, title: 'Quà tặng sinh nhật', desc: 'Vé miễn phí trong tháng sinh nhật' }
                    ].map((benefit, index) => {
                      const Icon = benefit.icon
                      return (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gray-800 rounded-lg">
                          <div className="p-2 bg-cinema-500/20 rounded-lg">
                            <Icon className="w-5 h-5 text-cinema-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">{benefit.title}</h4>
                            <p className="text-sm text-gray-400">{benefit.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Available Rewards */}
                {rewards.length > 0 && (
                  <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                    <h3 className="text-xl font-bold mb-4">Phần thưởng có thể đổi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rewards.map((reward: any) => (
                        <div key={reward._id} className="p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{reward.name}</h4>
                            <span className="text-cinema-400 font-bold">{reward.points} điểm</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{reward.description}</p>
                          <Button
                            size="sm"
                            disabled={loyaltyInfo?.points < reward.points}
                            className="w-full bg-cinema-600 hover:bg-cinema-700"
                          >
                            {loyaltyInfo?.points >= reward.points ? 'Đổi ngay' : 'Chưa đủ điểm'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Lịch sử đặt vé</h2>
                {/* This would be a full booking history component */}
                <Button onClick={handleViewAllBookings} className="bg-cinema-600 hover:bg-cinema-700">
                  Xem chi tiết
                </Button>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Cài đặt tài khoản</h2>
                <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <p className="text-gray-400">Tính năng đang được phát triển...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
