'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, MapPin, Calendar, Film, ChevronRight, 
  ChevronLeft, CreditCard, Ticket, AlertCircle 
} from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { useBookingStore, useAuthStore } from '@/lib/store'
import { formatTime, formatDate, formatCurrency } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { SeatSelector } from '@/components/booking/seat-selector'
import { ComboSelector } from '@/components/booking/combo-selector'
import { CrowdPrediction } from '@/components/booking/crowd-prediction'
import { useToast } from '@/components/ui/use-toast'

const STEPS = [
  { id: 1, name: 'Chọn ghế', icon: Ticket },
  { id: 2, name: 'Bắp nước', icon: Film },
  { id: 3, name: 'Thanh toán', icon: CreditCard }
]

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated } = useAuthStore()
  
  const {
    selectedSeats,
    selectedCombos,
    setShowtime,
    addSeat,
    removeSeat,
    addCombo,
    removeCombo,
    getTotalAmount,
    clearBooking
  } = useBookingStore()

  const [step, setStep] = useState(1)
  const [showtime, setShowtimeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Yêu cầu đăng nhập',
        description: 'Vui lòng đăng nhập để đặt vé',
        variant: 'destructive'
      })
      router.push('/login')
      return
    }

    fetchShowtimeDetails()
  }, [params.id, isAuthenticated])

  const fetchShowtimeDetails = async () => {
    try {
      setLoading(true)
      const response = await api.getShowtime(params.id as string)
      setShowtimeData(response.showtime)
      setShowtime(response.showtime)
    } catch (error: any) {
      console.error('Error fetching showtime:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin suất chiếu',
        variant: 'destructive'
      })
      router.push('/movies')
    } finally {
      setLoading(false)
    }
  }

  const handleSeatSelect = (seat: any) => {
    const isSelected = selectedSeats.some(
      s => s.row === seat.row && s.number === seat.number
    )
    
    if (isSelected) {
      removeSeat(seat)
    } else {
      if (selectedSeats.length >= 10) {
        toast({
          title: 'Giới hạn ghế',
          description: 'Bạn chỉ có thể chọn tối đa 10 ghế',
          variant: 'destructive'
        })
        return
      }
      addSeat({ ...seat, price: showtime?.price?.standard || 100000 })
    }
  }

  const handleComboChange = (combo: any, quantity: number) => {
    if (quantity === 0) {
      removeCombo(combo._id)
    } else {
      const existingCombo = selectedCombos.find(c => c._id === combo._id)
      if (existingCombo) {
        // Update quantity
        const updatedCombos = selectedCombos.map(c =>
          c._id === combo._id ? { ...c, quantity } : c
        )
        // This is a workaround - ideally we'd have an updateCombo method
        removeCombo(combo._id)
        updatedCombos.forEach(c => addCombo(c))
      } else {
        addCombo({ ...combo, comboId: combo._id, quantity })
      }
    }
  }

  const handleNextStep = () => {
    if (step === 1 && selectedSeats.length === 0) {
      toast({
        title: 'Chưa chọn ghế',
        description: 'Vui lòng chọn ít nhất 1 ghế',
        variant: 'destructive'
      })
      return
    }
    
    if (step < STEPS.length) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleConfirmBooking = async () => {
    try {
      setProcessing(true)
      
      const bookingData = {
        showtimeId: params.id,
        seats: selectedSeats.map(seat => ({
          row: seat.row,
          number: seat.number,
          type: seat.type,
          price: seat.price
        })),
        combos: selectedCombos.map(combo => ({
          comboId: combo.comboId || combo._id,
          quantity: combo.quantity,
          price: combo.price
        })),
        totalAmount: getTotalAmount()
      }

      const response = await api.createBooking(bookingData)
      
      toast({
        title: 'Đặt vé thành công',
        description: 'Chuyển đến trang thanh toán...'
      })

      // Clear booking state and redirect to payment
      clearBooking()
      router.push(`/payment/${response.booking._id}`)
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast({
        title: 'Lỗi đặt vé',
        description: error.response?.data?.message || 'Đã có lỗi xảy ra',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!showtime) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-white text-xl">Không tìm thấy suất chiếu</p>
        </div>
        <Footer />
      </div>
    )
  }

  const movie = showtime.movieId
  const cinema = showtime.cinemaId

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Movie Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-gray-900 rounded-lg p-6 border border-gray-800"
        >
          <div className="flex gap-6">
            <div className="hidden md:block flex-shrink-0">
              <Image
                src={movie?.poster || '/placeholder.jpg'}
                alt={movie?.title || 'Movie'}
                width={120}
                height={180}
                className="rounded-lg"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{movie?.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-cinema-400" />
                  <div>
                    <p className="font-semibold">{cinema?.name}</p>
                    <p className="text-gray-500">{showtime?.room?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-cinema-400" />
                  <div>
                    <p className="font-semibold">{formatDate(showtime?.startTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-cinema-400" />
                  <div>
                    <p className="font-semibold">{formatTime(showtime?.startTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {STEPS.map((s, index) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isCompleted = step > s.id

              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-cinema-500 bg-cinema-500 text-white'
                          : isCompleted
                          ? 'border-cinema-500 bg-cinema-500/20 text-cinema-400'
                          : 'border-gray-700 bg-gray-800 text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        isActive || isCompleted ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      {s.name}
                    </span>
                  </div>
                  
                  {index < STEPS.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-600 mx-4" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="seats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                >
                  <SeatSelector
                    showtime={showtime}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="combos"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                >
                  <ComboSelector
                    selectedCombos={selectedCombos}
                    onComboChange={handleComboChange}
                  />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-gray-900 rounded-lg p-6 border border-gray-800"
                >
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold mb-4">Xác nhận đặt vé</h3>
                    
                    {/* Booking Summary */}
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="font-semibold mb-2">Ghế đã chọn:</h4>
                        <p className="text-gray-300">
                          {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
                        </p>
                      </div>

                      {selectedCombos.length > 0 && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                          <h4 className="font-semibold mb-2">Combo:</h4>
                          {selectedCombos.map(combo => (
                            <div key={combo._id} className="flex justify-between text-gray-300">
                              <span>{combo.name} x{combo.quantity}</span>
                              <span>{formatCurrency(combo.price * combo.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-300">
                        Vui lòng kiểm tra kỹ thông tin trước khi xác nhận. Vé đã đặt không thể hoàn lại sau 24h trước giờ chiếu.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Crowd Prediction */}
            <CrowdPrediction showtimeId={params.id as string} />

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 bg-gray-900 rounded-lg p-6 border border-gray-800"
            >
              <h3 className="text-xl font-bold mb-4">Thông tin đặt vé</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Số ghế:</span>
                  <span className="font-semibold">{selectedSeats.length}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tiền ghế:</span>
                  <span className="font-semibold">
                    {formatCurrency(selectedSeats.reduce((sum, s) => sum + s.price, 0))}
                  </span>
                </div>

                {selectedCombos.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tiền combo:</span>
                    <span className="font-semibold">
                      {formatCurrency(
                        selectedCombos.reduce((sum, c) => sum + c.price * c.quantity, 0)
                      )}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Tổng cộng:</span>
                    <span className="font-bold text-2xl text-cinema-400">
                      {formatCurrency(getTotalAmount())}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {step < STEPS.length && (
                  <Button
                    onClick={handleNextStep}
                    className="w-full bg-cinema-600 hover:bg-cinema-700"
                    size="lg"
                    disabled={step === 1 && selectedSeats.length === 0}
                  >
                    {step === STEPS.length - 1 ? 'Xác nhận' : 'Tiếp tục'}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                )}

                {step === STEPS.length && (
                  <Button
                    onClick={handleConfirmBooking}
                    className="w-full bg-cinema-600 hover:bg-cinema-700"
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? 'Đang xử lý...' : 'Thanh toán'}
                  </Button>
                )}

                {step > 1 && (
                  <Button
                    onClick={handlePrevStep}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Quay lại
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
