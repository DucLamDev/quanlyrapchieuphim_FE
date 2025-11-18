'use client'

import { motion } from 'framer-motion'
import { Star, Clock, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, getMovieDuration, getAgeRatingColor } from '@/lib/utils'

interface MovieCardProps {
  movie: any
  showTrending?: boolean
  isComingSoon?: boolean
}

export function MovieCard({ movie, showTrending, isComingSoon }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie._id}`}>
      <motion.div
        className="movie-card group cursor-pointer"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
          {/* Movie Poster */}
          <Image
            src={movie.poster || '/placeholder-movie.jpg'}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Age Rating Badge */}
          {movie.ageRating && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold text-white ${getAgeRatingColor(movie.ageRating)}`}>
              {movie.ageRating}
            </div>
          )}

          {/* Trending Badge */}
          {showTrending && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-bold">HOT</span>
            </div>
          )}

          {/* Coming Soon Badge */}
          {isComingSoon && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full">
              <span className="text-xs font-bold">Sắp chiếu</span>
            </div>
          )}

          {/* Movie Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-2 text-sm text-gray-200 mb-2">
              {movie.rating?.average > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{movie.rating.average.toFixed(1)}</span>
                </div>
              )}
              {movie.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getMovieDuration(movie.duration)}</span>
                </div>
              )}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {movie.genres.slice(0, 3).map((genre: string) => (
                  <span
                    key={genre}
                    className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs text-white"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {isComingSoon && movie.releaseDate && (
              <div className="flex items-center gap-1 text-sm text-purple-300">
                <Calendar className="w-4 h-4" />
                <span>Khởi chiếu: {formatDate(movie.releaseDate)}</span>
              </div>
            )}

            <motion.button
              className="mt-2 w-full py-2 bg-cinema-600 hover:bg-cinema-700 text-white rounded font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isComingSoon ? 'Xem Chi Tiết' : 'Đặt Vé Ngay'}
            </motion.button>
          </div>
        </div>

        {/* Movie Title */}
        <div className="mt-3">
          <h3 className="font-bold text-lg text-white group-hover:text-cinema-500 transition-colors line-clamp-2">
            {movie.title}
          </h3>
          {movie.originalTitle && movie.originalTitle !== movie.title && (
            <p className="text-sm text-gray-400 line-clamp-1 mt-1">
              {movie.originalTitle}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
