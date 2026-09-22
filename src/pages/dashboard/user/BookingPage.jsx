import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { AuthContext } from "../../../context/AuthContext"; // Importado para verificar login

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Verifica se está logado

  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]); // Agora vamos usar!
  const [loading, setLoading] = useState(true);

  // Estados para a escolha do cliente
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    async function loadShopData() {
      const { data: shopData, error: shopError } = await supabase
        .from("barber_shops")
        .select("*")
        .eq("slug", slug)
        .single();

      if (shopError || !shopData) {
        setLoading(false);
        return;
      }

      setShop(shopData);

      const [servicesRes, slotsRes] = await Promise.all([
        supabase.from("services").select("*").eq("barber_shop_id", shopData.id),
        supabase
          .from("barber_slots")
          .select("*")
          .eq("barber_shop_id", shopData.id),
      ]);

      setServices(servicesRes.data || []);
      setSlots(slotsRes.data || []); // Slots carregados
      setLoading(false);
    }

    loadShopData();
  }, [slug]);

  const handleConfirmBooking = () => {
    if (!user) {
      // Se não estiver logado, manda para o registro com a slug
      navigate(`/register/user/${slug}`);
      return;
    }
    // Lógica para salvar o agendamento no Supabase (veremos a seguir)
    alert(
      `Agendando ${selectedService.name} para as ${selectedSlot.start_time}`
    );
  };

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-amber-500">
        Carregando barbearia...
      </div>
    );
  if (!shop)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-100">
        Barbearia não encontrada.
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold text-amber-500">{shop.name}</h1>
          <p className="text-zinc-400 mt-2">Escolha o serviço e o horário</p>
        </header>

        {/* 1. Seleção de Serviços */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
            1. Escolha o serviço
          </h2>
          <div className="grid gap-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service)}
                className={`flex justify-between p-4 rounded-xl border transition text-left ${
                  selectedService?.id === service.id
                    ? "bg-amber-500/10 border-amber-500 text-amber-500"
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                }`}
              >
                <div>
                  <p className="font-bold">{service.name}</p>
                  <p className="text-sm opacity-70">{service.duration} min</p>
                </div>
                <p className="font-bold">
                  R$ {Number(service.price).toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* 2. Seleção de Horários (USANDO OS SLOTS) */}
        {selectedService && (
          <section className="mb-8 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-semibold mb-4 border-b border-zinc-800 pb-2">
              2. Escolha o horário
            </h2>
            <div className="flex flex-wrap gap-2">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-full border text-sm transition ${
                      selectedSlot?.id === slot.id
                        ? "bg-amber-500 border-amber-500 text-zinc-950 font-bold"
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    {slot.start_time.slice(0, 5)}
                  </button>
                ))
              ) : (
                <p className="text-zinc-500 text-sm">
                  Nenhum horário disponível para esta barbearia.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Botão de Finalização */}
        {selectedService && selectedSlot && (
          <button
            onClick={handleConfirmBooking}
            className="w-full bg-amber-500 text-zinc-950 font-bold py-4 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/10"
          >
            {user ? "Confirmar Agendamento" : "Cadastrar para Agendar"}
          </button>
        )}
      </div>
    </div>
  );
}
