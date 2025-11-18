'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Users, Ticket, DollarSign, 
  Film, Calendar, AlertCircle, BarChart3,
  Clock, Star, Activity, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatCurrency } from '@/lib/utils'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'

const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [stats, setStats] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [movieStats, setMovieStats] = useState<any[]>([])
  const [bookingStats, setBookingStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated, user, timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardRes, revenueRes, moviesRes, bookingRes, activitiesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRevenueByPeriod({ range: timeRange }),
        api.getRevenueByMovie({ limit: 5 }),
        api.getBookingStats({ period: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90 }),
        api.getRecentActivities({ limit: 5 })
      ])

      setStats(dashboardRes.stats)
      setRevenueData(revenueRes.data || [])
      setMovieStats(moviesRes.data || [])
      setBookingStats(bookingRes.stats)
      setActivities(activitiesRes.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  // Use real API data only - no mock fallbacks
  const displayRevenueData = revenueData
  const displayMovieStats = movieStats

  const statCards = [
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(stats?.thisMonth?.revenue || 0),
      change: stats?.thisMonth?.growth ? `${stats.thisMonth.growth > 0 ? '+' : ''}${stats.thisMonth.growth}%` : '0%',
      trend: (stats?.thisMonth?.growth || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Số vé đã bán',
      value: (stats?.thisMonth?.bookings || 0).toLocaleString(),
      change: stats?.today?.bookings ? `+${stats.today.bookings} hôm nay` : '0 hôm nay',
      trend: 'up',
      icon: Ticket,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Tổng khách hàng',
      value: (stats?.totalCustomers || 0).toLocaleString(),
      change: 'Tất cả thời gian',
      trend: 'up',
      icon: Users,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Phim đang chiếu',
      value: (stats?.activeMovies || 0).toString(),
      change: 'Đang hoạt động',
      trend: 'up',
      icon: Film,
      color: 'from-orange-600 to-orange-700'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
            <p className="text-gray-400">Tổng quan hệ thống quản lý rạp chiếu phim</p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {['24h', '7d', '30d', '90d'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-cinema-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range === '24h' ? '24 giờ' : range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : '90 ngày'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                      stat.trend === 'up' ? 'text-green-200' : 'text-red-200'
                    }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {stat.change}
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.title}</p>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-16 -mr-16" />
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Doanh thu theo ngày</h2>
                <p className="text-sm text-gray-400">Biểu đồ doanh thu 7 ngày gần nhất</p>
              </div>
              <BarChart3 className="w-6 h-6 text-cinema-400" />
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={displayRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#e11d48" 
                  strokeWidth={3}
                  name="Doanh thu"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top Movies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Top phim</h2>
                <p className="text-sm text-gray-400">Doanh thu cao nhất</p>
              </div>
              <Star className="w-6 h-6 text-yellow-400" />
            </div>

            <div className="space-y-4">
              {displayMovieStats.length > 0 ? displayMovieStats.map((movie: any, index: number) => {
                const totalRevenue = stats?.thisMonth?.revenue || 1
                const percentage = Math.round((movie.totalRevenue / totalRevenue) * 100)
                
                return (
                  <div key={movie.movieId || index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-cinema-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{movie.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cinema-600 to-purple-600 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{percentage}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-cinema-400">
                        {formatCurrency(movie.totalRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">{movie.totalTickets} vé</p>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Bookings & Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Booking Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Thống kê đặt vé</h2>
                <p className="text-sm text-gray-400">Phân bổ theo trạng thái</p>
              </div>
              <Ticket className="w-6 h-6 text-cinema-400" />
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bookingStats?.statusDistribution?.map((item: any) => ({
                    name: item._id === 'confirmed' ? 'Đã xác nhận' : 
                          item._id === 'pending' ? 'Chờ thanh toán' :
                          item._id === 'cancelled' ? 'Đã hủy' :
                          item._id === 'used' ? 'Đã sử dụng' : item._id,
                    value: item.count
                  })) || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 rounded-lg p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Hoạt động gần đây</h2>
                <p className="text-sm text-gray-400">Real-time updates</p>
              </div>
              <Clock className="w-6 h-6 text-cinema-400" />
            </div>

            <div className="space-y-4">
              {(activities.length > 0 ? activities : [
                { type: 'pending', text: 'Chưa có hoạt động gần đây', time: 'N/A', icon: 'Clock' }
              ]).map((activity: any, index: number) => {
                const IconComponent = activity.icon === 'Ticket' ? Ticket :
                                       activity.icon === 'AlertCircle' ? AlertCircle :
                                       activity.icon === 'Clock' ? Clock :
                                       Users
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'booking' ? 'bg-blue-500/20 text-blue-400' :
                      activity.type === 'cancel' ? 'bg-red-500/20 text-red-400' :
                      activity.type === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-lg p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold mb-6">Quản lý nhanh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push('/admin/movies')}
              className="h-auto py-6 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
            >
              <Film className="w-8 h-8" />
              <span>Quản lý phim</span>
            </Button>
            <Button
              onClick={() => router.push('/admin/showtimes')}
              className="h-auto py-6 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
            >
              <Calendar className="w-8 h-8" />
              <span>Lịch chiếu</span>
            </Button>
            <Button
              onClick={() => router.push('/admin/bookings')}
              className="h-auto py-6 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
            >
              <Ticket className="w-8 h-8" />
              <span>Đặt vé</span>
            </Button>
            <Button
              onClick={() => router.push('/admin/users')}
              className="h-auto py-6 flex flex-col items-center gap-2 bg-gray-800 hover:bg-gray-700"
            >
              <Users className="w-8 h-8" />
              <span>Khách hàng</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
