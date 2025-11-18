'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Armchair } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Seat {
  row: string
  number: number
  type: 'standard' | 'vip' | 'couple'
  status: 'available' | 'selected' | 'booked'
  price: number
}

interface SeatSelectorProps {
  showtime: any
  selectedSeats: Seat[]
  onSeatSelect: (seat: Seat) => void
}

export function SeatSelector({ showtime, selectedSeats, onSeatSelect }: SeatSelectorProps) {
  const [seats, setSeats] = useState<Seat[][]>([])

  useEffect(() => {
    if (showtime?.room?.seats) {
      setSeats(showtime.room.seats)
    } else {
      // Generate default seat layout
      generateDefaultSeats()
    }
  }, [showtime])

  const generateDefaultSeats = () => {
    const rows = 10
    const cols = 12
    const rowLabels = 'ABCDEFGHIJ'
    const layout: Seat[][] = []

    for (let i = 0; i < rows; i++) {
      const row: Seat[] = []
      for (let j = 1; j <= cols; j++) {
        // VIP seats (rows A-C)
        const type = i < 3 ? 'vip' : i >= 8 ? 'couple' : 'standard'
        const price = type === 'vip' ? 150000 : type === 'couple' ? 200000 : 100000
        
        row.push({
          row: rowLabels[i],
          number: j,
          type,
          status: Math.random() > 0.7 ? 'booked' : 'available',
          price
        })
      }
      layout.push(row)
    }
    setSeats(layout)
  }

  const isSeatSelected = (seat: Seat) => {
    return selectedSeats.some(s => s.row === seat.row && s.number === seat.number)
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') return
    onSeatSelect(seat)
  }

  const getSeatColor = (seat: Seat) => {
    if (seat.status === 'booked') return 'bg-gray-600 cursor-not-allowed'
    if (isSeatSelected(seat)) return 'bg-cinema-600 border-cinema-400'
    
    switch (seat.type) {
      case 'vip':
        return 'bg-purple-500/20 border-purple-400 hover:bg-purple-500/40'
      case 'couple':
        return 'bg-pink-500/20 border-pink-400 hover:bg-pink-500/40'
      default:
        return 'bg-gray-700 border-gray-600 hover:bg-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Screen */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-full max-w-3xl h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full mb-2" />
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Monitor className="w-4 h-4" />
          <span>Màn hình</span>
        </div>
      </div>

      {/* Seat Grid */}
      <div className="flex justify-center overflow-x-auto py-4">
        <div className="space-y-2">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="flex items-center gap-2">
              {/* Row Label */}
              <div className="w-6 text-center text-gray-400 font-semibold">
                {row[0]?.row}
              </div>

              {/* Seats */}
              <div className="flex gap-2">
                {row.map((seat, seatIndex) => (
                  <motion.button
                    key={`${seat.row}-${seat.number}`}
                    whileHover={{ scale: seat.status !== 'booked' ? 1.1 : 1 }}
                    whileTap={{ scale: seat.status !== 'booked' ? 0.95 : 1 }}
                    onClick={() => handleSeatClick(seat)}
                    disabled={seat.status === 'booked'}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all relative',
                      getSeatColor(seat)
                    )}
                    title={`${seat.row}${seat.number} - ${seat.type} - ${seat.price.toLocaleString()}đ`}
                  >
                    <Armchair className="w-5 h-5" />
                    {seat.type === 'couple' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border border-gray-900" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Row Label (Right) */}
              <div className="w-6 text-center text-gray-400 font-semibold">
                {row[0]?.row}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 pt-6 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-700 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
          <span className="text-sm text-gray-300">Ghế thường</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500/20 border-2 border-purple-400 rounded-lg flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
          <span className="text-sm text-gray-300">Ghế VIP</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-500/20 border-2 border-pink-400 rounded-lg flex items-center justify-center relative">
            <Armchair className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full" />
          </div>
          <span className="text-sm text-gray-300">Ghế đôi</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cinema-600 border-2 border-cinema-400 rounded-lg flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
          <span className="text-sm text-gray-300">Đã chọn</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-600 border-2 border-gray-600 rounded-lg flex items-center justify-center">
            <Armchair className="w-5 h-5" />
          </div>
          <span className="text-sm text-gray-300">Đã đặt</span>
        </div>
      </div>
    </div>
  )
}
