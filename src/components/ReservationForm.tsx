
import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReservations, Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";

interface ReservationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingReservation?: Reservation;
}

const ReservationForm = ({ onClose, onSuccess, editingReservation }: ReservationFormProps) => {
  const { addReservation, updateReservation } = useReservations();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<{
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    partySize: number;
    date: string;
    time: string;
    tableNumber: string;
    notes: string;
    status: "confirmed" | "pending" | "cancelled" | "completed";
  }>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    partySize: 2,
    date: "",
    time: "",
    tableNumber: "",
    notes: "",
    status: "confirmed",
  });

  // Populate form when editing
  useEffect(() => {
    if (editingReservation) {
      setFormData({
        customerName: editingReservation.customerName,
        customerPhone: editingReservation.customerPhone,
        customerEmail: editingReservation.customerEmail,
        partySize: editingReservation.partySize,
        date: editingReservation.date,
        time: editingReservation.time,
        tableNumber: editingReservation.tableNumber?.toString() || "",
        notes: editingReservation.notes || "",
        status: editingReservation.status,
      });
    }
  }, [editingReservation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Name, Date, Time).",
        variant: "destructive",
      });
      return;
    }

    const reservationData = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      partySize: formData.partySize,
      date: formData.date,
      time: formData.time,
      tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : undefined,
      notes: formData.notes,
      status: formData.status,
    };

    if (editingReservation) {
      updateReservation(editingReservation.id, reservationData);
      toast({
        title: "Success",
        description: "Reservation updated successfully!",
      });
    } else {
      addReservation(reservationData);
      toast({
        title: "Success",
        description: "Reservation created successfully!",
      });
    }

    onSuccess();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 11; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {editingReservation ? "Edit Reservation" : "New Reservation"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                placeholder="Enter phone number (optional)"
              />
            </div>

            <div>
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                placeholder="Enter email (optional)"
              />
            </div>

            <div>
              <Label htmlFor="partySize">Party Size *</Label>
              <Select 
                value={formData.partySize.toString()} 
                onValueChange={(value) => handleInputChange("partySize", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? "person" : "people"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="time">Time *</Label>
              <Select 
                value={formData.time} 
                onValueChange={(value) => handleInputChange("time", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {generateTimeSlots().map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tableNumber">Table Number</Label>
              <Input
                id="tableNumber"
                type="number"
                value={formData.tableNumber}
                onChange={(e) => handleInputChange("tableNumber", e.target.value)}
                placeholder="Enter table number (optional)"
                min="1"
              />
            </div>

            {editingReservation && (
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "confirmed" | "pending" | "cancelled" | "completed") => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any special requests or notes (optional)"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                {editingReservation ? "Update Reservation" : "Create Reservation"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReservationForm;
