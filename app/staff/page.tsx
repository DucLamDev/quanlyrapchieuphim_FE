'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Scan, Ticket, RefreshCw, CheckCircle, 
  XCircle, Search, Clock, User 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatCurrency, formatTime, formatDate } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function StaffDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCode, setSearchCode] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'staff') {
      router.push('/')
      return
    }
    fetchRecentBookings()
  }, [isAuthenticated, user])

  const fetchRecentBookings = async () => {
    try {
      setLoading(true)
      const response = await api.getAllBookings({ 
        status: 'confirmed',
        limit: 20,
        sort: '-createdAt'
      })
      setBookings(response.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleScanQR = async () => {
    if (!searchCode.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập mã đặt vé',
        variant: 'destructive'
      })
      return
    }

    try {
      // Find booking by code
      const booking = bookings.find(b => b.bookingCode === searchCode.toUpperCase())
      if (booking) {
        setSelectedBooking(booking)
        toast({
          title: 'Tìm thấy vé',
          description: `Vé cho phim ${booking.showtimeId?.movieId?.title}`
        })
      } else {
        toast({
          title: 'Không tìm thấy',
          description: 'Mã vé không hợp lệ hoặc đã được sử dụng',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể kiểm tra vé',
        variant: 'destructive'
      })
    }
  }

  const handleCheckIn = async () => {
    if (!selectedBooking) return

    try {
      // In a real app, this would call check-in API
      toast({
        title: 'Check-in thành công',
        description: 'Khách hàng đã được check-in'
      })
      setSelectedBooking(null)
      setSearchCode('')
      fetchRecentBookings()
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể check-in',
        variant: 'destructive'
      })
    }
  }

  const handleRefund = async (bookingId: string) => {
    if (!confirm('Xác nhận hoàn tiền cho vé này?')) return

    try {
      await api.cancelBooking(bookingId, 'Refund by staff')
      toast({
        title: 'Hoàn tiền thành công',
        description: 'Đã xử lý hoàn tiền'
      })
      fetchRecentBookings()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể hoàn tiền',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quầy vé</h1>
          <p className="text-gray-400">Hệ thống check-in và hỗ trợ khách hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Scanner */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-cinema-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="w-10 h-10 text-cinema-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Quét mã vé</h2>
                <p className="text-sm text-gray-400">Nhập mã hoặc quét QR code</p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleScanQR()}
                    placeholder="Nhập mã vé (VD: BK123456)"
                    className="w-full px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-500 text-center font-mono text-lg"
                  />
                </div>

                <Button
                  onClick={handleScanQR}
                  className="w-full bg-cinema-600 hover:bg-cinema-700"
                  size="lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Kiểm tra vé
                </Button>

                {selectedBooking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-400">Vé hợp lệ</span>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <p><span className="text-gray-400">Phim:</span> {selectedBooking.showtimeId?.movieId?.title}</p>
                      <p><span className="text-gray-400">Rạp:</span> {selectedBooking.showtimeId?.cinemaId?.name}</p>
                      <p><span className="text-gray-400">Phòng:</span> {selectedBooking.showtimeId?.room?.name}</p>
                      <p><span className="text-gray-400">Giờ chiếu:</span> {formatTime(selectedBooking.showtimeId?.startTime)}</p>
                      <p><span className="text-gray-400">Ghế:</span> {selectedBooking.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}</p>
                    </div>

                    <Button
                      onClick={handleCheckIn}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Xác nhận check-in
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Vé gần đây</h2>
                <Button
                  onClick={fetchRecentBookings}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="spinner" />
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-cinema-400">
                              {booking.bookingCode}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === 'confirmed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <p className="text-gray-400">Phim:</p>
                              <p className="font-semibold">{booking.showtimeId?.movieId?.title}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Khách hàng:</p>
                              <p className="font-semibold">{booking.userId?.fullName || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Giờ chiếu:</p>
                              <p className="font-semibold">
                                {formatDate(booking.showtimeId?.startTime)} - {formatTime(booking.showtimeId?.startTime)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-400">Ghế:</p>
                              <p className="font-semibold">
                                {booking.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <p className="text-right font-bold text-cinema-400">
                            {formatCurrency(booking.totalAmount)}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(booking._id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Hoàn vé
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400">Chưa có vé nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
