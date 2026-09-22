import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AgendaForm({ barberShopId, onAdd }) {
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!day || !time || !barberShopId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("barber_slots")
        .insert([
          {
            barber_shop_id: barberShopId,
            day_of_week: day,
            start_time: time,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          alert("Este horário já existe para este dia!");
        } else {
          throw error;
        }
      } else {
        onAdd(data); // Notifica o Dashboard para atualizar a lista
        setTime("");
      }
    } catch (error) {
      alert("Erro ao adicionar horário: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col md:flex-row gap-4 mb-6"
    >
      <select
        value={day}
        onChange={(e) => setDay(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:border-amber-500 outline-none"
        required
      >
        <option value="">Selecione o dia</option>
        <option value="monday">Segunda</option>
        <option value="tuesday">Terça</option>
        <option value="wednesday">Quarta</option>
        <option value="thursday">Quinta</option>
        <option value="friday">Sexta</option>
        <option value="saturday">Sábado</option>
        <option value="sunday">Domingo</option>
      </select>

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:border-amber-500 outline-none"
        required
      />

      <button
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-zinc-950 font-bold px-6 rounded-lg transition"
      >
        {loading ? "Salvando..." : "Adicionar horário"}
      </button>
    </form>
  );
}
