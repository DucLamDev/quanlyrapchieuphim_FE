'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MovieCard } from '@/components/movie/movie-card'
import { Button } from '@/components/ui/button'

export default function MoviesPage() {
  const searchParams = useSearchParams()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const status = searchParams.get('status') || 'now-showing'

  const genres = ['Hành động', 'Hài', 'Kinh dị', 'Tình cảm', 'Khoa học viễn tưởng', 'Hoạt hình']

  useEffect(() => {
    fetchMovies()
  }, [status, selectedGenre])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      let response
      
      if (status === 'now-showing') {
        response = await api.getNowShowing()
      } else if (status === 'coming-soon') {
        response = await api.getComingSoon()
      } else {
        response = await api.getMovies({ status })
      }

      let filteredMovies = response.movies || []
      
      if (selectedGenre !== 'all') {
        filteredMovies = filteredMovies.filter((movie: any) => 
          movie.genres?.includes(selectedGenre)
        )
      }

      setMovies(filteredMovies)
    } catch (error) {
      console.error('Error fetching movies:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMovies()
      return
    }

    try {
      setLoading(true)
      const response = await api.searchMovies(searchQuery)
      setMovies(response.movies || [])
    } catch (error) {
      console.error('Error searching movies:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">
            {status === 'now-showing' ? 'Phim Đang Chiếu' : 'Phim Sắp Chiếu'}
          </h1>
          <p className="text-gray-400">
            Khám phá những bộ phim tuyệt vời nhất
          </p>
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm phim..."
                className="w-full px-4 py-3 pl-12 bg-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cinema-500"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <Button onClick={handleSearch} className="bg-cinema-600 hover:bg-cinema-700">
              Tìm kiếm
            </Button>
          </div>

          {/* Genre Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-gray-400" />
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedGenre === 'all'
                  ? 'bg-cinema-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Tất cả
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedGenre === genre
                    ? 'bg-cinema-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-800 rounded-lg animate-pulse shimmer" />
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((movie: any, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard 
                  movie={movie} 
                  isComingSoon={status === 'coming-soon'}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Không tìm thấy phim nào</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
