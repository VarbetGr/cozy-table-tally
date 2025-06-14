import { useState } from "react";
import { Calendar, Plus, Users, Clock, Search, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReservationForm from "@/components/ReservationForm";
import ReservationList from "@/components/ReservationList";
import CalendarView from "@/components/CalendarView";
import HistoryPage from "@/components/HistoryPage";
import { ReservationProvider } from "@/context/ReservationContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [showForm, setShowForm] = useState(false);

  return (
    <ReservationProvider>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-500 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Izabela Restaurant</h1>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Reservation
              </Button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="bg-white border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("list")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "list"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Reservations
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "calendar"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "history"
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                History
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "list" && <ReservationList />}
          {activeTab === "calendar" && <CalendarView />}
          {activeTab === "history" && <HistoryPage />}
        </main>

        {/* Reservation Form Modal */}
        {showForm && (
          <ReservationForm 
            onClose={() => setShowForm(false)} 
            onSuccess={() => setShowForm(false)}
          />
        )}
      </div>
    </ReservationProvider>
  );
};

export default Index;
