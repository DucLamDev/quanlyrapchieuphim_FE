'use client'

import { useRef } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TicketData {
  bookingCode: string
  qrCode: string
  movie: {
    title: string
    duration: number
    ageRating: string
  }
  cinema: {
    name: string
    address: string
  }
  showtime: {
    date: string
    time: string
    screen: string
  }
  seats: string
  combos: any[]
  totalAmount: number
  customer: {
    name: string
    email: string
  }
  createdAt: string
}

interface TicketPDFProps {
  ticketData: TicketData
}

export function TicketPDF({ ticketData }: TicketPDFProps) {
  const ticketRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const ticketHTML = ticketRef.current?.innerHTML || ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Vé - ${ticketData.bookingCode}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          
          body {
            font-family: 'Courier New', monospace;
            width: 70mm;
            margin: 0 auto;
            padding: 5mm;
            font-size: 12px;
            line-height: 1.4;
          }
          
          .ticket-header {
            text-align: center;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .cinema-name {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .ticket-body {
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          
          .label {
            font-weight: bold;
          }
          
          .qr-code {
            text-align: center;
            margin: 15px 0;
          }
          
          .qr-code img {
            width: 150px;
            height: 150px;
          }
          
          .booking-code {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            margin-top: 5px;
          }
          
          .ticket-footer {
            text-align: center;
            font-size: 10px;
            margin-top: 10px;
          }
          
          .divider {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          
          @media print {
            body {
              width: 80mm;
            }
          }
        </style>
      </head>
      <body>
        ${ticketHTML}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 1000);
          }
        </script>
      </body>
      </html>
    `)

    printWindow.document.close()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div>
      <Button onClick={handlePrint} className="flex items-center gap-2 mb-4">
        <Printer className="w-4 h-4" />
        In vé
      </Button>

      {/* Hidden ticket template for printing */}
      <div ref={ticketRef} style={{ display: 'none' }}>
        <div className="ticket-header">
          <div className="cinema-name">RAPPHIM CINEMA</div>
          <div>{ticketData.cinema.name}</div>
          <div style={{ fontSize: '10px' }}>{ticketData.cinema.address}</div>
        </div>

        <div className="ticket-body">
          <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            {ticketData.movie.title}
          </div>
          
          <div className="info-row">
            <span className="label">Ngày:</span>
            <span>{ticketData.showtime.date}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Giờ:</span>
            <span>{ticketData.showtime.time}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Phòng:</span>
            <span>{ticketData.showtime.screen}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Ghế:</span>
            <span>{ticketData.seats}</span>
          </div>
          
          {ticketData.combos && ticketData.combos.length > 0 && (
            <>
              <div className="divider"></div>
              <div className="label">Combo:</div>
              {ticketData.combos.map((combo: any, index: number) => (
                <div key={index} className="info-row">
                  <span>{combo.name} x{combo.quantity}</span>
                  <span>{formatCurrency(combo.price * combo.quantity)}</span>
                </div>
              ))}
            </>
          )}
          
          <div className="divider"></div>
          <div className="info-row" style={{ fontSize: '14px', fontWeight: 'bold' }}>
            <span>TỔNG TIỀN:</span>
            <span>{formatCurrency(ticketData.totalAmount)}</span>
          </div>
        </div>

        <div className="qr-code">
          <img src={ticketData.qrCode} alt="QR Code" />
          <div className="booking-code">{ticketData.bookingCode}</div>
        </div>

        <div className="ticket-footer">
          <div>Khách hàng: {ticketData.customer.name}</div>
          <div>Ngày đặt: {ticketData.createdAt}</div>
          <div className="divider"></div>
          <div>Vui lòng xuất trình QR code này tại cổng vào</div>
          <div>Cảm ơn quý khách đã lựa chọn RapPhim</div>
        </div>
      </div>
    </div>
  )
}
