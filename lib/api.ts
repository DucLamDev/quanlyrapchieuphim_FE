import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

class APIClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Don't redirect if already on login page or payment page
          const currentPath = window.location.pathname
          if (currentPath !== '/login' && !currentPath.startsWith('/payment/')) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            // Only redirect if not in a payment flow
            if (!currentPath.includes('/payment')) {
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth
  async register(data: any) {
    const response = await this.client.post('/auth/register', data)
    return response.data
  }

  async login(data: any) {
    const response = await this.client.post('/auth/login', data)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  }

  async logout() {
    await this.client.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async getMe() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  async updateProfile(data: any) {
    const response = await this.client.put('/auth/update-profile', data)
    return response.data
  }

  async updatePassword(data: any) {
    const response = await this.client.put('/auth/update-password', data)
    return response.data
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(token: string, password: string) {
    const response = await this.client.put(`/auth/reset-password/${token}`, { password })
    return response.data
  }

  // Movies
  async getMovies(params?: any) {
    const response = await this.client.get('/movies', { params })
    return response.data
  }

  async getMovie(id: string) {
    const response = await this.client.get(`/movies/${id}`)
    return response.data
  }

  async getNowShowing() {
    const response = await this.client.get('/movies/now-showing')
    return response.data
  }

  async getComingSoon() {
    const response = await this.client.get('/movies/coming-soon')
    return response.data
  }

  async searchMovies(query: string) {
    const response = await this.client.get('/movies/search', { params: { q: query } })
    return response.data
  }

  async createMovie(data: any) {
    const response = await this.client.post('/movies', data)
    return response.data
  }

  async updateMovie(id: string, data: any) {
    const response = await this.client.put(`/movies/${id}`, data)
    return response.data
  }

  async deleteMovie(id: string) {
    const response = await this.client.delete(`/movies/${id}`)
    return response.data
  }

  // Showtimes
  async getShowtimes(params?: any) {
    const response = await this.client.get('/showtimes', { params })
    return response.data
  }

  async getShowtime(id: string) {
    const response = await this.client.get(`/showtimes/${id}`)
    return response.data
  }

  async getShowtimesByMovie(movieId: string, params?: any) {
    const response = await this.client.get(`/showtimes/movie/${movieId}`, { params })
    return response.data
  }

  async createShowtime(data: any) {
    const response = await this.client.post('/showtimes', data)
    return response.data
  }

  // Bookings
  async createBooking(data: any) {
    const response = await this.client.post('/bookings', data)
    return response.data
  }

  async getMyBookings(params?: any) {
    const response = await this.client.get('/bookings/my-bookings', { params })
    return response.data
  }

  async getBooking(id: string) {
    const response = await this.client.get(`/bookings/${id}`)
    return response.data
  }

  async cancelBooking(id: string, reason?: string) {
    const response = await this.client.put(`/bookings/${id}/cancel`, { reason })
    return response.data
  }

  async getAllBookings(params?: any) {
    const response = await this.client.get('/bookings', { params })
    return response.data
  }

  async getPrintableTicket(id: string) {
    const response = await this.client.get(`/bookings/${id}/print-ticket`)
    return response.data
  }

  // Reviews
  async getReviews(movieId: string, params?: any) {
    const response = await this.client.get(`/reviews/movie/${movieId}`, { params })
    return response.data
  }

  async createReview(data: any) {
    const response = await this.client.post('/reviews', data)
    return response.data
  }

  async updateReview(id: string, data: any) {
    const response = await this.client.put(`/reviews/${id}`, data)
    return response.data
  }

  async deleteReview(id: string) {
    const response = await this.client.delete(`/reviews/${id}`)
    return response.data
  }

  async likeReview(id: string, action: 'like' | 'dislike') {
    const response = await this.client.post(`/reviews/${id}/like`, { action })
    return response.data
  }

  // Recommendations
  async getPersonalizedRecommendations() {
    const response = await this.client.get('/recommendations/personalized')
    return response.data
  }

  async getSimilarMovies(movieId: string) {
    const response = await this.client.get(`/recommendations/similar/${movieId}`)
    return response.data
  }

  async getTrendingMovies(days?: number) {
    const response = await this.client.get('/recommendations/trending', {
      params: { days }
    })
    return response.data
  }

  // Crowd Prediction
  async predictShowtimeCrowd(showtimeId: string) {
    const response = await this.client.get(`/crowd-prediction/showtime/${showtimeId}`)
    return response.data
  }

  async getShowtimesByOccupancy(params: any) {
    const response = await this.client.get('/crowd-prediction/filter', { params })
    return response.data
  }

  // Chatbot
  async sendChatMessage(message: string, sessionId: string) {
    const response = await this.client.post('/chatbot/message', {
      message,
      sessionId
    })
    return response.data
  }

  // Loyalty
  async getMyLoyaltyInfo() {
    const response = await this.client.get('/loyalty/my-info')
    return response.data
  }

  async getAvailableRewards() {
    const response = await this.client.get('/loyalty/rewards')
    return response.data
  }

  async redeemPoints(data: any) {
    const response = await this.client.post('/loyalty/redeem', data)
    return response.data
  }

  async getLoyaltyHistory() {
    const response = await this.client.get('/loyalty/history')
    return response.data
  }

  // Promotions
  async getPromotions(params?: any) {
    const response = await this.client.get('/promotions', { params })
    return response.data
  }

  async validatePromotionCode(data: any) {
    const response = await this.client.post('/promotions/validate', data)
    return response.data
  }

  // Cinemas
  async getCinemas(params?: any) {
    const response = await this.client.get('/cinemas', { params })
    return response.data
  }

  async getCinema(id: string) {
    const response = await this.client.get(`/cinemas/${id}`)
    return response.data
  }

  async getNearestCinemas(lat: number, lng: number) {
    const response = await this.client.get('/cinemas/nearest', {
      params: { lat, lng }
    })
    return response.data
  }

  // Payment
  async createPaymentIntent(data: any) {
    const response = await this.client.post('/payments/create-intent', data)
    return response.data
  }

  async confirmPayment(data: any) {
    const response = await this.client.post('/payments/confirm', data)
    return response.data
  }

  // Revenue (Admin)
  async getDashboardStats() {
    const response = await this.client.get('/revenue/dashboard')
    return response.data
  }

  async getRevenueByPeriod(params: any) {
    const response = await this.client.get('/revenue/period', { params })
    return response.data
  }

  async getRevenueByMovie(params?: any) {
    const response = await this.client.get('/revenue/by-movie', { params })
    return response.data
  }

  async exportReport(params: any) {
    const response = await this.client.get('/revenue/export', { params })
    return response.data
  }

  async getBookingStats(params?: any) {
    const response = await this.client.get('/revenue/booking-stats', { params })
    return response.data
  }

  async getRecentActivities(params?: any) {
    const response = await this.client.get('/revenue/recent-activities', { params })
    return response.data
  }

  // Users (Admin)
  async getUsers(params?: any) {
    const response = await this.client.get('/users', { params })
    return response.data
  }

  async getAllUsers(params?: any) {
    const response = await this.client.get('/users', { params })
    return response.data
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`)
    return response.data
  }

  async getUserById(id: string) {
    return this.getUser(id)
  }

  async getBookings(params?: any) {
    const response = await this.client.get('/bookings', { params })
    return response.data
  }

  async updateUser(id: string, data: any) {
    const response = await this.client.put(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/users/${id}`)
    return response.data
  }

  // Showtimes Management (Admin)
  async deleteShowtime(id: string) {
    const response = await this.client.delete(`/showtimes/${id}`)
    return response.data
  }

  async updateShowtime(id: string, data: any) {
    const response = await this.client.put(`/showtimes/${id}`, data)
    return response.data
  }

  // Combos
  async getCombos(params?: any) {
    const response = await this.client.get('/combos', { params })
    return response.data
  }

  // Search User (Staff)
  async searchUser(params: { phone?: string; email?: string }) {
    const response = await this.client.get('/users/search', { params })
    return response.data
  }
}

export const api = new APIClient()
export default api
