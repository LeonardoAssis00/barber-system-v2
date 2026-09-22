import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import MyBookings from "../agendar/MyBookings";

const weekLabels = {
  monday: "Seg",
  tuesday: "Ter",
  wednesday: "Qua",
  thursday: "Qui",
  friday: "Sex",
  saturday: "Sáb",
  sunday: "Dom",
};

const weekOrder = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

// MAPA CORRETO DOS DIAS DA SEMANA
const weekDayMap = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// FORMATAR DATA PARA BR (DD/MM/YYYY)
function formatDateBR(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useContext(AuthContext);

  const [shop, setShop] = useState(null);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [confirming, setConfirming] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("booking");

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function loadData() {
      const { data: shopData } = await supabase
        .from("barber_shops")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!shopData) {
        setLoading(false);
        return;
      }

      setShop(shopData);

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("barber_shop_id", shopData.id)
        .order("created_at");

      const { data: slotsData } = await supabase
        .from("barber_slots")
        .select("*")
        .eq("barber_shop_id", shopData.id)
        .order("start_time");

      setServices(servicesData || []);
      setSlots(slotsData || []);
      setLoading(false);
    }

    loadData();
  }, [slug]);

  /* ================= LOAD BOOKINGS ================= */
  async function loadBookings(date) {
    if (!shop?.id) return;

    const { data } = await supabase
      .from("bookings")
      .select("time")
      .eq("barber_shop_id", shop.id)
      .eq("date", date)
      .neq("status", "canceled");

    setBookings(data || []);
  }

  /* ================= SELECT DAY (CORRETO, SEM UTC) ================= */
  function handleSelectDay(day) {
    setSelectedDay(day);
    setSelectedTime(null);
    setConfirming(false);

    const today = new Date();
    const todayWeekDay = today.getDay();
    const targetWeekDay = weekDayMap[day];

    let diff = targetWeekDay - todayWeekDay;
    if (diff < 0) diff += 7;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    // ✅ SEM toISOString (bug de UTC removido)
    const formattedDate = targetDate.toLocaleDateString("en-CA");

    setSelectedDate(formattedDate);
    loadBookings(formattedDate);
  }

  /* ================= SELECT TIME ================= */
  function handleSelectTime(time) {
    if (!user) {
      navigate(`/login/user?redirect=/agendar/${slug}`);
      return;
    }

    setSelectedTime(time);
    setConfirming(true);
  }

  async function getClientName(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    return data?.full_name || null;
  }

  function formatName(name) {
    if (!name) return null;
    return name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /* ================= CONFIRM BOOKING ================= */
  async function handleConfirmBooking() {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert("Selecione serviço, dia e horário");
      return;
    }

    setLoadingConfirm(true);
    const rawClientName = await getClientName(user.id);
    const clientName = formatName(rawClientName);

    const { error } = await supabase.from("bookings").insert({
      barber_shop_id: shop.id,
      service_id: selectedService.id,
      client_id: user.id,
      date: selectedDate,
      time: selectedTime,
      status: "confirmed",
      client_name: clientName,
    });

    setLoadingConfirm(false);

    if (error) {
      alert("Erro ao confirmar agendamento");
      return;
    }

    alert("Agendamento confirmado com sucesso!");
    setSelectedTime(null);
    setConfirming(false);
    loadBookings(selectedDate);
  }

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Carregando...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        Barbearia não encontrada
      </div>
    );
  }

  const availableDays = weekOrder.filter((day) =>
    slots.some((s) => s.day_of_week === day)
  );

  const daySlots = slots.filter((s) => s.day_of_week === selectedDay);
  const bookedTimes = bookings.map((b) => b.time);

  return (
    <section className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="px-6 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {formatName(profile?.full_name) || "Cliente"}
          </h1>
          <p className="text-zinc-400">
            Escolha um serviço e um horário disponível
          </p>
        </div>

        {user && (
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-zinc-400 hover:text-red-400"
          >
            <LogOut size={18} />
            Sair
          </button>
        )}
      </header>

      <nav className="px-6 flex gap-6 border-b border-zinc-800 mb-8">
        <button
          onClick={() => setActiveTab("booking")}
          className={`pb-3 text-sm font-medium ${
            activeTab === "booking"
              ? "text-amber-500 border-b-2 border-amber-500"
              : "text-zinc-400"
          }`}
        >
          Agendar
        </button>

        {user && (
          <button
            onClick={() => setActiveTab("myBookings")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "myBookings"
                ? "text-amber-500 border-b-2 border-amber-500"
                : "text-zinc-400"
            }`}
          >
            Meus agendamentos
          </button>
        )}
      </nav>

      <main className="max-w-xl mx-auto px-4 pb-10">
        {activeTab === "booking" && (
          <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            {/* Serviços */}
            <div className="space-y-3">
              <h2 className="text-lg font-medium">Serviços</h2>

              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedDay(null);
                    setSelectedTime(null);
                    setConfirming(false);
                  }}
                  className={`w-full p-4 rounded-lg border ${
                    selectedService?.id === service.id
                      ? "border-amber-500 bg-zinc-800"
                      : "border-zinc-800 bg-zinc-950"
                  }`}
                >
                  <div className="flex justify-between">
                    <span>{service.name}</span>
                    <span className="text-amber-500">R$ {service.price}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Dias */}
            {selectedService && (
              <div className="space-y-2">
                <h2 className="text-lg font-medium">Dias disponíveis</h2>
                <div className="flex gap-2">
                  {availableDays.map((day) => (
                    <button
                      key={day}
                      onClick={() => handleSelectDay(day)}
                      className={`px-4 py-2 rounded-lg ${
                        selectedDay === day
                          ? "bg-amber-500 text-black"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {weekLabels[day]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Horários */}
            {selectedDay && (
              <div className="space-y-2">
                <h2 className="text-lg font-medium">Horários</h2>
                <div className="grid grid-cols-3 gap-3">
                  {daySlots.map((slot) => {
                    const isBooked = bookedTimes.includes(slot.start_time);

                    return (
                      <button
                        key={slot.id}
                        disabled={isBooked}
                        onClick={() => handleSelectTime(slot.start_time)}
                        className={`py-2 rounded-lg ${
                          isBooked
                            ? "bg-zinc-800 text-zinc-500"
                            : "bg-amber-600 text-black"
                        }`}
                      >
                        {slot.start_time.slice(0, 5)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CONFIRMAÇÃO */}
            {confirming && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                <p className="text-sm text-zinc-300">Confirmar agendamento?</p>

                <p className="text-xs text-zinc-400">
                  Serviço: {selectedService.name} <br />
                  Data: {formatDateBR(selectedDate)} <br />
                  Horário: {selectedTime}
                </p>

                <button
                  onClick={handleConfirmBooking}
                  disabled={loadingConfirm}
                  className="w-full bg-amber-500 text-black py-2 rounded-md font-medium hover:bg-amber-400 transition"
                >
                  {loadingConfirm ? "Confirmando..." : "Confirmar"}
                </button>
              </div>
            )}
          </section>
        )}

        {activeTab === "myBookings" && <MyBookings />}
      </main>
    </section>
  );
}
