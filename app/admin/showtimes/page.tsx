'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatDate, formatTime } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function AdminShowtimesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  
  const [showtimes, setShowtimes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchShowtimes()
  }, [isAuthenticated, user])

  const fetchShowtimes = async () => {
    try {
      setLoading(true)
      const response = await api.getShowtimes()
      setShowtimes(response.showtimes || mockShowtimes)
    } catch (error) {
      console.error('Error fetching showtimes:', error)
      setShowtimes(mockShowtimes)
    } finally {
      setLoading(false)
    }
  }

  const mockShowtimes = [
    {
      _id: '1',
      movieId: { title: 'Spider-Man: No Way Home', duration: 148 },
      cinemaId: { name: 'CGV Vincom Center' },
      room: { name: 'Rạp 1', capacity: 150 },
      startTime: new Date(Date.now() + 2 * 3600000).toISOString(),
      endTime: new Date(Date.now() + 4.5 * 3600000).toISOString(),
      price: { standard: 80000, vip: 120000, couple: 150000 },
      availableSeats: 120,
      status: 'available'
    },
    {
      _id: '2',
      movieId: { title: 'Avatar: The Way of Water', duration: 192 },
      cinemaId: { name: 'Lotte Cinema Diamond' },
      room: { name: 'Rạp IMAX', capacity: 200 },
      startTime: new Date(Date.now() + 4 * 3600000).toISOString(),
      endTime: new Date(Date.now() + 7.2 * 3600000).toISOString(),
      price: { standard: 90000, vip: 150000, couple: 180000 },
      availableSeats: 180,
      status: 'available'
    }
  ]

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa suất chiếu này?')) return

    try {
      await api.deleteShowtime(id)
      toast({
        title: 'Thành công',
        description: 'Đã xóa suất chiếu'
      })
      fetchShowtimes()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa suất chiếu',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý lịch chiếu</h1>
            <p className="text-gray-400">Thêm, sửa, xóa suất chiếu</p>
          </div>
          <Button
            onClick={() => router.push('/admin/showtimes/create')}
            className="bg-cinema-600 hover:bg-cinema-700 gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm suất chiếu
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Phim</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Rạp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Phòng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Giờ chiếu</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {showtimes.map((showtime, index) => (
                    <motion.tr
                      key={showtime._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-800/50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold">{showtime.movieId?.title}</p>
                        <p className="text-sm text-gray-400">{showtime.movieId?.duration} phút</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{showtime.cinemaId?.name}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">{showtime.room?.name}</p>
                        <p className="text-xs text-gray-500">{showtime.room?.capacity} ghế</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-cinema-400" />
                          <div>
                            <p className="font-semibold">{formatDate(showtime.startTime)}</p>
                            <p className="text-gray-400">{formatTime(showtime.startTime)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          showtime.status === 'available'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {showtime.status === 'available' ? 'Có thể đặt' : 'Hết vé'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/showtimes/edit/${showtime._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(showtime._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
