'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tag, Calendar, Percent, Gift, Copy, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function PromotionsPage() {
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await api.getPromotions({ status: 'active' })
      setPromotions(response.promotions || mockPromotions)
    } catch (error) {
      console.error('Error fetching promotions:', error)
      setPromotions(mockPromotions)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast({
      title: 'Đã sao chép mã',
      description: `Mã ${code} đã được sao chép`
    })
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const mockPromotions = [
    {
      _id: '1',
      code: 'WELCOME50',
      name: 'Giảm 50K cho thành viên mới',
      description: 'Giảm ngay 50.000đ cho đơn hàng đầu tiên khi đăng ký thành viên mới',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderValue: 200000,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 86400000),
      usageLimit: 1000,
      usageCount: 345,
      image: '/promotions/welcome.jpg'
    },
    {
      _id: '2',
      code: 'WEEKEND20',
      name: 'Giảm 20% cuối tuần',
      description: 'Giảm 20% cho tất cả suất chiếu từ thứ 6 đến chủ nhật',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 60 * 86400000),
      usageLimit: null,
      usageCount: 1250,
      image: '/promotions/weekend.jpg'
    },
    {
      _id: '3',
      code: 'COMBO99',
      name: 'Combo bắp nước chỉ 99K',
      description: 'Combo 2 bắp + 2 nước chỉ còn 99.000đ khi mua kèm vé',
      discountType: 'combo',
      discountValue: 60000,
      minOrderValue: 0,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 15 * 86400000),
      usageLimit: 500,
      usageCount: 178,
      image: '/promotions/combo.jpg'
    },
    {
      _id: '4',
      code: 'GROUPBUY',
      name: 'Đặt nhóm giảm 30%',
      description: 'Giảm 30% khi đặt vé nhóm từ 5 người trở lên',
      discountType: 'percentage',
      discountValue: 30,
      minOrderValue: 500000,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 45 * 86400000),
      usageLimit: null,
      usageCount: 89,
      image: '/promotions/group.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full mb-4">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Ưu đãi & Khuyến mãi</h1>
          <p className="text-gray-400 text-lg">
            Tiết kiệm hơn với các mã giảm giá và chương trình khuyến mãi đặc biệt
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promo, index) => {
              const isCopied = copiedCode === promo.code
              // Safely access nested values
              const usageCount = typeof promo.usageCount === 'object' ? (promo.usageCount?.total || 0) : (promo.usageCount || 0)
              const usageLimit = typeof promo.usageLimit === 'object' ? (promo.usageLimit?.total || null) : (promo.usageLimit || null)
              const usagePercent = usageLimit 
                ? (usageCount / usageLimit) * 100 
                : null

              return (
                <motion.div
                  key={promo._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-cinema-500/50 transition-all"
                >
                  {/* Promotion Image/Gradient */}
                  <div className="relative h-32 bg-gradient-to-br from-cinema-600 via-purple-600 to-pink-600 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 text-center">
                      {promo.discountType === 'percentage' ? (
                        <div className="text-5xl font-bold mb-1">
                          {promo.discountValue}%
                        </div>
                      ) : promo.discountType === 'fixed' ? (
                        <div className="text-4xl font-bold mb-1">
                          {(promo.discountValue / 1000).toFixed(0)}K
                        </div>
                      ) : (
                        <Gift className="w-12 h-12 mb-2" />
                      )}
                      <p className="text-sm opacity-90">GIẢM GIÁ</p>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold mb-2">{promo.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{promo.description}</p>

                    {/* Details */}
                    <div className="space-y-2 mb-4 text-sm">
                      {promo.minOrderValue > 0 && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Tag className="w-4 h-4" />
                          <span>Đơn tối thiểu: {promo.minOrderValue.toLocaleString()}đ</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          HSD: {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
                        </span>
                      </div>

                      {usagePercent !== null && (
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Đã sử dụng: {usageCount}/{usageLimit}</span>
                            <span>{usagePercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cinema-600 to-purple-600 rounded-full"
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Code */}
                    <div className="flex gap-2">
                      <div className="flex-1 px-4 py-3 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                        <p className="text-xs text-gray-400 mb-1">Mã khuyến mãi</p>
                        <p className="font-mono font-bold text-cinema-400 text-lg">
                          {promo.code}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleCopyCode(promo.code)}
                        className={`px-4 transition-all ${
                          isCopied 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-cinema-600 hover:bg-cinema-700'
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />
                            Đã copy
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-cinema-600 to-purple-600 rounded-lg p-8 text-center"
        >
          <Percent className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Đăng ký nhận ưu đãi độc quyền
          </h2>
          <p className="text-gray-100 mb-6">
            Nhận ngay mã giảm giá 50K và cập nhật các chương trình khuyến mãi mới nhất
          </p>
          <Button className="bg-white text-cinema-600 hover:bg-gray-100 px-8 py-3 text-lg">
            Đăng ký ngay
          </Button>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
