import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  avatar?: string
  loyaltyPoints?: number
  loyaltyTier?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

interface BookingState {
  selectedShowtime: any
  selectedSeats: any[]
  selectedCombos: any[]
  setShowtime: (showtime: any) => void
  setSeats: (seats: any[]) => void
  addSeat: (seat: any) => void
  removeSeat: (seat: any) => void
  setCombos: (combos: any[]) => void
  addCombo: (combo: any) => void
  removeCombo: (comboId: string) => void
  clearBooking: () => void
  getTotalAmount: () => number
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedShowtime: null,
  selectedSeats: [],
  selectedCombos: [],
  setShowtime: (showtime) => set({ selectedShowtime: showtime }),
  setSeats: (seats) => set({ selectedSeats: seats }),
  addSeat: (seat) =>
    set((state) => ({
      selectedSeats: [...state.selectedSeats, seat],
    })),
  removeSeat: (seat) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.filter(
        (s) => !(s.row === seat.row && s.number === seat.number)
      ),
    })),
  setCombos: (combos) => set({ selectedCombos: combos }),
  addCombo: (combo) =>
    set((state) => {
      const existing = state.selectedCombos.find((c) => c.comboId === combo.comboId)
      if (existing) {
        return {
          selectedCombos: state.selectedCombos.map((c) =>
            c.comboId === combo.comboId
              ? { ...c, quantity: c.quantity + 1 }
              : c
          ),
        }
      }
      return {
        selectedCombos: [...state.selectedCombos, { ...combo, quantity: 1 }],
      }
    }),
  removeCombo: (comboId) =>
    set((state) => ({
      selectedCombos: state.selectedCombos.filter((c) => c.comboId !== comboId),
    })),
  clearBooking: () =>
    set({
      selectedShowtime: null,
      selectedSeats: [],
      selectedCombos: [],
    }),
  getTotalAmount: () => {
    const state = get()
    const seatsTotal = state.selectedSeats.reduce(
      (sum, seat) => sum + (seat.price || 0),
      0
    )
    const combosTotal = state.selectedCombos.reduce(
      (sum, combo) => sum + combo.price * combo.quantity,
      0
    )
    return seatsTotal + combosTotal
  },
}))

interface UIState {
  isChatbotOpen: boolean
  isSearchOpen: boolean
  selectedDate: Date
  setChatbotOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  setSelectedDate: (date: Date) => void
}

export const useUIStore = create<UIState>((set) => ({
  isChatbotOpen: false,
  isSearchOpen: false,
  selectedDate: new Date(),
  setChatbotOpen: (open) => set({ isChatbotOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setSelectedDate: (date) => set({ selectedDate: date }),
}))
