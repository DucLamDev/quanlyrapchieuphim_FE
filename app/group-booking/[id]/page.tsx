'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Share2, Copy, Check, Clock, MapPin, Calendar, Ticket } from 'lucide-react'
import Image from 'next/image'
import { api } from '@/lib/api'
import { formatTime, formatDate, formatCurrency } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

export default function GroupBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [groupBooking, setGroupBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    fetchGroupBooking()
  }, [params.id])

  const fetchGroupBooking = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from API
      // Mock data for demonstration
      const mockData = {
        _id: params.id,
        shareCode: params.id,
        showtimeId: {
          movieId: {
            title: 'Spider-Man: No Way Home',
            poster: '/placeholder.jpg',
            duration: 148
          },
          cinemaId: {
            name: 'CGV Vincom Center',
            address: '72 Lê Thánh Tôn, Q.1, TP.HCM'
          },
          room: { name: 'Rạp 3' },
          startTime: new Date(Date.now() + 86400000).toISOString()
        },
        organizer: {
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com'
        },
        participants: [
          { fullName: 'Nguyễn Văn A', seats: ['A1', 'A2'] },
          { fullName: 'Trần Thị B', seats: ['A3'] }
        ],
        maxParticipants: 10,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        status: 'active'
      }
      setGroupBooking(mockData)
    } catch (error) {
      console.error('Error fetching group booking:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thông tin đặt vé nhóm',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/group-booking/${params.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast({
      title: 'Đã sao chép',
      description: 'Link đã được sao chép vào clipboard'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const link = `${window.location.origin}/group-booking/${params.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cùng xem phim nhé!',
          text: `Tham gia cùng xem phim ${groupBooking?.showtimeId?.movieId?.title}`,
          url: link
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleJoinGroup = async () => {
    try {
      setJoining(true)
      // In a real app, this would join the group via API
      toast({
        title: 'Đã tham gia nhóm',
        description: 'Chuyển đến trang đặt vé...'
      })
      setTimeout(() => {
        router.push(`/booking/${groupBooking?.showtimeId?._id}?groupId=${params.id}`)
      }, 1000)
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tham gia nhóm',
        variant: 'destructive'
      })
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!groupBooking) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-white text-xl">Không tìm thấy nhóm đặt vé</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const movie = groupBooking.showtimeId?.movieId
  const showtime = groupBooking.showtimeId
  const cinema = groupBooking.showtimeId?.cinemaId
  const participantCount = groupBooking.participants?.length || 0
  const spotsLeft = groupBooking.maxParticipants - participantCount

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cinema-600/20 rounded-full mb-4">
              <Users className="w-8 h-8 text-cinema-400" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Đặt vé nhóm</h1>
            <p className="text-gray-400">
              {groupBooking.organizer?.fullName} mời bạn cùng xem phim
            </p>
          </div>

          {/* Movie Info */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-32 h-48 bg-gray-800 rounded-lg overflow-hidden">
                {movie?.poster && (
                  <Image
                    src={movie.poster}
                    alt={movie.title}
                    width={128}
                    height={192}
                    className="object-cover w-full h-full"
                  />
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">{movie?.title}</h2>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-cinema-400" />
                    <div>
                      <p className="font-semibold">{cinema?.name}</p>
                      <p className="text-sm text-gray-400">{showtime?.room?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar className="w-5 h-5 text-cinema-400" />
                    <p className="font-semibold">{formatDate(showtime?.startTime)}</p>
                  </div>

                  <div className="flex items-center gap-3 text-gray-300">
                    <Clock className="w-5 h-5 text-cinema-400" />
                    <p className="font-semibold">{formatTime(showtime?.startTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Group Info */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Thông tin nhóm</h3>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-400">Số người tham gia</span>
                <span className="font-semibold">
                  {participantCount} / {groupBooking.maxParticipants}
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cinema-600 to-purple-600 rounded-full transition-all"
                  style={{ width: `${(participantCount / groupBooking.maxParticipants) * 100}%` }}
                />
              </div>
              {spotsLeft > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Còn {spotsLeft} chỗ trống
                </p>
              )}
            </div>

            {/* Participants */}
            <div>
              <h4 className="font-semibold mb-3">Thành viên ({participantCount})</h4>
              <div className="space-y-2">
                {groupBooking.participants?.map((participant: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-cinema-600 rounded-full flex items-center justify-center font-bold">
                        {participant.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{participant.fullName}</p>
                        {index === 0 && (
                          <span className="text-xs text-cinema-400">Người tạo</span>
                        )}
                      </div>
                    </div>
                    {participant.seats && (
                      <div className="flex items-center gap-1">
                        <Ticket className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-400">
                          {participant.seats.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="bg-gradient-to-br from-cinema-600/20 to-purple-600/20 rounded-lg p-6 border border-cinema-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-6 h-6 text-cinema-400" />
              <h3 className="text-lg font-bold">Chia sẻ với bạn bè</h3>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={`${window.location.origin}/group-booking/${params.id}`}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-900 rounded-lg text-gray-400 font-mono text-sm"
              />
              <Button
                onClick={handleCopyLink}
                className="bg-gray-800 hover:bg-gray-700"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5 mr-2" />
                    Sao chép
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Chia sẻ qua...
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleJoinGroup}
              disabled={joining || spotsLeft === 0}
              className="flex-1 bg-cinema-600 hover:bg-cinema-700"
              size="lg"
            >
              {joining ? 'Đang tham gia...' : spotsLeft === 0 ? 'Đã đầy' : 'Tham gia nhóm'}
            </Button>
            <Button
              onClick={() => router.push('/movies')}
              variant="outline"
              size="lg"
            >
              Đặt vé riêng
            </Button>
          </div>

          {/* Expiry Notice */}
          <div className="text-center text-sm text-gray-400">
            <Clock className="w-4 h-4 inline mr-2" />
            Link này sẽ hết hạn sau {new Date(groupBooking.expiresAt).toLocaleTimeString('vi-VN')}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
