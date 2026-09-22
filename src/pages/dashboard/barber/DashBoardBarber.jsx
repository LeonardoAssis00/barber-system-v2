import { useState, useContext, useEffect } from "react";
import { LogOut, Copy, ExternalLink } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

import ServiceForm from "../../../components/barber/ServiceForm";
import ServiceList from "../../../components/barber/ServiceList";
import AgendaForm from "../../../components/barber/AgendaForm";
import AgendaList from "../../../components/barber/AgendaList";
import BookingList from "../../../components/barber/BookingList";

export default function DashboardBarber() {
  const { signOut, profile } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("home");

  const [services, setServices] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Barbearia do barbeiro logado
  const shop = profile?.barber_shops?.[0];

  // =========================
  // BUSCAR DADOS DO SUPABASE
  // =========================
  useEffect(() => {
    async function fetchData() {
      if (!shop?.id) return;

      try {
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("barber_shop_id", shop.id)
          .order("created_at", { ascending: true });

        setServices(servicesData || []);

        const { data: agendaData } = await supabase
          .from("barber_slots")
          .select("*")
          .eq("barber_shop_id", shop.id)
          .order("start_time", { ascending: true });

        setAgenda(agendaData || []);

        const { data: bookingsData, error } = await supabase
          .from("bookings")
          .select(
            `
            id,
            date,
            time,
            status,
            client_name,
            services:service_id (
              name,
              price
            )
          `
          )
          .eq("barber_shop_id", shop.id)
          .order("date", { ascending: true })
          .order("time", { ascending: true });

        if (!error) {
          setBookings(bookingsData || []);
        }
      } catch (error) {
        console.error("Erro geral:", error.message);
      } finally {
        setLoadingBookings(false);
      }
    }

    fetchData();
  }, [shop?.id]);

  // =========================
  // HANDLERS
  // =========================
  function handleAddService(newService) {
    setServices((prev) => [...prev, newService]);
  }

  function handleDeleteService(id) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddSlot(newSlot) {
    setAgenda((prev) => [...prev, newSlot]);
  }

  function handleDeleteSlot(id) {
    setAgenda((prev) => prev.filter((a) => a.id !== id));
  }

  // =========================
  // CANCELAR AGENDAMENTO (BARBEIRO)
  // =========================
  async function handleCancelBooking(bookingId) {
    const confirmCancel = window.confirm(
      "Tem certeza que deseja cancelar este agendamento?"
    );

    if (!confirmCancel) return;

    const { error } = await supabase
      .from("bookings")
      .update({ status: "canceled" })
      .eq("id", bookingId)
      .eq("barber_shop_id", shop.id);

    if (error) {
      console.error("Erro ao cancelar agendamento:", error);
      return;
    }

    // Atualiza estado local
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "canceled" } : b))
    );
  }

  // =========================
  // LINK PÚBLICO
  // =========================
  const publicUrl = shop
    ? `${window.location.origin}/agendar/${shop.slug}`
    : "";

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl);
    alert("Link da barbearia copiado!");
  }

  // =========================
  // RENDER
  // =========================
  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            {shop ? shop.name : "Dashboard da Barbearia"}
          </h1>
          <p className="text-zinc-400">
            Olá, {shop ? shop.name : "Barbeiro"}! Gerencie seu negócio.
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

      <nav className="flex gap-6 border-b border-zinc-800 mb-8 overflow-x-auto">
        {[
          { key: "home", label: "Visão Geral" },
          { key: "services", label: "Serviços" },
          { key: "agenda", label: "Agenda" },
          { key: "bookings", label: "Agendamentos" },
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

      <main className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        {activeTab === "home" && shop && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Link público da barbearia</h2>

            <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg p-3">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-zinc-300 outline-none"
              />

              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-zinc-700 rounded-md"
              >
                <Copy size={18} />
              </button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-zinc-700 rounded-md"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <>
            <ServiceForm barberShopId={shop?.id} onAdd={handleAddService} />
            <ServiceList services={services} onDelete={handleDeleteService} />
          </>
        )}

        {activeTab === "agenda" && (
          <>
            <AgendaForm barberShopId={shop?.id} onAdd={handleAddSlot} />
            <AgendaList agenda={agenda} onDelete={handleDeleteSlot} />
          </>
        )}

        {activeTab === "bookings" && (
          <>
            {loadingBookings ? (
              <p className="text-zinc-500 text-sm">
                Carregando agendamentos...
              </p>
            ) : (
              <BookingList bookings={bookings} onCancel={handleCancelBooking} />
            )}
          </>
        )}
      </main>
    </section>
  );
}
