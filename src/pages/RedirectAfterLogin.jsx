import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../context/UseAuth";

export default function RedirectAfterLogin() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "barber") {
        navigate("/dashboard/barber", { replace: true });
      } else {
        navigate("/dashboard/user", { replace: true });
      }
    }
  }, [profile, loading, navigate]);

  return <p>Redirecionando...</p>;
}
