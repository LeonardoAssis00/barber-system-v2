function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}

function formatTime(time) {
  if (!time) return "--:--";
  return time.slice(0, 5);
}

export default function BookingList({ bookings, onCancel }) {
  if (!bookings || bookings.length === 0) {
    return (
      <p className="text-zinc-400 text-sm">Nenhum agendamento encontrado.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((booking) => {
        const clientName = booking.client_name || "Cliente não identificado";
        const serviceName = booking.services?.name || "Serviço não informado";
        const servicePrice = booking.services?.price ?? 0;

        return (
          <li
            key={booking.id}
            className="flex justify-between items-center bg-zinc-800 border border-zinc-700 rounded-lg p-4"
          >
            <div>
              <p className="font-medium text-zinc-100">{clientName}</p>

              <p className="text-sm text-zinc-400">
                {serviceName} • {formatDate(booking.date)} às{" "}
                {formatTime(booking.time)}
              </p>

              {booking.status === "canceled" && (
                <p className="text-xs text-red-400 mt-1">
                  Agendamento cancelado
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`font-medium ${
                  booking.status === "canceled"
                    ? "text-zinc-500 line-through"
                    : "text-amber-500"
                }`}
              >
                R$ {servicePrice.toFixed(2)}
              </span>

              {booking.status !== "canceled" && (
                <button
                  onClick={() => onCancel(booking.id)} // ✅ CORRETO
                  className="text-xs px-3 py-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
