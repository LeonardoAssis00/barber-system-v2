import { useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";

export default function LoginChoice() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <section className="space-y-6 text-center">
        <div className="absolute top-6 left-6">
          <BackButton />
        </div>

        <h1 className="text-2xl font-bold">Entrar como</h1>

        <button
          onClick={() => navigate("/login/user")}
          className="w-64 py-3 bg-amber-500 text-zinc-900 rounded-lg font-semibold"
        >
          Cliente
        </button>

        <button
          onClick={() => navigate("/login/barber")}
          className="w-64 py-3 border border-zinc-700 rounded-lg"
        >
          Barbeiro
        </button>
      </section>
    </section>
  );
}
