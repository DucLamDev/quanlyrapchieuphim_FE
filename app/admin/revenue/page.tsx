'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { DollarSign, Download, Calendar, TrendingUp, Building2, Film } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

export default function AdminRevenue() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')
  const [viewType, setViewType] = useState<'period' | 'movie' | 'cinema'>('period')
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchRevenueData()
  }, [isAuthenticated, user, timeRange, viewType])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      const dashboardRes = await api.getDashboardStats()
      setStats(dashboardRes.stats)

      if (viewType === 'period') {
        const revenueRes = await api.getRevenueByPeriod({ range: timeRange })
        setRevenueData(revenueRes.data || [])
      } else if (viewType === 'movie') {
        const movieRes = await api.getRevenueByMovie({ limit: 10 })
        setRevenueData(movieRes.data || [])
      } else if (viewType === 'cinema') {
        // API endpoint tương tự
        setRevenueData([])
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = await api.exportReport({ 
        range: timeRange,
        type: viewType
      })
      
      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `revenue-report-${new Date().toISOString()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
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

  const summaryCards = [
    {
      title: 'Doanh thu hôm nay',
      value: formatCurrency(stats?.today?.revenue || 0),
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Doanh thu tháng này',
      value: formatCurrency(stats?.thisMonth?.revenue || 0),
      icon: TrendingUp,
      color: 'text-blue-400'
    },
    {
      title: 'Tổng doanh thu',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: Building2,
      color: 'text-purple-400'
    },
    {
      title: 'Tăng trưởng',
      value: `${stats?.thisMonth?.growth || 0}%`,
      icon: Calendar,
      color: 'text-cinema-400'
    }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-600 to-purple-600 bg-clip-text text-transparent">
              Quản lý Doanh thu
            </h1>
            <p className="text-gray-400 mt-1">Báo cáo và phân tích doanh thu chi tiết</p>
          </div>

          <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((card, index) => {
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
                  <Icon className={`w-8 h-8 ${card.color}`} />
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{card.title}</h3>
                <p className="text-2xl font-bold">{card.value}</p>
              </motion.div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            <span className="text-gray-400 self-center">Xem theo:</span>
            {[
              { value: 'period', label: 'Thời gian', icon: Calendar },
              { value: 'movie', label: 'Phim', icon: Film },
              { value: 'cinema', label: 'Rạp', icon: Building2 }
            ].map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  onClick={() => setViewType(type.value as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    viewType === type.value
                      ? 'bg-cinema-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              )
            })}
          </div>

          {viewType === 'period' && (
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
          )}
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold mb-6">
            {viewType === 'period' && 'Doanh thu theo thời gian'}
            {viewType === 'movie' && 'Doanh thu theo phim'}
            {viewType === 'cinema' && 'Doanh thu theo rạp'}
          </h2>

          <ResponsiveContainer width="100%" height={400}>
            {viewType === 'period' ? (
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
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
            ) : (
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="title" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="totalRevenue" fill="#e11d48" name="Doanh thu" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
        >
          <h2 className="text-xl font-bold mb-6">Chi tiết doanh thu</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                    {viewType === 'movie' ? 'Phim' : viewType === 'cinema' ? 'Rạp' : 'Ngày'}
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Số vé</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Doanh thu</th>
                  <th className="text-right py-3 px-4 text-gray-400 font-semibold">Trung bình</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-3 px-4">{item.title || item.date || item.name}</td>
                    <td className="text-right py-3 px-4">{item.totalTickets || item.bookings || 0}</td>
                    <td className="text-right py-3 px-4 font-bold text-cinema-400">
                      {formatCurrency(item.totalRevenue || item.revenue || 0)}
                    </td>
                    <td className="text-right py-3 px-4">
                      {formatCurrency((item.totalRevenue || item.revenue || 0) / (item.totalTickets || item.bookings || 1))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
