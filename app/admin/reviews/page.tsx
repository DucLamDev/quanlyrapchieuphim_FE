'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Trash2, Eye, MessageSquare, ThumbsUp, ThumbsDown, Filter } from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'

export default function AdminReviews() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [filteredReviews, setFilteredReviews] = useState<any[]>([])
  const [sentimentFilter, setSentimentFilter] = useState('all')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchReviews()
  }, [isAuthenticated, user])

  useEffect(() => {
    filterReviews()
  }, [reviews, sentimentFilter])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      // Fetch all reviews from all movies
      const movies = await api.getMovies()
      const allReviews: any[] = []
      
      for (const movie of movies.data || []) {
        const movieReviews = await api.getReviews(movie._id)
        if (movieReviews.data) {
          allReviews.push(...movieReviews.data.map((r: any) => ({
            ...r,
            movieTitle: movie.title
          })))
        }
      }
      
      setReviews(allReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReviews = () => {
    let filtered = reviews

    if (sentimentFilter !== 'all') {
      filtered = filtered.filter(r => r.sentiment === sentimentFilter)
    }

    setFilteredReviews(filtered)
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa review này?')) return

    try {
      await api.deleteReview(reviewId)
      await fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const getSentimentBadge = (sentiment: string) => {
    const styles = {
      positive: 'bg-green-500/20 text-green-400 border-green-500',
      neutral: 'bg-gray-500/20 text-gray-400 border-gray-500',
      negative: 'bg-red-500/20 text-red-400 border-red-500'
    }

    const icons = {
      positive: <ThumbsUp className="w-3 h-3" />,
      neutral: <MessageSquare className="w-3 h-3" />,
      negative: <ThumbsDown className="w-3 h-3" />
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${styles[sentiment as keyof typeof styles] || styles.neutral}`}>
        {icons[sentiment as keyof typeof icons]}
        {sentiment === 'positive' ? 'Tích cực' : sentiment === 'negative' ? 'Tiêu cực' : 'Trung lập'}
      </span>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
      />
    ))
  }

  const stats = {
    total: reviews.length,
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
    averageRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
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
            Quản lý Đánh giá
          </h1>
          <p className="text-gray-400 mt-1">Kiểm duyệt và quản lý reviews của khách hàng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Tổng reviews', value: stats.total, icon: MessageSquare, color: 'text-blue-400' },
            { label: 'Tích cực', value: stats.positive, icon: ThumbsUp, color: 'text-green-400' },
            { label: 'Trung lập', value: stats.neutral, icon: MessageSquare, color: 'text-gray-400' },
            { label: 'Tiêu cực', value: stats.negative, icon: ThumbsDown, color: 'text-red-400' },
            { label: 'Trung bình', value: `${stats.averageRating} ⭐`, icon: Star, color: 'text-yellow-400' }
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
        <div className="flex gap-2">
          <span className="text-gray-400 self-center">Lọc theo sentiment:</span>
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'positive', label: 'Tích cực' },
            { value: 'neutral', label: 'Trung lập' },
            { value: 'negative', label: 'Tiêu cực' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setSentimentFilter(filter.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                sentimentFilter === filter.value
                  ? 'bg-cinema-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {filteredReviews.map((review: any) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{review.movieTitle}</h3>
                    {getSentimentBadge(review.sentiment)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{review.userId?.fullName || 'Anonymous'}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => handleDelete(review._id)}
                  variant="outline"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-300 mb-4">{review.comment}</p>

              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>{review.likes || 0} likes</span>
                <span>{review.dislikes || 0} dislikes</span>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500">Không có reviews nào</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
