'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  CreditCard, Smartphone, Wallet, QrCode, 
  CheckCircle, XCircle, Clock, Download, Share2 
} from 'lucide-react'
import Image from 'next/image'
import QRCode from 'react-qr-code'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

const PAYMENT_METHODS = [
  { 
    id: 'card', 
    name: 'Thẻ tín dụng/ghi nợ', 
    icon: CreditCard,
    description: 'Visa, Mastercard, JCB'
  },
  { 
    id: 'momo', 
    name: 'Ví MoMo', 
    icon: Wallet,
    description: 'Thanh toán qua ví điện tử'
  },
  { 
    id: 'zalopay', 
    name: 'ZaloPay', 
    icon: Smartphone,
    description: 'Thanh toán qua ZaloPay'
  },
  { 
    id: 'vnpay', 
    name: 'VNPay', 
    icon: CreditCard,
    description: 'Thanh toán qua VNPay'
  }
]

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [booking, setBooking] = useState<any>(null)
  const [selectedMethod, setSelectedMethod] = useState('card')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [countdown, setCountdown] = useState(600) // 10 minutes

  useEffect(() => {
    fetchBookingDetails()
  }, [params.id])

  useEffect(() => {
    if (paymentStatus === 'pending' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (countdown === 0 && paymentStatus === 'pending') {
      handlePaymentTimeout()
    }
  }, [countdown, paymentStatus])

  const fetchBookingDetails = async () => {
    try {
      setLoading(true)
      const response = await api.getBooking(params.id as string)
      setBooking(response.booking)
      
      if (response.booking.status === 'confirmed') {
        setPaymentStatus('success')
      } else if (response.booking.status === 'cancelled') {
        setPaymentStatus('failed')
      }
    } catch (error: any) {
      console.error('Error fetching booking:', error)
      
      let errorMessage = 'Không thể tải thông tin đặt vé'
      
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập đặt vé này'
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy thông tin đặt vé'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentTimeout = async () => {
    try {
      await api.cancelBooking(params.id as string, 'Payment timeout')
      setPaymentStatus('failed')
      toast({
        title: 'Hết thời gian thanh toán',
        description: 'Vui lòng đặt vé lại',
        variant: 'destructive'
      })
    } catch (error) {
      console.error('Error cancelling booking:', error)
    }
  }

  const handlePayment = async () => {
    try {
      setProcessing(true)

      // Create payment intent
      const paymentData = {
        bookingId: params.id,
        amount: booking.totalAmount,
        method: selectedMethod
      }

      const response = await api.createPaymentIntent(paymentData)

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Confirm payment
          await api.confirmPayment({
            bookingId: params.id,
            paymentIntentId: response.paymentIntentId
          })

          setPaymentStatus('success')
          toast({
            title: 'Thanh toán thành công',
            description: 'Vé của bạn đã được xác nhận'
          })

          // Refresh booking details
          fetchBookingDetails()
        } catch (error: any) {
          console.error('Error confirming payment:', error)
          setPaymentStatus('failed')
          toast({
            title: 'Thanh toán thất bại',
            description: error.response?.data?.message || 'Đã có lỗi xảy ra',
            variant: 'destructive'
          })
        } finally {
          setProcessing(false)
        }
      }, 2000)
    } catch (error: any) {
      console.error('Error processing payment:', error)
      
      // Handle different error types
      let errorMessage = 'Đã có lỗi xảy ra'
      
      if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        // Delay redirect to show error message
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || 'Bạn không có quyền thực hiện thanh toán này'
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy thông tin đặt vé'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast({
        title: 'Lỗi thanh toán',
        description: errorMessage,
        variant: 'destructive'
      })
      setProcessing(false)
    }
  }

  const handleDownloadTicket = () => {
    // In a real app, this would generate and download a PDF ticket
    toast({
      title: 'Tải vé thành công',
      description: 'Vé đã được lưu vào thiết bị'
    })
  }

  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Vé xem phim',
          text: `Mã đặt vé: ${booking?.bookingCode}`,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Đã sao chép link',
        description: 'Link vé đã được sao chép vào clipboard'
      })
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-white text-xl">Không tìm thấy thông tin đặt vé</p>
        </div>
        <Footer />
      </div>
    )
  }

  const movie = booking.showtimeId?.movieId
  const showtime = booking.showtimeId
  const cinema = booking.showtimeId?.cinemaId

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {paymentStatus === 'success' ? (
          // Success View
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Success Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4"
              >
                <CheckCircle className="w-12 h-12 text-green-500" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">Thanh toán thành công!</h1>
              <p className="text-gray-400">Vé của bạn đã được xác nhận</p>
            </div>

            {/* E-Ticket */}
            <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              {/* Movie Banner */}
              <div className="relative h-48 bg-gradient-to-br from-cinema-600 to-purple-600 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{movie?.title}</h2>
                  <p className="text-lg">{cinema?.name}</p>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Ngày chiếu</p>
                    <p className="font-semibold">{formatDate(showtime?.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Giờ chiếu</p>
                    <p className="font-semibold">{formatTime(showtime?.startTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Phòng chiếu</p>
                    <p className="font-semibold">{showtime?.room?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Ghế ngồi</p>
                    <p className="font-semibold">
                      {booking.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center py-6 border-t border-b border-gray-800">
                  <div className="bg-white p-4 rounded-lg mb-4">
                    {/* Only use bookingCode for QR, not the base64 qrCode string */}
                    <QRCode 
                      value={booking.bookingCode || booking._id?.toString() || ''} 
                      size={200}
                      level="M"
                    />
                  </div>
                  <p className="text-gray-400 text-sm">Mã đặt vé</p>
                  <p className="font-mono font-bold text-xl">{booking.bookingCode}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleDownloadTicket}
                    className="flex-1 bg-cinema-600 hover:bg-cinema-700"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Tải vé
                  </Button>
                  <Button
                    onClick={handleShareTicket}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Chia sẻ
                  </Button>
                </div>

                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-sm text-blue-300 text-center">
                    Vui lòng xuất trình mã QR này tại quầy vé để check-in
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={() => router.push('/profile/bookings')} variant="outline">
                Xem danh sách vé đã đặt
              </Button>
            </div>
          </motion.div>
        ) : paymentStatus === 'failed' ? (
          // Failed View
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold">Thanh toán thất bại</h1>
            <p className="text-gray-400">Đã có lỗi xảy ra trong quá trình thanh toán</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/movies')} variant="outline">
                Về trang chủ
              </Button>
              <Button onClick={() => window.location.reload()} className="bg-cinema-600 hover:bg-cinema-700">
                Thử lại
              </Button>
            </div>
          </motion.div>
        ) : (
          // Payment View
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
              <div className="flex items-center justify-center gap-2 text-yellow-500">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">{formatCountdown(countdown)}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Vui lòng hoàn tất thanh toán trước khi hết thời gian
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Payment Methods */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Chọn phương thức thanh toán</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PAYMENT_METHODS.map(method => {
                      const Icon = method.icon
                      const isSelected = selectedMethod === method.id

                      return (
                        <button
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-cinema-500 bg-cinema-500/10'
                              : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <Icon className={`w-6 h-6 ${isSelected ? 'text-cinema-400' : 'text-gray-400'}`} />
                            <span className="font-semibold">{method.name}</span>
                          </div>
                          <p className="text-sm text-gray-400">{method.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-cinema-600 hover:bg-cinema-700"
                  size="lg"
                >
                  {processing ? 'Đang xử lý...' : `Thanh toán ${formatCurrency(booking.totalAmount)}`}
                </Button>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 h-fit">
                <h3 className="text-lg font-bold mb-4">Thông tin đặt vé</h3>

                <div className="space-y-4">
                  <div>
                    <p className="font-semibold mb-1">{movie?.title}</p>
                    <p className="text-sm text-gray-400">{cinema?.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatDate(showtime?.startTime)} - {formatTime(showtime?.startTime)}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-800 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ghế:</span>
                      <span>{booking.seats?.map((s: any) => `${s.row}${s.number}`).join(', ')}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tiền ghế:</span>
                      <span>{formatCurrency(booking.seats?.reduce((sum: number, s: any) => sum + s.price, 0))}</span>
                    </div>

                    {booking.combos?.length > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Combo:</span>
                          <span>{formatCurrency(booking.combos.reduce((sum: number, c: any) => sum + c.price * c.quantity, 0))}</span>
                        </div>
                      </>
                    )}

                    <div className="pt-2 border-t border-gray-800">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-cinema-400">{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
