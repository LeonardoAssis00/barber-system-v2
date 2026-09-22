import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <section className="max-w-xl w-full text-center space-y-8 px-6">
        {/* Título */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          <span className="text-amber-500">Barber</span>
          <span className="text-zinc-100">System</span>
        </h1>

        {/* Descrição */}
        <p className="text-zinc-400 text-base md:text-lg leading-relaxed">
          Gerencie agendamentos, clientes e serviços de forma simples e
          profissional.
        </p>

        {/* Botões */}
        <section className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/register/user")}
            className="bg-amber-600 text-zinc-900 font-semibold py-3 rounded-xl hover:bg-amber-500 transition-all duration-200 shadow-lg shadow-amber-600/20"
          >
            Sou Cliente
          </button>

          <button
            onClick={() => navigate("/register/barber")}
            className="border border-zinc-700 text-zinc-200 py-3 rounded-xl hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200"
          >
            Sou Barbeiro
          </button>
        </section>

        {/* Login */}
        <p className="text-sm text-zinc-500">
          Já tem conta?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-amber-500 cursor-pointer hover:text-amber-400 hover:underline transition"
          >
            Entrar
          </span>
        </p>
      </section>
    </section>
  );
}
