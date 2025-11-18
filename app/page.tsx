'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Film, Sparkles, TrendingUp, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MovieCard } from '@/components/movie/movie-card'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      const [nowShowingRes, comingSoonRes, trendingRes] = await Promise.all([
        api.getNowShowing(),
        api.getComingSoon(),
        api.getTrendingMovies(7)
      ])

      setNowShowing((nowShowingRes.movies || []).slice(0, 6))
      setComingSoon((comingSoonRes.movies || []).slice(0, 6))
      setTrending((trendingRes.movies || []).slice(0, 6))
    } catch (error) {
      console.error('Error fetching movies:', error)
      // Show empty state instead of mock data
      setNowShowing([])
      setComingSoon([])
      setTrending([])
    } finally {
      setLoading(false)
    }
  }

  const generateMockMovies = () => [
    {
      _id: '1',
      title: 'Spider-Man: No Way Home',
      description: 'Cuộc phiêu lưu thú vị của Spider-Man xuyên đa vũ trụ',
      poster: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg',
      genres: ['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng'],
      duration: 148,
      releaseDate: new Date().toISOString(),
      status: 'now-showing',
      rating: { average: 8.5, count: 15000 },
      ageRating: 'T13'
    },
    {
      _id: '2',
      title: 'Avatar: The Way of Water',
      description: 'Tiếp tục câu chuyện về hành tinh Pandora',
      poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
      genres: ['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng'],
      duration: 192,
      releaseDate: new Date().toISOString(),
      status: 'now-showing',
      rating: { average: 9.0, count: 20000 },
      ageRating: 'T13'
    },
    {
      _id: '3',
      title: 'Top Gun: Maverick',
      description: 'Tom Cruise trở lại với vai diễn huyền thoại',
      poster: 'https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg',
      genres: ['Hành động', 'Chính kịch'],
      duration: 130,
      releaseDate: new Date().toISOString(),
      status: 'now-showing',
      rating: { average: 8.8, count: 18000 },
      ageRating: 'T13'
    },
    {
      _id: '4',
      title: 'The Batman',
      description: 'Phiên bản Batman tối tăm và bí ẩn',
      poster: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg',
      genres: ['Hành động', 'Tâm lý', 'Bí ẩn'],
      duration: 176,
      releaseDate: new Date().toISOString(),
      status: 'now-showing',
      rating: { average: 8.3, count: 12000 },
      ageRating: 'T16'
    },
    {
      _id: '5',
      title: 'Doctor Strange 2',
      description: 'Đa vũ trụ của sự điên rồ',
      poster: 'https://image.tmdb.org/t/p/w500/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/wcKFYIiVDvRURrzglV9kGu7fpfY.jpg',
      genres: ['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng'],
      duration: 126,
      releaseDate: new Date().toISOString(),
      status: 'now-showing',
      rating: { average: 7.9, count: 10000 },
      ageRating: 'T13'
    },
    {
      _id: '6',
      title: 'Jurassic World Dominion',
      description: 'Kỷ nguyên của khủng long',
      poster: 'https://image.tmdb.org/t/p/w500/kAVRgw7GgK1CfYEJq8ME6EvRIgU.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/5hoS3nEkGGXUfmnu39yw1k52JX5.jpg',
      genres: ['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng'],
      duration: 147,
      releaseDate: new Date().toISOString(),
      status: 'now-showing',
      rating: { average: 7.5, count: 9000 },
      ageRating: 'T13'
    },
    {
      _id: '7',
      title: 'Black Panther: Wakanda Forever',
      description: 'Vinh danh huyền thoại',
      poster: 'https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/yYrvN5WFeGYjJnRzhY0QXuo4Isw.jpg',
      genres: ['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng'],
      duration: 161,
      releaseDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'coming-soon',
      rating: { average: 8.0, count: 5000 },
      ageRating: 'T13'
    },
    {
      _id: '8',
      title: 'Avengers: Secret Wars',
      description: 'Cuộc chiến cuối cùng',
      poster: 'https://m.media-amazon.com/images/M/MV5BYTQyZTQ5MWQtN2M4NC00YWQwLTg3ZTctM2JiZDE4NDBkZDJkXkEyXkFqcGc@._V1_.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg',
      genres: ['Hành động', 'Phiêu lưu', 'Khoa học viễn tưởng'],
      duration: 180,
      releaseDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: 'coming-soon',
      rating: { average: 9.5, count: 50000 },
      ageRating: 'T13'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      {/* Hero Section */}
      <HeroSection movies={nowShowing.slice(0, 3)} />

      {/* Features */}
      <FeaturesSection />

      {/* Now Showing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Film className="w-10 h-10 text-cinema-500" />
                Phim Đang Chiếu
              </h2>
              <p className="text-gray-400">Những bộ phim hot nhất hiện nay</p>
            </div>
            <Link href="/movies?status=now-showing">
              <Button variant="outline" className="text-white border-cinema-500 hover:bg-cinema-500">
                Xem tất cả
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-800 rounded-lg animate-pulse shimmer" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nowShowing.map((movie: any, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trending Movies */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-yellow-500" />
                Phim Thịnh Hành
              </h2>
              <p className="text-gray-400">Được yêu thích nhất tuần qua</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((movie: any, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <MovieCard movie={movie} showTrending />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-purple-500" />
                Sắp Chiếu
              </h2>
              <p className="text-gray-400">Đánh dấu lịch để không bỏ lỡ</p>
            </div>
            <Link href="/movies?status=coming-soon">
              <Button variant="outline" className="text-white border-purple-500 hover:bg-purple-500">
                Xem tất cả
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoon.map((movie: any, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <MovieCard movie={movie} isComingSoon />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-cinema">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Users className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Trải Nghiệm Điện Ảnh Đỉnh Cao
            </h2>
            <p className="text-xl mb-8 text-gray-200">
              Đặt vé online nhanh chóng, nhận ưu đãi độc quyền và tích điểm thành viên
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-cinema-600 hover:bg-gray-100">
                  Đăng ký ngay
                </Button>
              </Link>
              <Link href="/movies">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Xem phim
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
