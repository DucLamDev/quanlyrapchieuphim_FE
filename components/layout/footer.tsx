'use client'

import Link from 'next/link'
import { Film, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Film className="w-8 h-8 text-cinema-500" />
              <span className="text-xl font-bold gradient-text">CINEMA</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Hệ thống rạp chiếu phim hiện đại với công nghệ AI và trải nghiệm tuyệt vời
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-gray-400 hover:text-cinema-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cinema-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-cinema-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Kết</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Phim
                </Link>
              </li>
              <li>
                <Link href="/cinemas" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Rạp
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Ưu Đãi
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Về Chúng Tôi
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Điều Khoản
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Chính Sách Bảo Mật
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-cinema-500 transition-colors text-sm">
                  Liên Hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Liên Hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Đường ABC, Quận XYZ, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>support@cinema.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Cinema Management System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
