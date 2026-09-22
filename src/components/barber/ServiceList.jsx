import { Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ServiceList({ services, onDelete }) {
  if (services.length === 0) {
    return (
      <p className="text-zinc-400 text-sm">Nenhum serviço cadastrado ainda.</p>
    );
  }

  async function handleDelete(service) {
    const confirmed = window.confirm(`Excluir "${service.name}"?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id);

    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      onDelete(service.id); // Remove da tela
    }
  }

  return (
    <ul className="space-y-3">
      {services.map((service) => (
        <li
          key={service.id}
          className="flex justify-between items-center bg-zinc-800 border border-zinc-700 rounded-lg p-4"
        >
          <div>
            <p className="font-medium text-zinc-100">{service.name}</p>
            <p className="text-sm text-zinc-400">
              R$ {Number(service.price).toFixed(2)} • {service.duration} min
            </p>
          </div>
          <button
            onClick={() => handleDelete(service)}
            className="text-zinc-500 hover:text-red-400 transition"
          >
            <Trash2 size={18} />
          </button>
        </li>
      ))}
    </ul>
  );
}
