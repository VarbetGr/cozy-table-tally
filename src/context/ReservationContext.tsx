
import { createContext, useContext, useState, useEffect } from "react";

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  partySize: number;
  date: string;
  time: string;
  tableNumber?: number;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
}

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, "id" | "createdAt">) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  getReservationsByDate: (date: string) => Reservation[];
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservations must be used within a ReservationProvider");
  }
  return context;
};

export const ReservationProvider = ({ children }: { children: React.ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Load reservations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("restaurant-reservations");
    if (stored) {
      setReservations(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever reservations change
  useEffect(() => {
    localStorage.setItem("restaurant-reservations", JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (reservation: Omit<Reservation, "id" | "createdAt">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const updateReservation = (id: string, updates: Partial<Reservation>) => {
    setReservations(prev =>
      prev.map(reservation =>
        reservation.id === id ? { ...reservation, ...updates } : reservation
      )
    );
  };

  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(reservation => reservation.id !== id));
  };

  const getReservationsByDate = (date: string) => {
    return reservations.filter(reservation => reservation.date === date);
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        addReservation,
        updateReservation,
        deleteReservation,
        getReservationsByDate,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
