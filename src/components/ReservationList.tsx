import { useState } from "react";
import { Search, Phone, Mail, Users, Calendar, Clock, Hash, Edit, Trash2, Filter, CheckCircle, XCircle, ArrowUpDown, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useReservations, Reservation } from "@/context/ReservationContext";
import { useToast } from "@/hooks/use-toast";
import ReservationForm from "./ReservationForm";

type SortOption = "name" | "time" | "date" | "table" | "default";

const ReservationList = () => {
  const { reservations, deleteReservation, markAsArrived, completeReservation, isReservationLate, getTodayReservations } = useReservations();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  const getActiveReservations = () => {
    return reservations.filter(reservation => reservation.status !== "completed");
  };

  const filteredReservations = (showTodayOnly ? getTodayReservations() : getActiveReservations()).filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.customerPhone.includes(searchTerm) ||
                         reservation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter;
    const matchesDate = !dateFilter || reservation.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedReservations = [...filteredReservations].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.customerName.localeCompare(b.customerName);
      case "time":
        return a.time.localeCompare(b.time);
      case "date":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "table":
        const tableA = a.tableNumber || 0;
        const tableB = b.tableNumber || 0;
        return tableA - tableB;
      case "default":
      default:
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
    }
  });

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "name": return "Name";
      case "time": return "Time";
      case "date": return "Date";
      case "table": return "Table Number";
      case "default": return "Default (Date & Time)";
      default: return "Sort by";
    }
  };

  const handleDelete = (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the reservation for ${customerName}?`)) {
      deleteReservation(id);
      toast({
        title: "Reservation Deleted",
        description: `Reservation for ${customerName} has been removed.`,
      });
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
  };

  const handleCloseEdit = () => {
    setEditingReservation(null);
  };

  const handleMarkArrived = (id: string, customerName: string) => {
    markAsArrived(id);
    toast({
      title: "Customer Arrived",
      description: `${customerName} has been marked as arrived.`,
    });
  };

  const handleCompleteReservation = (id: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to send ${customerName}'s reservation to history?`)) {
      completeReservation(id);
      toast({
        title: "Reservation Completed",
        description: `${customerName}'s reservation has been moved to history.`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Filter className="h-5 w-5 mr-2 text-orange-500" />
            Filter & Sort Reservations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {getSortLabel(sortBy)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white border shadow-lg">
                <DropdownMenuItem onClick={() => setSortBy("default")}>
                  Default (Date & Time)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("time")}>
                  Time
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("table")}>
                  Table Number
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={showTodayOnly ? "default" : "outline"}
              onClick={() => setShowTodayOnly(!showTodayOnly)}
              className="w-full"
            >
              {showTodayOnly ? "Show All" : "Today Only"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {sortedReservations.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" || dateFilter
                    ? "Try adjusting your filters to see more results."
                    : "Create your first reservation to get started."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          sortedReservations.map((reservation) => {
            const isLate = isReservationLate(reservation);
            return (
              <Card 
                key={reservation.id} 
                className={`hover:shadow-md transition-shadow ${isLate ? 'border-red-500 bg-red-50' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reservation.customerName}
                          </h3>
                          {reservation.arrived && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Arrived
                            </Badge>
                          )}
                          {isLate && !reservation.arrived && (
                            <Badge className="bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Late
                            </Badge>
                          )}
                        </div>
                        <Badge className={getStatusColor(reservation.status)}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {/* Contact Information Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {reservation.customerPhone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-orange-500" />
                            {reservation.customerPhone}
                          </div>
                        )}
                        {reservation.customerEmail && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-orange-500" />
                            {reservation.customerEmail}
                          </div>
                        )}
                      </div>
                      
                      {/* Reservation Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-orange-500" />
                          {reservation.partySize} people
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                          {formatDate(reservation.date)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-orange-500" />
                          {reservation.time}
                        </div>
                        {reservation.tableNumber && (
                          <div className="flex items-center text-gray-600">
                            <Hash className="h-4 w-4 mr-2 text-orange-500" />
                            Table {reservation.tableNumber}
                          </div>
                        )}
                      </div>
                      
                      {/* Notes Section */}
                      {reservation.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Notes:</strong> {reservation.notes}
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {!reservation.arrived && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkArrived(reservation.id, reservation.customerName)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Arrived
                        </Button>
                      )}
                      {reservation.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCompleteReservation(reservation.id, reservation.customerName)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          To History
                        </Button>
                      )}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reservation)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(reservation.id, reservation.customerName)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Reservation Modal */}
      {editingReservation && (
        <ReservationForm
          editingReservation={editingReservation}
          onClose={handleCloseEdit}
          onSuccess={handleCloseEdit}
        />
      )}
    </div>
  );
};

export default ReservationList;
