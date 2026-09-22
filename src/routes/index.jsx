import { Routes, Route } from "react-router-dom";

// Home
import Home from "../pages/Home";

// Auth - Register
import UserRegister from "../pages/auth/UserRegister";
import BarberRegister from "../pages/auth/BarberRegister";

// Auth - Login
import UserLogin from "../pages/auth/UserLogin";
import BarberLogin from "../pages/auth/BarberLogin";
import LoginChoice from "../pages/auth/LoginChoice";

//Barber - Payments
import BarberPayment from "../pages/dashboard/barber/BarberPayments";

// Dashboards
import DashboardUser from "../pages/dashboard/user/DashBoardUser";
import DashboardBarber from "../pages/dashboard/barber/DashBoardBarber";

//Agendar
import BookingPage from "../agendar/BookingPage";

// Route Guard
import ProtectedRoute from "./ProtectedRoute";
import MyBookings from "../agendar/MyBookings";

export default function RoutesApp() {
  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Home />} />

      {/* Escolha do login */}
      <Route path="/login" element={<LoginChoice />} />

      {/* Cadastro */}
      <Route path="/register/user" element={<UserRegister />} />
      <Route path="/register/barber" element={<BarberRegister />} />

      {/* Login */}
      <Route path="/login/user" element={<UserLogin />} />
      <Route path="/login/barber" element={<BarberLogin />} />

      {/* Mostra barbearia pelo slug */}
      <Route path="/agendar/:slug" element={<BookingPage />} />

      {/* Mostrar agendamentos */}
      <Route path="/meus-agendamentos" element={<MyBookings />} />

      {/* Pagina de bloqueio / pagamentos */}
      <Route path="/payment" element={<BarberPayment />} />

      {/* ROTAS PROTEGIDAS */}
      <Route
        path="/dashboard/user"
        element={
          <ProtectedRoute allowedRole="user">
            <DashboardUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/barber"
        element={
          <ProtectedRoute allowedRole="barber">
            <DashboardBarber />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
