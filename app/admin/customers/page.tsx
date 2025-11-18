'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Search, Filter, Eye, Mail, Phone,
  Calendar, Award, TrendingUp, Ticket, DollarSign,
  Star, MapPin, X
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTier, setFilterTier] = useState('all')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers()
      const customerList = response.users?.filter((u: any) => u.role === 'customer') || []
      setCustomers(customerList)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      const [userRes, bookingsRes] = await Promise.all([
        api.getUserById(customerId),
        api.getBookings({ userId: customerId })
      ])
      
      setSelectedCustomer({
        ...userRes.user,
        bookings: bookingsRes.bookings || []
      })
    } catch (error) {
      console.error('Error fetching customer details:', error)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
    
    const matchesTier = filterTier === 'all' || customer.loyaltyTier === filterTier
    
    return matchesSearch && matchesTier
  })

  const getLoyaltyBadgeColor = (tier: string) => {
    const colors = {
      bronze: 'from-orange-700 to-orange-900',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600'
    }
    return colors[tier as keyof typeof colors] || colors.bronze
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý khách hàng</h1>
            <p className="text-gray-400">Xem và quản lý thông tin khách hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-400">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-cinema-500">{customers.length}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'bronze', 'silver', 'gold', 'platinum'].map(tier => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                  filterTier === tier
                    ? 'bg-cinema-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tier === 'all' ? 'Tất cả' : tier}
              </button>
            ))}
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Khách hàng</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Liên hệ</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Hạng thành viên</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Điểm tích lũy</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Ngày tham gia</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-400">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cinema-500 to-purple-600 flex items-center justify-center font-bold">
                        {customer.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{customer.fullName}</p>
                        <p className="text-sm text-gray-400">ID: {customer._id.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${getLoyaltyBadgeColor(customer.loyaltyTier || 'bronze')} text-white capitalize`}>
                      <Award className="w-4 h-4" />
                      {customer.loyaltyTier || 'bronze'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-semibold text-white">
                        {customer.loyaltyPoints?.toLocaleString() || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchCustomerDetails(customer._id)}
                      className="text-cinema-400 hover:text-cinema-300"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedCustomer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cinema-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                    {selectedCustomer.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedCustomer.fullName}</h2>
                    <p className="text-gray-400">{selectedCustomer.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Ticket className="w-5 h-5 text-cinema-400" />
                      <span className="text-sm text-gray-400">Tổng vé</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedCustomer.bookings?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-400" />
                      <span className="text-sm text-gray-400">Tổng chi tiêu</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(
                        selectedCustomer.bookings?.reduce((sum: number, b: any) => sum + (b.finalAmount || 0), 0) || 0
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm text-gray-400">Điểm tích lũy</span>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {selectedCustomer.loyaltyPoints?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-gray-400">Hạng</span>
                    </div>
                    <p className="text-2xl font-bold text-white capitalize">
                      {selectedCustomer.loyaltyTier || 'Bronze'}
                    </p>
                  </div>
                </div>

                {/* Booking History */}
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cinema-400" />
                    Lịch sử đặt vé
                  </h3>
                  <div className="space-y-3">
                    {selectedCustomer.bookings?.length > 0 ? (
                      selectedCustomer.bookings.map((booking: any) => (
                        <div key={booking._id} className="bg-gray-800 rounded-lg p-4 flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white mb-1">
                              Mã vé: {booking.bookingCode}
                            </p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                              <span>Ngày: {formatDate(booking.createdAt)}</span>
                              <span>Trạng thái: <span className={`font-semibold ${
                                booking.status === 'confirmed' ? 'text-green-400' :
                                booking.status === 'used' ? 'text-blue-400' :
                                booking.status === 'cancelled' ? 'text-red-400' :
                                'text-gray-400'
                              }`}>{booking.status}</span></span>
                              <span>Ghế: {booking.seats?.length || 0}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-cinema-400">
                              {formatCurrency(booking.finalAmount)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        Chưa có lịch sử đặt vé
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  )
}
