
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
  status: "confirmed" | "pending" | "cancelled" | "completed";
  arrived: boolean;
  createdAt: string;
}

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, "id" | "createdAt" | "arrived">) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;
  getReservationsByDate: (date: string) => Reservation[];
  getTodayReservations: () => Reservation[];
  getPastReservations: () => Reservation[];
  markAsArrived: (id: string) => void;
  completeReservation: (id: string) => void;
  isReservationLate: (reservation: Reservation) => boolean;
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

  const addReservation = (reservation: Omit<Reservation, "id" | "createdAt" | "arrived">) => {
    const newReservation: Reservation = {
      ...reservation,
      id: crypto.randomUUID(),
      arrived: false,
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

  const getTodayReservations = () => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(reservation => 
      reservation.date === today && reservation.status !== "completed"
    );
  };

  const getPastReservations = () => {
    const today = new Date().toISOString().split('T')[0];
    return reservations.filter(reservation => 
      reservation.date < today || reservation.status === "completed"
    );
  };

  const markAsArrived = (id: string) => {
    updateReservation(id, { arrived: true });
  };

  const completeReservation = (id: string) => {
    updateReservation(id, { status: "completed" });
  };

  const isReservationLate = (reservation: Reservation) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Only check if it's today and not arrived
    if (reservation.date !== today || reservation.arrived) {
      return false;
    }

    const [hours, minutes] = reservation.time.split(':').map(Number);
    const reservationTime = hours * 60 + minutes;
    
    // Late if current time is more than 30 minutes past reservation time
    return currentTime > reservationTime + 30;
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        addReservation,
        updateReservation,
        deleteReservation,
        getReservationsByDate,
        getTodayReservations,
        getPastReservations,
        markAsArrived,
        completeReservation,
        isReservationLate,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};
