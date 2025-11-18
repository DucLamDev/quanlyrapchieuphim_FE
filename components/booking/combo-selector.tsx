'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Popcorn } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Combo {
  _id: string
  name: string
  description: string
  price: number
  image?: string
  items: string[]
  available: boolean
}

interface ComboSelectorProps {
  selectedCombos: any[]
  onComboChange: (combo: Combo, quantity: number) => void
}

export function ComboSelector({ selectedCombos, onComboChange }: ComboSelectorProps) {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from API
      // For now, use mock data
      const mockCombos: Combo[] = [
        {
          _id: '1',
          name: 'Combo Solo',
          description: '1 Bắp rang bơ (L) + 1 Nước ngọt (L)',
          price: 89000,
          image: '/combos/solo.jpg',
          items: ['Bắp rang bơ L', 'Nước ngọt L'],
          available: true
        },
        {
          _id: '2',
          name: 'Combo Couple',
          description: '2 Bắp rang bơ (L) + 2 Nước ngọt (L)',
          price: 159000,
          image: '/combos/couple.jpg',
          items: ['2x Bắp rang bơ L', '2x Nước ngọt L'],
          available: true
        },
        {
          _id: '3',
          name: 'Combo Family',
          description: '3 Bắp rang bơ (L) + 3 Nước ngọt (L) + 1 Snack',
          price: 229000,
          image: '/combos/family.jpg',
          items: ['3x Bắp rang bơ L', '3x Nước ngọt L', 'Snack'],
          available: true
        },
        {
          _id: '4',
          name: 'Combo Premium',
          description: '2 Bắp phô mai (L) + 2 Pepsi (L) + 2 Hotdog',
          price: 199000,
          image: '/combos/premium.jpg',
          items: ['2x Bắp phô mai L', '2x Pepsi L', '2x Hotdog'],
          available: true
        }
      ]
      setCombos(mockCombos)
    } catch (error) {
      console.error('Error fetching combos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getComboQuantity = (comboId: string) => {
    const combo = selectedCombos.find(c => c.comboId === comboId || c._id === comboId)
    return combo?.quantity || 0
  }

  const handleQuantityChange = (combo: Combo, delta: number) => {
    const currentQuantity = getComboQuantity(combo._id)
    const newQuantity = Math.max(0, currentQuantity + delta)
    onComboChange(combo, newQuantity)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <Popcorn className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Bắp Nước & Combo</h3>
          <p className="text-sm text-gray-400">Chọn combo để thưởng thức trong suất chiếu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {combos.map((combo) => {
          const quantity = getComboQuantity(combo._id)
          const isSelected = quantity > 0

          return (
            <motion.div
              key={combo._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative bg-gray-900 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-cinema-500 shadow-lg shadow-cinema-500/20'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="p-4">
                {/* Combo Image - Using placeholder with icon */}
                <div className="relative w-full h-40 mb-4 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-lg flex items-center justify-center border border-orange-500/30">
                  <Popcorn className="w-16 h-16 text-orange-400" />
                </div>

                {/* Combo Info */}
                <h4 className="font-bold text-white mb-2">{combo.name}</h4>
                <p className="text-sm text-gray-400 mb-3">{combo.description}</p>

                {/* Items */}
                <div className="mb-4 space-y-1">
                  {combo.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-1 h-1 bg-cinema-500 rounded-full" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Price & Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div>
                    <span className="text-cinema-400 font-bold text-lg">
                      {formatCurrency(combo.price)}
                    </span>
                  </div>

                  {quantity === 0 ? (
                    <Button
                      size="sm"
                      onClick={() => handleQuantityChange(combo, 1)}
                      className="bg-cinema-600 hover:bg-cinema-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(combo, -1)}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-white">{quantity}</span>
                      <Button
                        size="sm"
                        onClick={() => handleQuantityChange(combo, 1)}
                        className="w-8 h-8 p-0 bg-cinema-600 hover:bg-cinema-700"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 bg-cinema-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  x{quantity}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Total */}
      {selectedCombos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
        >
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Tổng combo:</span>
            <span className="text-xl font-bold text-cinema-400">
              {formatCurrency(
                selectedCombos.reduce((sum, combo) => sum + combo.price * combo.quantity, 0)
              )}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
