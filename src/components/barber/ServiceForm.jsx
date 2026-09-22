import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ServiceForm({ barberShopId, onAdd }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!barberShopId) return alert("Erro: Barbearia não identificada.");

    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          name,
          price: parseFloat(price),
          duration: parseInt(duration),
          barber_shop_id: barberShopId,
        },
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      onAdd(data); // Atualiza a lista no Dashboard
      setName("");
      setPrice("");
      setDuration("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-zinc-800/30 p-4 rounded-lg border border-zinc-800"
    >
      <input
        type="text"
        placeholder="Nome do serviço (ex: Corte)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
        required
      />
      <input
        type="number"
        placeholder="Preço (R$)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
        required
      />
      <input
        type="number"
        placeholder="Duração (minutos)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-sm focus:outline-none focus:border-amber-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-lg p-2 transition disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Adicionar"}
      </button>
    </form>
  );
}
