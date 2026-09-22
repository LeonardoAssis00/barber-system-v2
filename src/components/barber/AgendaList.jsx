import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

const dayLabels = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function AgendaList({ agenda, onDelete }) {
  if (!agenda || agenda.length === 0) {
    return <p className="text-zinc-500 text-sm">Nenhum horário configurado.</p>;
  }

  // Agrupa os horários por dia para exibição
  const grouped = agenda.reduce((acc, curr) => {
    if (!acc[curr.day_of_week]) acc[curr.day_of_week] = [];
    acc[curr.day_of_week].push(curr);
    return acc;
  }, {});

  async function handleDelete(id) {
    if (!window.confirm("Remover este horário?")) return;

    const { error } = await supabase.from("barber_slots").delete().eq("id", id);
    if (error) alert(error.message);
    else onDelete(id);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.keys(dayLabels).map((dayKey) => {
        const slots = grouped[dayKey] || [];
        if (slots.length === 0) return null;

        return (
          <div
            key={dayKey}
            className="bg-zinc-800/50 border border-zinc-800 rounded-lg p-4"
          >
            <h3 className="text-amber-500 font-medium mb-3 border-b border-zinc-700 pb-2">
              {dayLabels[dayKey]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {slots
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="group flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full"
                  >
                    <span className="text-xs text-zinc-200">
                      {slot.start_time.slice(0, 5)}
                    </span>
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="text-zinc-600 hover:text-red-500 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
