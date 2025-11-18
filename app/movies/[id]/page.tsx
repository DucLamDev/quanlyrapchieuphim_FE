'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Star, Clock, Calendar, Play, Heart } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { formatDate, getMovieDuration, getAgeRatingColor } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export default function MovieDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  const [movie, setMovie] = useState<any>(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchMovieDetails()
    }
  }, [params.id])

  const fetchMovieDetails = async () => {
    try {
      setLoading(true)
      const [movieResponse, showtimesResponse] = await Promise.all([
        api.getMovie(params.id as string),
        api.getShowtimesByMovie(params.id as string, { 
          date: new Date().toISOString().split('T')[0] 
        })
      ])

      setMovie(movieResponse.movie)
      setShowtimes(showtimesResponse.showtimes || [])
    } catch (error: any) {
      console.error('Error fetching movie details:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin phim',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = (showtimeId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để đặt vé',
      })
      router.push('/login')
      return
    }
    router.push(`/booking/${showtimeId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-white text-xl">Không tìm thấy phim</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Trailer Modal */}
      {showTrailer && movie.trailer && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-full max-w-6xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-10 right-0 text-white hover:text-cinema-400 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              className="w-full h-full rounded-lg"
              src={movie.trailer.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + '?autoplay=1'}
              title={movie.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-8"
            >
              <div className="hidden md:block flex-shrink-0">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  width={250}
                  height={375}
                  className="rounded-lg shadow-2xl"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-2">{movie.title}</h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="text-xl text-gray-400 mb-4">{movie.originalTitle}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {(typeof movie.rating?.average === 'number' && movie.rating.average > 0) && (
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{movie.rating.average.toFixed(1)}</span>
                      <span className="text-gray-400">({typeof movie.rating.count === 'number' ? movie.rating.count : 0} đánh giá)</span>
                    </div>
                  )}
                  {movie.duration && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-5 h-5" />
                      <span>{getMovieDuration(movie.duration)}</span>
                    </div>
                  )}
                  {movie.ageRating && (
                    <span className={`px-3 py-1 rounded text-sm font-bold ${getAgeRatingColor(movie.ageRating)}`}>
                      {movie.ageRating}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres?.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {movie.releaseDate && (
                  <div className="flex items-center gap-2 text-gray-300 mb-4">
                    <Calendar className="w-5 h-5" />
                    <span>Khởi chiếu: {formatDate(movie.releaseDate)}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  {movie.trailer && (
                    <Button 
                      size="lg" 
                      className="bg-cinema-600 hover:bg-cinema-700 gap-2"
                      onClick={() => setShowTrailer(true)}
                    >
                      <Play className="w-5 h-5" />
                      Xem Trailer
                    </Button>
                  )}
                  <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white/10">
                    <Heart className="w-5 h-5" />
                    Yêu thích
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Nội dung phim</h2>
              <p className="text-gray-300 leading-relaxed">{movie.description}</p>
            </section>

            {/* Cast & Crew */}
            {(movie.cast?.length > 0 || movie.director) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Diễn viên & Đoàn phim</h2>
                <div className="space-y-2">
                  {movie.director && (
                    <p><span className="text-gray-400">Đạo diễn:</span> {movie.director}</p>
                  )}
                  {movie.cast?.length > 0 && (
                    <p><span className="text-gray-400">Diễn viên:</span> {movie.cast.join(', ')}</p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - Showtimes */}
          <div>
            <div className="sticky top-24 bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Lịch chiếu hôm nay</h2>
              
              {showtimes.length > 0 ? (
                <div className="space-y-3">
                  {showtimes.slice(0, 5).map((showtime: any) => (
                    <button
                      key={showtime._id}
                      onClick={() => handleBooking(showtime._id)}
                      className="w-full p-3 bg-gray-800 hover:bg-cinema-600 rounded-lg transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">
                            {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          <p className="text-sm text-gray-400">{showtime.cinemaId?.name}</p>
                        </div>
                        <p className="text-cinema-400 font-bold">
                          {showtime.price?.standard?.toLocaleString()}đ
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  Chưa có suất chiếu
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
