'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Ticket, Download, Calendar, MapPin, Clock, QrCode } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatDate, formatTime, formatCurrency } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

export default function MyBookingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchBookings()
  }, [isAuthenticated, filter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (filter !== 'all') {
        params.status = filter
      }
      const response = await api.getMyBookings(params)
      setBookings(response.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBookings = bookings

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Vé của tôi</h1>
          <p className="text-gray-400">Quản lý và xem lại các vé đã đặt</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'confirmed', label: 'Đã xác nhận' },
            { value: 'pending', label: 'Chờ thanh toán' },
            { value: 'cancelled', label: 'Đã hủy' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-cinema-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const movie = booking.showtimeId?.movieId
              const showtime = booking.showtimeId
              const cinema = booking.showtimeId?.cinemaId

              return (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-cinema-500/50 transition-all"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Movie Poster */}
                    <div className="md:w-32 h-48 md:h-auto bg-gray-800 flex-shrink-0">
                      {movie?.poster && (
                        <Image
                          src={movie.poster}
                          alt={movie.title}
                          width={128}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Booking Info */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{movie?.title}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed'
                              ? 'bg-green-500/20 text-green-400'
                              : booking.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {booking.status === 'confirmed' ? 'Đã xác nhận' :
                             booking.status === 'pending' ? 'Chờ thanh toán' : 'Đã hủy'}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-cinema-400">
                          {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPin className="w-4 h-4 text-cinema-400" />
                          <div>
                            <p className="text-sm font-semibold">{cinema?.name}</p>
                            <p className="text-xs text-gray-500">{showtime?.room?.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cinema-400" />
                          <div>
                            <p className="text-sm font-semibold">{formatDate(showtime?.startTime)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-cinema-400" />
                          <div>
                            <p className="text-sm font-semibold">{formatTime(showtime?.startTime)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Ghế ngồi:</p>
                          <p className="font-semibold">
                            {booking.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          {booking.status === 'confirmed' && (
                            <>
                              <Button
                                onClick={() => router.push(`/payment/${booking._id}`)}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <QrCode className="w-4 h-4" />
                                Xem vé
                              </Button>
                              <Button
                                size="sm"
                                className="bg-cinema-600 hover:bg-cinema-700 gap-2"
                              >
                                <Download className="w-4 h-4" />
                                Tải vé
                              </Button>
                            </>
                          )}
                          {booking.status === 'pending' && (
                            <Button
                              onClick={() => router.push(`/payment/${booking._id}`)}
                              className="bg-cinema-600 hover:bg-cinema-700"
                            >
                              Thanh toán ngay
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Booking Code */}
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500">
                          Mã đặt vé: <span className="font-mono font-semibold text-gray-400">{booking.bookingCode}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-6">Chưa có vé nào</p>
            <Button
              onClick={() => router.push('/movies')}
              className="bg-cinema-600 hover:bg-cinema-700"
            >
              Đặt vé ngay
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
