'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import axios from 'axios';

interface Movie {
  _id: string;
  title: string;
  poster: string;
  genres: string[];
  averageRating: number;
  score: number;
  reason: string;
}

export default function MovieRecommendations({ userId }: { userId?: string }) {
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const endpoint = userId 
        ? `/api/recommendations/personalized` 
        : `/api/recommendations/trending`;
      
      const response = await axios.get(endpoint, {
        headers: userId ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}
      });

      setRecommendations(response.data.recommendations || response.data.movies || []);
      setError('');
    } catch (err) {
      setError('Không thể tải gợi ý phim');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + 3 >= recommendations.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(recommendations.length - 3, 0) : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold">
            {userId ? 'Gợi ý dành cho bạn' : 'Phim đang hot'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-700 h-96 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">
            {userId ? 'Gợi ý dành cho bạn' : 'Phim đang hot'}
          </h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-6"
          style={{ transform: `translateX(-${currentIndex * 33.33}%)` }}
        >
          {recommendations.map((movie) => (
            <Link
              key={movie._id}
              href={`/movies/${movie._id}`}
              className="flex-shrink-0 w-full md:w-1/3 group"
            >
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={movie.poster || '/placeholder-movie.jpg'}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 font-semibold">
                        {movie.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex flex-wrap gap-1">
                      {movie.genres?.slice(0, 2).map((genre) => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-1 bg-white/20 rounded-full text-white"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Reason */}
                  {movie.reason && (
                    <div className="flex items-start gap-2 text-sm text-gray-300">
                      <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                      <p className="line-clamp-2">{movie.reason}</p>
                    </div>
                  )}

                  {/* Score indicator */}
                  {movie.score && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${Math.min(movie.score * 10, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Độ phù hợp: {Math.round(movie.score * 10)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(recommendations.length / 3) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i * 3)}
            className={`w-2 h-2 rounded-full transition ${
              Math.floor(currentIndex / 3) === i ? 'bg-red-500 w-8' : 'bg-gray-600'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
