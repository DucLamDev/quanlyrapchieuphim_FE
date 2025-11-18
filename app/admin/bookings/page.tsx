'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Eye, XCircle, CheckCircle, Clock, Ticket } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { TicketPDF } from '@/components/staff/TicketPDF'

export default function AdminBookings() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<any[]>([])
  const [filteredBookings, setFilteredBookings] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showTicket, setShowTicket] = useState(false)
  const [ticketData, setTicketData] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchBookings()
  }, [isAuthenticated, user])

  useEffect(() => {
    filterBookings()
  }, [bookings, searchTerm, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.getAllBookings()
      setBookings(res.data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterBookings = () => {
    let filtered = bookings

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredBookings(filtered)
  }

  const handleViewTicket = async (bookingId: string) => {
    try {
      const res = await api.getPrintableTicket(bookingId)
      setTicketData(res.data)
      setShowTicket(true)
    } catch (error) {
      console.error('Error loading ticket:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-500/20 text-green-400 border-green-500',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500',
      used: 'bg-blue-500/20 text-blue-400 border-blue-500'
    }

    const labels = {
      confirmed: 'Đã xác nhận',
      pending: 'Chờ thanh toán',
      cancelled: 'Đã hủy',
      used: 'Đã sử dụng'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-xs border ${styles[status as keyof typeof styles] || ''}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-600 to-purple-600 bg-clip-text text-transparent">
            Quản lý Đặt vé
          </h1>
          <p className="text-gray-400 mt-1">Quản lý tất cả booking trong hệ thống</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng booking', value: stats.total, icon: Ticket, color: 'text-blue-400' },
            { label: 'Đã xác nhận', value: stats.confirmed, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Chờ thanh toán', value: stats.pending, icon: Clock, color: 'text-yellow-400' },
            { label: 'Đã hủy', value: stats.cancelled, icon: XCircle, color: 'text-red-400' }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã booking, tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cinema-600"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'confirmed', label: 'Đã xác nhận' },
              { value: 'pending', label: 'Chờ thanh toán' },
              { value: 'cancelled', label: 'Đã hủy' },
              { value: 'used', label: 'Đã sử dụng' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-cinema-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Mã booking</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Khách hàng</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Phim</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-semibold">Ghế</th>
                  <th className="text-right py-4 px-6 text-gray-400 font-semibold">Tổng tiền</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-semibold">Trạng thái</th>
                  <th className="text-center py-4 px-6 text-gray-400 font-semibold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking: any) => (
                  <tr key={booking._id} className="border-t border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 px-6 font-mono text-sm text-cinema-400">{booking.bookingCode}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold">{booking.userId?.fullName}</p>
                        <p className="text-sm text-gray-400">{booking.userId?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold">{booking.movieId?.title}</p>
                        <p className="text-sm text-gray-400">{booking.cinemaId?.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {booking.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}
                    </td>
                    <td className="text-right py-4 px-6 font-bold text-cinema-400">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="text-center py-4 px-6">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="text-center py-4 px-6">
                      <Button
                        onClick={() => handleViewTicket(booking._id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Xem vé
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy booking nào
            </div>
          )}
        </motion.div>

        {/* Ticket Modal */}
        {showTicket && ticketData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">In vé</h2>
                <button
                  onClick={() => setShowTicket(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <TicketPDF ticketData={ticketData} />

              <Button
                onClick={() => setShowTicket(false)}
                variant="outline"
                className="w-full mt-4"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
