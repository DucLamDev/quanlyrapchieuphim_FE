'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Tag, AlertCircle, CheckCircle, Clock, Percent, Users, Calendar } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function AutoPromotionsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()
  
  const [autoRules, setAutoRules] = useState<any[]>([])
  const [activePromotions, setActivePromotions] = useState<any[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchAutoPromotions()
  }, [isAuthenticated, user])

  const fetchAutoPromotions = async () => {
    try {
      setLoading(true)
      
      // Mock data - Replace with API
      setAutoRules([
        {
          id: '1',
          name: 'Giảm giá suất vắng',
          description: 'Tự động giảm 20% cho các suất chiếu dưới 50% đầy',
          status: 'active',
          trigger: {
            type: 'occupancy',
            condition: 'less_than',
            value: 50
          },
          action: {
            type: 'percentage',
            value: 20,
            maxDiscount: 50000
          },
          stats: {
            triggered: 45,
            revenue: 12500000,
            ticketsSold: 156
          }
        },
        {
          id: '2',
          name: 'Giảm giá buổi sáng',
          description: 'Giảm 15% cho suất chiếu trước 12h',
          status: 'active',
          trigger: {
            type: 'time_range',
            condition: 'between',
            value: ['00:00', '12:00']
          },
          action: {
            type: 'percentage',
            value: 15,
            maxDiscount: 30000
          },
          stats: {
            triggered: 78,
            revenue: 18200000,
            ticketsSold: 234
          }
        },
        {
          id: '3',
          name: 'Flash Sale cuối tuần',
          description: 'Giảm 25% cho 100 vé đầu tiên vào T7, CN',
          status: 'active',
          trigger: {
            type: 'day_of_week',
            condition: 'in',
            value: ['saturday', 'sunday']
          },
          action: {
            type: 'percentage',
            value: 25,
            maxDiscount: 60000,
            usageLimit: 100
          },
          stats: {
            triggered: 12,
            revenue: 8500000,
            ticketsSold: 95
          }
        },
        {
          id: '4',
          name: 'Early Bird Discount',
          description: 'Giảm 30.000đ khi đặt vé trước 3 ngày',
          status: 'paused',
          trigger: {
            type: 'booking_advance',
            condition: 'greater_than',
            value: 3 // days
          },
          action: {
            type: 'fixed_amount',
            value: 30000
          },
          stats: {
            triggered: 23,
            revenue: 5400000,
            ticketsSold: 67
          }
        }
      ])

      setActivePromotions([
        {
          code: 'AUTO_LOWOCCUPANCY_001',
          appliedTo: 'Mai - 14:00 - CGV Bà Triệu',
          discount: '20%',
          reason: 'Occupancy 35% < 50%',
          createdAt: new Date(Date.now() - 2 * 3600000),
          ticketsSold: 8
        },
        {
          code: 'AUTO_MORNING_002',
          appliedTo: 'Cám - 09:00 - Galaxy Nguyễn Du',
          discount: '15%',
          reason: 'Suất sáng (9:00)',
          createdAt: new Date(Date.now() - 5 * 3600000),
          ticketsSold: 12
        },
        {
          code: 'AUTO_WEEKEND_003',
          appliedTo: 'Oppenheimer - 21:30 - Lotte Landmark',
          discount: '25%',
          reason: 'Flash Sale cuối tuần',
          createdAt: new Date(Date.now() - 1 * 3600000),
          ticketsSold: 15
        }
      ])

    } catch (error) {
      console.error('Error fetching auto promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      // API call: await api.updatePromotionRule(ruleId, { status: newStatus })
      
      setAutoRules(autoRules.map(rule => 
        rule.id === ruleId ? { ...rule, status: newStatus } : rule
      ))

      toast({
        title: 'Thành công',
        description: `Đã ${newStatus === 'active' ? 'kích hoạt' : 'tạm dừng'} quy tắc`
      })
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật quy tắc',
        variant: 'destructive'
      })
    }
  }

  const createNewRule = () => {
    toast({
      title: 'Tính năng đang phát triển',
      description: 'Form tạo quy tắc mới sẽ được bổ sung'
    })
  }

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Tag className="w-8 h-8 text-cinema-600" />
              Quản lý Ưu đãi Tự động
            </h1>
            <p className="text-gray-600 mt-2">
              Tạo campaign khuyến mãi tự động dựa trên quy tắc AI
            </p>
          </div>
          <Button onClick={createNewRule} className="bg-cinema-600 hover:bg-cinema-700">
            <Plus className="w-4 h-4 mr-2" />
            Tạo quy tắc mới
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Quy tắc đang chạy</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {autoRules.filter(r => r.status === 'active').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Lượt kích hoạt</h3>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {autoRules.reduce((sum, r) => sum + r.stats.triggered, 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Vé đã bán</h3>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {autoRules.reduce((sum, r) => sum + r.stats.ticketsSold, 0)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Doanh thu tăng thêm</h3>
              <Percent className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(autoRules.reduce((sum, r) => sum + r.stats.revenue, 0))}
            </p>
          </div>
        </div>

        {/* Auto Rules */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Quy tắc Tự động</h2>
          </div>
          <div className="divide-y">
            {autoRules.map((rule, idx) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{rule.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {rule.status === 'active' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Đang chạy</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> Tạm dừng</>
                        )}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{rule.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">Điều kiện</p>
                        <p className="text-sm font-medium">
                          {rule.trigger.type === 'occupancy' && `Occupancy ${rule.trigger.condition} ${rule.trigger.value}%`}
                          {rule.trigger.type === 'time_range' && `Thời gian ${rule.trigger.value[0]} - ${rule.trigger.value[1]}`}
                          {rule.trigger.type === 'day_of_week' && `Cuối tuần`}
                          {rule.trigger.type === 'booking_advance' && `Đặt trước ${rule.trigger.value} ngày`}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">Hành động</p>
                        <p className="text-sm font-medium text-cinema-600">
                          {rule.action.type === 'percentage' 
                            ? `Giảm ${rule.action.value}%`
                            : `Giảm ${formatCurrency(rule.action.value)}`
                          }
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs text-gray-500 mb-1">Giới hạn</p>
                        <p className="text-sm font-medium">
                          {rule.action.usageLimit 
                            ? `${rule.action.usageLimit} vé`
                            : `Max ${formatCurrency(rule.action.maxDiscount)}`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Kích hoạt:</span>
                        <span className="font-semibold">{rule.stats.triggered} lần</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Vé bán:</span>
                        <span className="font-semibold">{rule.stats.ticketsSold}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-600">Doanh thu:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(rule.stats.revenue)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <Button
                      variant={rule.status === 'active' ? 'outline' : 'default'}
                      onClick={() => toggleRuleStatus(rule.id, rule.status)}
                      className={rule.status === 'active' ? '' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {rule.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Active Promotions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Khuyến mãi Đang áp dụng</h2>
            <p className="text-sm text-gray-600 mt-1">Các khuyến mãi tự động được tạo bởi AI</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã KM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Áp dụng cho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giảm giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vé bán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activePromotions.map((promo, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-semibold text-cinema-600">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">{promo.appliedTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {promo.discount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{promo.reason}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(promo.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                      {promo.ticketsSold}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
