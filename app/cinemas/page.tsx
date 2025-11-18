'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Navigation, Star } from 'lucide-react'
import { api } from '@/lib/api'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState('all')

  useEffect(() => {
    fetchCinemas()
  }, [])

  const fetchCinemas = async () => {
    try {
      setLoading(true)
      const response = await api.getCinemas()
      setCinemas(response.cinemas || mockCinemas)
    } catch (error) {
      console.error('Error fetching cinemas:', error)
      setCinemas(mockCinemas)
    } finally {
      setLoading(false)
    }
  }

  const mockCinemas = [
    {
      _id: '1',
      name: 'CGV Vincom Center',
      address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
      city: 'TP.HCM',
      phone: '1900 6017',
      screens: 8,
      totalSeats: 1200,
      facilities: ['IMAX', '4DX', 'Gold Class', 'Dolby Atmos'],
      openingHours: '08:00 - 23:00',
      rating: 4.5,
      image: '/cinemas/cgv-vincom.jpg'
    },
    {
      _id: '2',
      name: 'Lotte Cinema Diamond Plaza',
      address: '34 Lê Duẩn, Quận 1, TP.HCM',
      city: 'TP.HCM',
      phone: '1900 5454',
      screens: 12,
      totalSeats: 1800,
      facilities: ['IMAX', 'Premium', 'Dolby Atmos'],
      openingHours: '08:30 - 23:30',
      rating: 4.7,
      image: '/cinemas/lotte-diamond.jpg'
    },
    {
      _id: '3',
      name: 'Galaxy Cinema Nguyễn Du',
      address: '116 Nguyễn Du, Quận 1, TP.HCM',
      city: 'TP.HCM',
      phone: '1900 2224',
      screens: 6,
      totalSeats: 900,
      facilities: ['Premium', 'Dolby Atmos'],
      openingHours: '09:00 - 23:00',
      rating: 4.3,
      image: '/cinemas/galaxy-nguyen-du.jpg'
    },
    {
      _id: '4',
      name: 'BHD Star Bitexco',
      address: '2 Hải Triều, Quận 1, TP.HCM',
      city: 'TP.HCM',
      phone: '1900 2099',
      screens: 10,
      totalSeats: 1500,
      facilities: ['Gold Class', 'Dolby Atmos', '4DX'],
      openingHours: '08:00 - 23:30',
      rating: 4.6,
      image: '/cinemas/bhd-bitexco.jpg'
    }
  ]

  const cities = ['all', ...Array.from(new Set(cinemas.map(c => c.city)))]
  const filteredCinemas = selectedCity === 'all' 
    ? cinemas 
    : cinemas.filter(c => c.city === selectedCity)

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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cinema-600 to-purple-600 rounded-full mb-4">
            <MapPin className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Hệ Thống Rạp</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Trải nghiệm điện ảnh đẳng cấp tại các rạp hiện đại nhất Việt Nam
          </p>
        </motion.div>

        {/* City Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCity === city
                  ? 'bg-cinema-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {city === 'all' ? 'Tất cả' : city}
            </button>
          ))}
        </div>

        {/* Cinemas Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCinemas.map((cinema, index) => (
              <motion.div
                key={cinema._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-cinema-500/50 transition-all group"
              >
                {/* Cinema Image */}
                <div className="relative h-48 bg-gradient-to-br from-cinema-600 to-purple-600 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin className="w-16 h-16 text-white/50" />
                  </div>
                  {(typeof cinema.rating === 'object' ? cinema.rating?.average : cinema.rating) > 0 && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-500/90 rounded-full flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold text-sm">
                        {typeof cinema.rating === 'object' 
                          ? cinema.rating.average.toFixed(1)
                          : cinema.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  {/* Name */}
                  <h3 className="text-xl font-bold mb-2 group-hover:text-cinema-400 transition-colors">
                    {cinema.name}
                  </h3>

                  {/* Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-start gap-2 text-gray-400">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{cinema.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Phone className="w-4 h-4" />
                      <span>{cinema.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{cinema.openingHours}</span>
                    </div>
                  </div>

                  {/* Screens & Seats */}
                  <div className="flex gap-4 mb-4 pb-4 border-b border-gray-800">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cinema-400">
                        {Array.isArray(cinema.screens) ? cinema.screens.length : cinema.screens || 0}
                      </p>
                      <p className="text-xs text-gray-500">Phòng chiếu</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cinema-400">{cinema.totalSeats || 0}</p>
                      <p className="text-xs text-gray-500">Ghế ngồi</p>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Tiện nghi:</p>
                    <div className="flex flex-wrap gap-1">
                      {cinema.facilities?.map((facility: string) => (
                        <span
                          key={facility}
                          className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                        >
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-cinema-600 hover:bg-cinema-700"
                      size="sm"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Chỉ đường
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Lịch chiếu
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredCinemas.length === 0 && !loading && (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Không tìm thấy rạp nào</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
