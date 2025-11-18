'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, X, Send, Bot, User, 
  Loader2, Sparkles, AlertCircle, CheckCircle 
} from 'lucide-react'
import { api } from '@/lib/api'
import { useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  sentiment?: 'positive' | 'negative' | 'neutral'
  suggestions?: string[]
}

const QUICK_ACTIONS = [
  'Xem phim đang chiếu',
  'Tìm rạp gần tôi',
  'Phim hot tuần này',
  'Khuyến mãi hôm nay'
]

export function Chatbot() {
  const { isChatbotOpen, setChatbotOpen } = useUIStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý ảo của hệ thống đặt vé. Tôi có thể giúp gì cho bạn?',
      timestamp: new Date(),
      suggestions: QUICK_ACTIONS
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(() => `session_${Date.now()}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || input.trim()
    if (!messageContent) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Send to chatbot API
      const response = await api.sendChatMessage(messageContent, sessionId)

      // Add bot response
      const botMessage: Message = {
        id: `${Date.now()}_bot`,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        sentiment: response.sentiment,
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, botMessage])

      // Check if escalation is needed (negative sentiment)
      if (response.sentiment === 'negative' && response.escalate) {
        const escalationMessage: Message = {
          id: `${Date.now()}_escalate`,
          type: 'bot',
          content: '🚨 Tôi nhận thấy bạn đang gặp vấn đề. Hệ thống đã chuyển yêu cầu của bạn đến nhân viên hỗ trợ. Vui lòng chờ trong giây lát.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, escalationMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `${Date.now()}_error`,
        type: 'bot',
        content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'negative':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isChatbotOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatbotOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-cinema-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gray-900 rounded-lg shadow-2xl border border-gray-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cinema-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs">Đang hoạt động</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatbotOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user'
                        ? 'bg-cinema-600'
                        : 'bg-gradient-to-br from-purple-600 to-blue-600'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-5 h-5" />
                      ) : (
                        <Bot className="w-5 h-5" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-cinema-600'
                          : 'bg-gray-800 border border-gray-700'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>

                      {/* Sentiment & Timestamp */}
                      <div className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${
                        message.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        {getSentimentIcon(message.sentiment)}
                        <span>{formatTime(message.timestamp)}</span>
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickAction(suggestion)}
                              className="block w-full text-left px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                            >
                              <Sparkles className="w-3 h-3 inline mr-2 text-cinema-400" />
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cinema-500"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="bg-cinema-600 hover:bg-cinema-700"
                  size="icon"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_ACTIONS.slice(0, 2).map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
