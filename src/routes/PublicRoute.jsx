import { Navigate } from "react-router-dom";
import { useAuth } from "../context/UseAuth";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (user) {
    // Ajuste conforme seu controle de role
    if (user.role === "barber") {
      return <Navigate to="/dashboard/barber" replace />;
    }

    return <Navigate to="/dashboard/user" replace />;
  }

  return children;
}
