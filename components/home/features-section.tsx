'use client'

import { motion } from 'framer-motion'
import { Sparkles, Clock, Heart, Shield, Zap, Users } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI Gợi Ý Thông Minh',
    description: 'Nhận đề xuất phim cá nhân hóa dựa trên sở thích của bạn',
    color: 'text-yellow-500',
  },
  {
    icon: Clock,
    title: 'Dự Đoán Độ Đông',
    description: 'Biết trước suất chiếu nào đông người để lên kế hoạch tốt hơn',
    color: 'text-blue-500',
  },
  {
    icon: Heart,
    title: 'Tích Điểm Thưởng',
    description: 'Mỗi lần đặt vé đều nhận điểm và ưu đãi độc quyền',
    color: 'text-pink-500',
  },
  {
    icon: Shield,
    title: 'Thanh Toán An Toàn',
    description: 'Bảo mật thông tin với công nghệ mã hóa hàng đầu',
    color: 'text-green-500',
  },
  {
    icon: Zap,
    title: 'Đặt Vé Nhanh Chóng',
    description: 'Chỉ 3 bước đơn giản để có ngay vé xem phim yêu thích',
    color: 'text-purple-500',
  },
  {
    icon: Users,
    title: 'Đặt Vé Nhóm',
    description: 'Mời bạn bè dễ dàng và nhận ưu đãi khi đặt vé nhóm',
    color: 'text-orange-500',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Trải Nghiệm Đặt Vé Hiện Đại
          </h2>
          <p className="text-xl text-gray-400">
            Công nghệ AI và tính năng độc đáo cho trải nghiệm tốt nhất
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-cinema-500 transition-colors group"
              >
                <Icon className={`w-12 h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
