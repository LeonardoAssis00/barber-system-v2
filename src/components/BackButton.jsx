import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition"
    >
      <ArrowLeft size={18} />
      Voltar
    </button>
  );
}
