import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useContext(AuthContext);

  // Enquanto auth ou profile estão carregando
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Carregando...
      </div>
    );
  }

  // Não logado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Profile ainda não disponível → aguarda
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Preparando sua conta...
      </div>
    );
  }

  // Role inválida
  if (allowedRole && profile.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
