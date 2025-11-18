'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Calendar, Film, Building, Settings } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export default function RevenueForecastPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [forecastData, setForecastData] = useState<any>(null)
  const [movieForecasts, setMovieForecasts] = useState<any[]>([])
  const [cinemaForecasts, setCinemaForecasts] = useState<any[]>([])
  const [dynamicPricing, setDynamicPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchForecastData()
  }, [isAuthenticated, user, selectedPeriod])

  const fetchForecastData = async () => {
    try {
      setLoading(true)
      
      // Mock data for demo - Replace with real API calls
      setForecastData({
        currentRevenue: 250000000,
        forecastedRevenue: 320000000,
        growth: 28,
        confidence: 85
      })

      setMovieForecasts([
        {
          movieTitle: 'Mai',
          currentRevenue: 80000000,
          forecastRevenue: 105000000,
          growth: 31.25,
          avgOccupancy: 75,
          recommendedPrice: 95000
        },
        {
          movieTitle: 'Cám',
          currentRevenue: 65000000,
          forecastRevenue: 82000000,
          growth: 26.15,
          avgOccupancy: 68,
          recommendedPrice: 85000
        },
        {
          movieTitle: 'Deadpool & Wolverine',
          currentRevenue: 55000000,
          forecastRevenue: 72000000,
          growth: 30.91,
          avgOccupancy: 72,
          recommendedPrice: 92000
        },
        {
          movieTitle: 'Oppenheimer',
          currentRevenue: 50000000,
          forecastRevenue: 61000000,
          growth: 22,
          avgOccupancy: 65,
          recommendedPrice: 88000
        }
      ])

      setCinemaForecasts([
        {
          cinemaName: 'CGV Vincom Bà Triệu',
          currentRevenue: 90000000,
          forecastRevenue: 115000000,
          growth: 27.78,
          avgOccupancy: 71
        },
        {
          cinemaName: 'Galaxy Cinema Nguyễn Du',
          currentRevenue: 85000000,
          forecastRevenue: 108000000,
          growth: 27.06,
          avgOccupancy: 69
        },
        {
          cinemaName: 'Lotte Cinema Landmark 81',
          currentRevenue: 45000000,
          forecastRevenue: 58000000,
          growth: 28.89,
          avgOccupancy: 63
        },
        {
          cinemaName: 'BHD Star Royal City',
          currentRevenue: 30000000,
          forecastRevenue: 39000000,
          growth: 30,
          avgOccupancy: 58
        }
      ])

      // Dynamic pricing recommendations
      setDynamicPricing([
        {
          showtime: 'Mai - CGV Bà Triệu - 19:00',
          currentPrice: 80000,
          recommendedPrice: 95000,
          reason: 'Giờ vàng + Cuối tuần + Occupancy cao (85%)',
          expectedRevenue: '+18.75%'
        },
        {
          showtime: 'Cám - Galaxy Nguyễn Du - 21:30',
          currentPrice: 80000,
          recommendedPrice: 92000,
          reason: 'Suất muộn cuối tuần + Phim hot',
          expectedRevenue: '+15%'
        },
        {
          showtime: 'Oppenheimer - Lotte Landmark - 09:00',
          currentPrice: 80000,
          recommendedPrice: 65000,
          reason: 'Buổi sáng + Occupancy thấp (20%)',
          expectedRevenue: '+12% (Volume up)'
        },
        {
          showtime: 'Doraemon - BHD Royal - 14:00',
          currentPrice: 80000,
          recommendedPrice: 72000,
          reason: 'Giờ chiều + Gia đình',
          expectedRevenue: '+8%'
        }
      ])

    } catch (error) {
      console.error('Error fetching forecast data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyDynamicPricing = async (showtimeId: string, newPrice: number) => {
    try {
      // API call to update pricing
      // await api.updateShowtimePrice(showtimeId, newPrice)
      alert(`Đã áp dụng giá mới: ${formatCurrency(newPrice)}`)
    } catch (error) {
      console.error('Error applying dynamic pricing:', error)
    }
  }

  const weeklyForecastChart = [
    { day: 'T2', actual: 35000000, forecast: 38000000 },
    { day: 'T3', actual: 32000000, forecast: 35000000 },
    { day: 'T4', actual: 30000000, forecast: 33000000 },
    { day: 'T5', actual: 34000000, forecast: 37000000 },
    { day: 'T6', actual: 42000000, forecast: 48000000 },
    { day: 'T7', actual: 55000000, forecast: 65000000 },
    { day: 'CN', actual: 52000000, forecast: 64000000 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-cinema-600" />
            Phân tích & Dự báo Doanh thu
          </h1>
          <p className="text-gray-600 mt-2">Tối ưu giá và doanh thu bằng AI Machine Learning</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Doanh thu hiện tại</h3>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(forecastData?.currentRevenue || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">7 ngày qua</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Dự báo 7 ngày tới</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(forecastData?.forecastedRevenue || 0)}
            </p>
            <p className="text-sm text-green-600 mt-2">+{forecastData?.growth}% dự kiến</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Tăng trưởng</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              +{forecastData?.growth}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Week over week</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Độ tin cậy AI</h3>
              <AlertCircle className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {forecastData?.confidence}%
            </p>
            <p className="text-sm text-gray-500 mt-2">Confidence score</p>
          </motion.div>
        </div>

        {/* Weekly Forecast Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Dự báo Doanh thu Tuần</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyForecastChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#e11d48" name="Thực tế" strokeWidth={2} />
              <Line type="monotone" dataKey="forecast" stroke="#10b981" name="Dự báo" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Movie Forecasts */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Film className="w-6 h-6 text-cinema-600" />
              Dự báo theo Phim
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phim</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hiện tại</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Dự báo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tăng trưởng</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá đề xuất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {movieForecasts.map((movie, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{movie.movieTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                      {formatCurrency(movie.currentRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-semibold">
                      {formatCurrency(movie.forecastRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +{movie.growth}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${movie.avgOccupancy > 70 ? 'bg-green-500' : movie.avgOccupancy > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${movie.avgOccupancy}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{movie.avgOccupancy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-cinema-600">
                      {formatCurrency(movie.recommendedPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Pricing Recommendations */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 text-cinema-600" />
              Đề xuất Giá Động (Dynamic Pricing)
            </h2>
            <div className="text-sm text-gray-600">
              AI-powered pricing optimization
            </div>
          </div>
          <div className="space-y-4">
            {dynamicPricing.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border rounded-lg p-4 hover:border-cinema-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.showtime}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.reason}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <span className="text-xs text-gray-500">Giá hiện tại</span>
                        <p className="text-lg font-semibold text-gray-700">{formatCurrency(item.currentPrice)}</p>
                      </div>
                      <div className="text-2xl text-gray-400">→</div>
                      <div>
                        <span className="text-xs text-gray-500">Giá đề xuất</span>
                        <p className="text-lg font-semibold text-cinema-600">{formatCurrency(item.recommendedPrice)}</p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs text-gray-500">Doanh thu dự kiến</span>
                        <p className="text-lg font-semibold text-green-600">{item.expectedRevenue}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <Button
                      onClick={() => applyDynamicPricing(item.showtime, item.recommendedPrice)}
                      className="bg-cinema-600 hover:bg-cinema-700"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cinema Forecasts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Building className="w-6 h-6 text-cinema-600" />
              Dự báo theo Rạp
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cinemaForecasts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cinemaName" angle={-15} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="currentRevenue" fill="#e11d48" name="Hiện tại" />
              <Bar dataKey="forecastRevenue" fill="#10b981" name="Dự báo" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Footer />
    </div>
  )
}
