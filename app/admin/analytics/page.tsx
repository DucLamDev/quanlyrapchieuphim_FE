'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Film, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

export default function AdminAnalytics() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [movieStats, setMovieStats] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchAnalytics()
  }, [isAuthenticated, user, timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const [dashboardRes, revenueRes, moviesRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRevenueByPeriod({ range: timeRange }),
        api.getRevenueByMovie({ limit: 10 })
      ])

      setStats(dashboardRes.stats)
      setRevenueData(revenueRes.data || [])
      setMovieStats(moviesRes.data || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cinema-600"></div>
        </div>
      </AdminLayout>
    )
  }

  const kpiCards = [
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats?.thisMonth?.revenue || 0),
      icon: DollarSign,
      color: 'from-green-600 to-green-700',
      trend: `${stats?.thisMonth?.growth || 0}%`
    },
    {
      title: 'Tổng vé đã bán',
      value: (stats?.thisMonth?.bookings || 0).toLocaleString(),
      icon: BarChart3,
      color: 'from-blue-600 to-blue-700',
      trend: '+12%'
    },
    {
      title: 'Khách hàng mới',
      value: (stats?.newCustomersThisMonth || 0).toLocaleString(),
      icon: Users,
      color: 'from-purple-600 to-purple-700',
      trend: '+8%'
    },
    {
      title: 'Phim đang chiếu',
      value: stats?.activeMovies || 0,
      icon: Film,
      color: 'from-orange-600 to-orange-700',
      trend: 'Stable'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-600 to-purple-600 bg-clip-text text-transparent">
              Phân tích & Thống kê
            </h1>
            <p className="text-gray-400 mt-1">Insights và xu hướng kinh doanh</p>
          </div>

          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-cinema-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : '90 ngày'}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((card, index) => {
            const Icon = card.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-green-400">{card.trend}</span>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
                <p className="text-2xl font-bold">{card.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Xu hướng doanh thu</h2>
              <p className="text-sm text-gray-400">Theo thời gian</p>
            </div>
            <TrendingUp className="w-6 h-6 text-cinema-400" />
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#e11d48"
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Movies & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold mb-6">Top phim doanh thu</h2>

            <div className="space-y-4">
              {movieStats.slice(0, 5).map((movie: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cinema-600 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{movie.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cinema-600 to-purple-600"
                          style={{ width: `${(movie.totalRevenue / movieStats[0].totalRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{movie.totalTickets} vé</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-cinema-400">{formatCurrency(movie.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
          >
            <h2 className="text-xl font-bold mb-6">Hiệu suất kinh doanh</h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Tỷ lệ lấp đầy trung bình</span>
                  <span className="font-bold">{stats?.averageOccupancy || 0}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-600 to-green-400"
                    style={{ width: `${stats?.averageOccupancy || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Giá vé trung bình</span>
                  <span className="font-bold">{formatCurrency(stats?.averageTicketPrice || 0)}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Revenue per customer</span>
                  <span className="font-bold">{formatCurrency(stats?.revenuePerCustomer || 0)}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Tỷ lệ mua combo</span>
                  <span className="font-bold">{stats?.comboAttachRate || 0}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    style={{ width: `${stats?.comboAttachRate || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}
