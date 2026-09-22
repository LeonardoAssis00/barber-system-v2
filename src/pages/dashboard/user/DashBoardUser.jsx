import { useState, useContext } from "react";
import { LogOut } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

export default function DashboardUser() {
  const { signOut } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("home");

  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard do Cliente</h1>
          <p className="text-zinc-400">
            Agende seus horários de forma rápida e simples
          </p>
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition"
        >
          <LogOut size={18} />
          Sair
        </button>
      </header>

      {/* Abas */}
      <nav className="flex gap-6 border-b border-zinc-800 mb-8">
        {[
          { key: "home", label: "Visão Geral" },
          { key: "services", label: "Serviços" },
          { key: "agenda", label: "Agenda" },
          { key: "bookings", label: "Meus Agendamentos" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition ${
              activeTab === tab.key
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Conteúdo */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {activeTab === "home" && (
          <>
            <h2 className="text-lg font-medium mb-4">Bem-vindo 👋</h2>
            <p className="text-zinc-400 text-sm">
              Escolha um serviço e agende seu horário.
            </p>
          </>
        )}

        {activeTab === "services" && (
          <p className="text-zinc-400 text-sm">
            Em breve: lista de serviços disponíveis.
          </p>
        )}

        {activeTab === "agenda" && (
          <p className="text-zinc-400 text-sm">
            Em breve: horários disponíveis.
          </p>
        )}

        {activeTab === "bookings" && (
          <p className="text-zinc-400 text-sm">Em breve: seus agendamentos.</p>
        )}
      </section>
    </section>
  );
}
