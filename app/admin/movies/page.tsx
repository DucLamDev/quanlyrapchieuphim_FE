'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search, Edit, Trash2, Eye, Film } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function AdminMoviesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchMovies()
  }, [isAuthenticated, user, filter])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      let response
      if (filter === 'now-showing') {
        response = await api.getNowShowing()
      } else if (filter === 'coming-soon') {
        response = await api.getComingSoon()
      } else {
        response = await api.getMovies()
      }
      setMovies(response.movies || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phim',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phim này?')) return

    try {
      await api.deleteMovie(id)
      toast({
        title: 'Thành công',
        description: 'Đã xóa phim'
      })
      fetchMovies()
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa phim',
        variant: 'destructive'
      })
    }
  }

  const filteredMovies = movies.filter(movie =>
    movie.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quản lý phim</h1>
            <p className="text-gray-400">Thêm, sửa, xóa phim trong hệ thống</p>
          </div>
          <Button
            onClick={() => router.push('/admin/movies/create')}
            className="bg-cinema-600 hover:bg-cinema-700 gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm phim mới
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm phim..."
                className="w-full px-4 py-3 pl-12 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-2">
            {['all', 'now-showing', 'coming-soon'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-cinema-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f === 'all' ? 'Tất cả' : f === 'now-showing' ? 'Đang chiếu' : 'Sắp chiếu'}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Table */}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold">Thể loại</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Ngày phát hành</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Đánh giá</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredMovies.map((movie, index) => (
                    <motion.tr
                      key={movie._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-12 h-16 bg-gray-800 rounded overflow-hidden">
                            {movie.poster && (
                              <Image
                                src={movie.poster}
                                alt={movie.title}
                                width={48}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{movie.title}</p>
                            <p className="text-sm text-gray-400">{movie.duration} phút</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {movie.genres?.slice(0, 2).map((genre: string) => (
                            <span
                              key={genre}
                              className="px-2 py-1 bg-gray-800 rounded text-xs"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {formatDate(movie.releaseDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          movie.status === 'now-showing'
                            ? 'bg-green-500/20 text-green-400'
                            : movie.status === 'coming-soon'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {movie.status === 'now-showing' ? 'Đang chiếu' : 
                           movie.status === 'coming-soon' ? 'Sắp chiếu' : 'Ngừng chiếu'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {movie.rating?.average ? `${movie.rating.average.toFixed(1)}/10` : 'Chưa có'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/movies/${movie._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/admin/movies/edit/${movie._id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(movie._id)}
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

            {filteredMovies.length === 0 && (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400">Không tìm thấy phim nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
