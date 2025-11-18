'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function AdminPromotions() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [promotions, setPromotions] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchPromotions()
  }, [isAuthenticated, user])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const res = await api.getPromotions()
      setPromotions(res.data || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.isActive && new Date(p.validUntil) > new Date()).length,
    expired: promotions.filter(p => new Date(p.validUntil) < new Date()).length,
    totalDiscount: promotions.reduce((sum, p) => sum + (p.totalUsed * p.discountValue || 0), 0)
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-600 to-purple-600 bg-clip-text text-transparent">
              Quản lý Khuyến mãi
            </h1>
            <p className="text-gray-400 mt-1">Tạo và quản lý các chương trình khuyến mãi</p>
          </div>

          <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Tạo khuyến mãi
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Tổng khuyến mãi', value: stats.total, icon: Tag, color: 'text-blue-400' },
            { label: 'Đang hoạt động', value: stats.active, icon: Percent, color: 'text-green-400' },
            { label: 'Đã hết hạn', value: stats.expired, icon: Calendar, color: 'text-gray-400' },
            { label: 'Tổng giảm giá', value: formatCurrency(stats.totalDiscount), icon: DollarSign, color: 'text-cinema-400' }
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
                    <p className="text-2xl font-bold">{typeof stat.value === 'number' && stat.label !== 'Tổng giảm giá' ? stat.value : stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo: any) => {
            const isActive = promo.isActive && new Date(promo.validUntil) > new Date()
            const usagePercent = promo.usageLimit ? (promo.totalUsed / promo.usageLimit) * 100 : 0

            return (
              <motion.div
                key={promo._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800 hover:border-cinema-600 transition-colors"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {isActive ? 'Hoạt động' : 'Hết hạn'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPromotion(promo)}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => {/* Delete handler */}}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {/* Code */}
                <div className="mb-4">
                  <div className="text-2xl font-bold font-mono text-cinema-400 mb-2">
                    {promo.code}
                  </div>
                  <p className="text-gray-400 text-sm">{promo.description}</p>
                </div>

                {/* Discount Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Giảm giá:</span>
                    <span className="font-semibold">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}%`
                        : formatCurrency(promo.discountValue)}
                    </span>
                  </div>
                  {promo.minOrderValue && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Đơn tối thiểu:</span>
                      <span className="font-semibold">{formatCurrency(promo.minOrderValue)}</span>
                    </div>
                  )}
                  {promo.maxDiscountAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Giảm tối đa:</span>
                      <span className="font-semibold">{formatCurrency(promo.maxDiscountAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Usage */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Đã sử dụng:</span>
                    <span className="font-semibold">
                      {promo.totalUsed} / {promo.usageLimit || '∞'}
                    </span>
                  </div>
                  {promo.usageLimit && (
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cinema-600 to-purple-600"
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Từ {formatDate(promo.validFrom)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Đến {formatDate(promo.validUntil)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-12">
            <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có khuyến mãi nào</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">
              Tạo khuyến mãi đầu tiên
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
