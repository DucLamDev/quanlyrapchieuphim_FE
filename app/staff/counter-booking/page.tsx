'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Plus, User, Film, Calendar, Clock, MapPin, Printer, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'
import { TicketPDF } from '@/components/staff/TicketPDF'

export default function CounterBookingPageV2() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()

  const [step, setStep] = useState(1)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customer, setCustomer] = useState<any>(null)
  const [isWalkInCustomer, setIsWalkInCustomer] = useState(false)
  const [movies, setMovies] = useState([])
  const [selectedMovie, setSelectedMovie] = useState<any>(null)
  const [showtimes, setShowtimes] = useState([])
  const [selectedShowtime, setSelectedShowtime] = useState<any>(null)
  const [selectedSeats, setSelectedSeats] = useState<any[]>([])
  const [availableSeats, setAvailableSeats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [completedBooking, setCompletedBooking] = useState<any>(null)
  const [ticketData, setTicketData] = useState<any>(null)
  const [showPrintModal, setShowPrintModal] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'staff') {
      router.push('/')
      return
    }
    fetchMovies()
  }, [isAuthenticated, user])

  const fetchMovies = async () => {
    try {
      const response = await api.getMovies({ status: 'now-showing' })
      setMovies(response.movies || [])
    } catch (error) {
      console.error('Error fetching movies:', error)
    }
  }

  const handlePhoneInput = async () => {
    if (!customerPhone || customerPhone.length < 10) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập số điện thoại hợp lệ',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await api.searchUser({ phone: customerPhone })
      if (response.user) {
        setCustomer(response.user)
        setIsWalkInCustomer(false)
        setStep(2)
        toast({
          title: 'Thành công',
          description: `Tìm thấy khách hàng: ${response.user.fullName}`
        })
      } else {
        // Khách vãng lai
        setIsWalkInCustomer(true)
        setStep(2)
        toast({
          title: 'Khách vãng lai',
          description: 'Khách hàng chưa có tài khoản. Tiếp tục đặt vé.'
        })
      }
    } catch (error: any) {
      // Nếu không tìm thấy, cũng cho phép tiếp tục như khách vãng lai
      setIsWalkInCustomer(true)
      setStep(2)
      toast({
        title: 'Khách vãng lai',
        description: 'Tiếp tục đặt vé cho khách vãng lai'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectMovie = async (movie: any) => {
    setSelectedMovie(movie)
    setLoading(true)
    try {
      const response = await api.getShowtimes({ movieId: movie._id })
      setShowtimes(response.showtimes || [])
      setStep(3)
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải suất chiếu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const selectShowtime = async (showtime: any) => {
    setSelectedShowtime(showtime)
    // Load seats
    const seats = generateSeats(showtime.bookedSeats || [])
    setAvailableSeats(seats)
    setStep(4)
  }

  const toggleSeat = (seat: any) => {
    if (seat.status === 'booked') return
    
    const isSelected = selectedSeats.find(s => s.row === seat.row && s.number === seat.number)
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => !(s.row === seat.row && s.number === seat.number)))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0)
  }

  const completeBooking = async () => {
    if (selectedSeats.length === 0) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn ít nhất một ghế',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const bookingData = {
        showtimeId: selectedShowtime._id,
        seats: selectedSeats.map(s => ({
          row: s.row,
          number: s.number,
          type: s.type
        })),
        combos: [],
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        bookingType: 'counter',
        customerPhone,
        customerName: isWalkInCustomer ? customerName || 'Khách vãng lai' : undefined
      }

      const response = await api.createBooking(bookingData)
      
      setCompletedBooking(response.booking)
      
      // Load ticket data for printing
      const ticketRes = await api.getPrintableTicket(response.booking._id)
      setTicketData(ticketRes.data)
      setShowPrintModal(true)
      
      toast({
        title: 'Thành công',
        description: 'Đặt vé thành công!'
      })
      
      setStep(5)
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể tạo booking',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetBooking = () => {
    setStep(1)
    setCustomerPhone('')
    setCustomerName('')
    setCustomer(null)
    setIsWalkInCustomer(false)
    setSelectedMovie(null)
    setSelectedShowtime(null)
    setSelectedSeats([])
    setCompletedBooking(null)
    setTicketData(null)
    setShowPrintModal(false)
  }

  const generateSeats = (bookedSeats: any[]) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
    const seats = []
    const bookedSeatIds = bookedSeats.map(s => `${s.row}${s.number}`)
    
    for (const row of rows) {
      for (let num = 1; num <= 10; num++) {
        const seatId = `${row}${num}`
        const isBooked = bookedSeatIds.includes(seatId)
        const isVIP = num <= 2 || num >= 9
        
        seats.push({
          row,
          number: num,
          type: isVIP ? 'vip' : 'standard',
          price: isVIP ? 120000 : 80000,
          status: isBooked ? 'booked' : 'available'
        })
      }
    }
    return seats
  }

  const getSeatColor = (seat: any) => {
    const isSelected = selectedSeats.find(s => s.row === seat.row && s.number === seat.number)
    if (seat.status === 'booked') return 'bg-gray-700 cursor-not-allowed'
    if (isSelected) return 'bg-cinema-600 text-white'
    if (seat.type === 'vip') return 'bg-yellow-500/20 hover:bg-yellow-500 hover:text-white'
    return 'bg-green-500/20 hover:bg-green-500 hover:text-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cinema-600 to-purple-600 bg-clip-text text-transparent">
            Đặt vé tại quầy
          </h1>
          <p className="text-gray-400 mt-2">Hỗ trợ khách hàng đặt vé trực tiếp</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Nhập SĐT' },
              { num: 2, label: 'Chọn phim' },
              { num: 3, label: 'Chọn suất' },
              { num: 4, label: 'Chọn ghế' },
              { num: 5, label: 'Hoàn tất' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s.num 
                    ? 'bg-cinema-600 border-cinema-600 text-white' 
                    : 'border-gray-700 text-gray-500 bg-gray-800'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <div className={`ml-2 text-sm font-medium ${
                  step >= s.num ? 'text-cinema-400' : 'text-gray-600'
                }`}>
                  {s.label}
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > s.num ? 'bg-cinema-600' : 'bg-gray-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800 p-6">
          {/* Step 1: Customer Phone */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <User className="w-6 h-6 text-cinema-400" />
                Nhập số điện thoại khách hàng
              </h2>
              <p className="text-gray-400 text-sm">Nhập SĐT để tìm kiếm khách hàng hoặc đặt vé cho khách vãng lai</p>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số điện thoại *
                  </label>
                  <Input
                    placeholder="0xxx xxx xxx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePhoneInput()}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
                
                <Button 
                  onClick={handlePhoneInput} 
                  disabled={loading}
                  className="w-full bg-cinema-600 hover:bg-cinema-700"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tiếp tục
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Movie */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Film className="w-6 h-6 text-cinema-400" />
                  Chọn phim
                </h2>
                <div className="text-sm text-gray-400">
                  {isWalkInCustomer ? (
                    <span>Khách vãng lai: {customerPhone}</span>
                  ) : (
                    <span>KH: <span className="font-semibold text-white">{customer?.fullName}</span> - {customer?.phone}</span>
                  )}
                </div>
              </div>
              
              {isWalkInCustomer && (
                <div className="mb-4 max-w-md">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên khách hàng (tùy chọn)
                  </label>
                  <Input
                    placeholder="Nhập tên khách hàng"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((movie: any) => (
                  <motion.div
                    key={movie._id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-800 rounded-lg overflow-hidden cursor-pointer hover:border-cinema-600 hover:shadow-lg transition-all bg-gray-800/50"
                    onClick={() => selectMovie(movie)}
                  >
                    <img src={movie.poster} alt={movie.title} className="w-full h-48 object-cover" />
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm">{movie.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">{movie.duration} phút</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <Button onClick={() => setStep(1)} variant="outline" className="border-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          )}

          {/* Step 3: Select Showtime */}
          {step === 3 && selectedMovie && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Calendar className="w-6 h-6 text-cinema-400" />
                Chọn suất chiếu - {selectedMovie.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showtimes.map((showtime: any) => (
                  <motion.div
                    key={showtime._id}
                    whileHover={{ scale: 1.02 }}
                    className="border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-cinema-600 bg-gray-800/50"
                    onClick={() => selectShowtime(showtime)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-cinema-400" />
                        <span className="font-bold text-lg text-white">
                          {new Date(showtime.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {showtime.availableSeats} ghế trống
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>Phòng: {showtime.room?.name || 'N/A'}</div>
                      <div>{new Date(showtime.startTime).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <Button onClick={() => setStep(2)} variant="outline" className="border-gray-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          )}

          {/* Step 4: Select Seats */}
          {step === 4 && selectedShowtime && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Chọn ghế ngồi</h2>
              
              {/* Screen */}
              <div className="text-center mb-8">
                <div className="inline-block px-16 py-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-full">
                  <span className="text-sm text-gray-400">MÀN HÌNH</span>
                </div>
              </div>
              
              {/* Seats Grid */}
              <div className="flex justify-center">
                <div className="inline-block">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(row => (
                    <div key={row} className="flex items-center gap-2 mb-2">
                      <span className="w-6 text-center font-bold text-gray-400">{row}</span>
                      {availableSeats
                        .filter(s => s.row === row)
                        .map(seat => (
                          <button
                            key={`${seat.row}${seat.number}`}
                            onClick={() => toggleSeat(seat)}
                            disabled={seat.status === 'booked'}
                            className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${getSeatColor(seat)}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-green-500/20 border border-green-500"></div>
                  <span className="text-sm text-gray-400">Thường</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-yellow-500/20 border border-yellow-500"></div>
                  <span className="text-sm text-gray-400">VIP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-cinema-600"></div>
                  <span className="text-sm text-gray-400">Đã chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-gray-700"></div>
                  <span className="text-sm text-gray-400">Đã đặt</span>
                </div>
              </div>
              
              {/* Summary */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Ghế đã chọn:</span>
                    <span className="font-bold text-white">
                      {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tổng tiền:</span>
                    <span className="font-bold text-2xl text-cinema-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button onClick={() => setStep(3)} variant="outline" className="border-gray-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Button>
                <Button 
                  onClick={completeBooking} 
                  disabled={loading || selectedSeats.length === 0}
                  className="flex-1 bg-cinema-600 hover:bg-cinema-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Xác nhận thanh toán
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && completedBooking && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Đặt vé thành công!</h2>
                <p className="text-gray-400">Mã booking: <span className="font-mono text-cinema-400">{completedBooking.bookingCode}</span></p>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 max-w-md mx-auto">
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phim:</span>
                    <span className="font-semibold text-white">{selectedMovie.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Suất chiếu:</span>
                    <span className="font-semibold text-white">
                      {new Date(selectedShowtime.startTime).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ghế:</span>
                    <span className="font-semibold text-white">
                      {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                    <span className="text-gray-400">Tổng tiền:</span>
                    <span className="font-bold text-xl text-cinema-400">
                      {formatCurrency(calculateTotal())}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => setShowPrintModal(true)}
                  className="bg-cinema-600 hover:bg-cinema-700"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  In vé
                </Button>
                <Button onClick={resetBooking} variant="outline" className="border-gray-700">
                  Đặt vé mới
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && ticketData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">In vé</h2>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <TicketPDF ticketData={ticketData} />

            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => setShowPrintModal(false)}
                variant="outline"
                className="flex-1 border-gray-700"
              >
                Đóng
              </Button>
              <Button
                onClick={resetBooking}
                className="flex-1 bg-cinema-600 hover:bg-cinema-700"
              >
                Đặt vé mới
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
