import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Admin pages
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Guests from "./pages/Guests";
import Billing from "./pages/Billing";
import Housekeeping from "./pages/Housekeeping";
import Calendar from "./pages/Calendar";
import NewBooking from "./pages/NewBooking";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Staff from "./pages/Staff";
import CheckInOut from "./pages/CheckInOut";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

// Public site
import { PublicLayout } from "./components/public/PublicLayout";
import Home from "./pages/public/Home";
import RoomsPublic from "./pages/public/RoomsPublic";
import RoomDetail from "./pages/public/RoomDetail";
import Amenities from "./pages/public/Amenities";
import Gallery from "./pages/public/Gallery";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import Reserve from "./pages/public/Reserve";
import Confirmation from "./pages/public/Confirmation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/rooms-public" element={<RoomsPublic />} />
            <Route path="/rooms-public/:slug" element={<RoomDetail />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reserve" element={<Reserve />} />
            <Route path="/reserve/confirmation" element={<Confirmation />} />
          </Route>

          {/* Admin / staff portal */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/bookings/new" element={<NewBooking />} />
          <Route path="/check-in-out" element={<CheckInOut />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
