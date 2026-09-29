import { create } from "zustand";

export const useBookingStore = create((set) => ({
  search: {
    from: "",
    to: "",
    date: "",
  },

  selectedBus: null,
  selectedSeats: [],
  passengers: [],

  setSearch: (search) =>
    set({ search }),

  setSelectedBus: (bus) =>
    set({ selectedBus: bus }),

  toggleSeat: (seat) =>
    set((state) => ({
      selectedSeats: state.selectedSeats.includes(seat)
        ? state.selectedSeats.filter(
            (item) => item !== seat
          )
        : [...state.selectedSeats, seat],
    })),

  setPassengers: (passengers) =>
    set({ passengers }),

  clearBooking: () =>
    set({
      selectedBus: null,
      selectedSeats: [],
      passengers: [],
    }),
}));