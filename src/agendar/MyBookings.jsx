import { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";

function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

function formatTime(time) {
  if (!time) return "";
  return time.slice(0, 5);
}

export default function MyBookings() {
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  /* ================= LOAD BOOKINGS ================= */
  useEffect(() => {
    if (!user) return;

    async function loadBookings() {
      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          id,
          date,
          time,
          status,
          services ( name, price ),
          barber_shops ( name )
        `
        )
        .eq("client_id", user.id)
        .order("date", { ascending: true });

      if (error) {
        console.error("Erro ao buscar agendamentos:", error);
      }

      setBookings(data || []);
      setLoading(false);
    }

    loadBookings();
  }, [user]);

  /* ================= CANCEL BOOKING ================= */
  async function handleCancel(bookingId) {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      return;
    }

    setCancelingId(bookingId);

    const { data, error } = await supabase
      .from("bookings")
      .update({ status: "canceled" })
      .eq("id", bookingId)
      .eq("client_id", user.id)
      .select(); // 🔥 força retorno das linhas afetadas

    if (error) {
      console.error("Erro ao cancelar:", error);
      alert("Erro ao cancelar agendamento");
      setCancelingId(null);
      return;
    }

    if (!data || data.length === 0) {
      alert("Cancelamento não permitido (RLS)");
      setCancelingId(null);
      return;
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "canceled" } : b))
    );

    setCancelingId(null);
  }

  /* ================= UI ================= */
  if (!user) {
    return (
      <div className="text-sm text-zinc-400">
        Faça login para visualizar seus agendamentos.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-sm text-zinc-400">Carregando agendamentos...</div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="border border-zinc-800 rounded-lg p-4 text-sm text-zinc-400">
        Você ainda não possui agendamentos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border border-zinc-800 rounded-xl p-4 bg-zinc-900 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-zinc-100">
              {booking.barber_shops?.name}
            </p>

            <span
              className={`px-3 py-1 text-xs rounded-full font-medium ${
                booking.status === "confirmed"
                  ? "bg-green-600/20 text-green-400"
                  : "bg-red-600/20 text-red-400"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="text-sm text-zinc-400">
            <p>Serviço: {booking.services?.name}</p>
            <p>
              Data: {formatDate(booking.date)} às {formatTime(booking.time)}
            </p>
          </div>

          {booking.status === "confirmed" && (
            <button
              onClick={() => handleCancel(booking.id)}
              disabled={cancelingId === booking.id}
              className="mt-2 self-start px-4 py-2 text-sm rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 transition disabled:opacity-50"
            >
              {cancelingId === booking.id
                ? "Cancelando..."
                : "Cancelar agendamento"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
