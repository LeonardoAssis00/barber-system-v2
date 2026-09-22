import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import InputRegister from "../../components/InputRegister";
import BackButton from "../../components/BackButton";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Login
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Usuário não autenticado");
      }

      // 🔐 VERIFICAÇÃO DE EMAIL CONFIRMADO
      if (!authData.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error(
          "Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
        );
      }

      const userId = authData.user.id;

      // 2️⃣ Buscar profile (criado pela trigger)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, barber_shop_id")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        throw new Error("Perfil não encontrado");
      }

      // 3️⃣ Validações de regra de negócio
      if (profile.role !== "user") {
        throw new Error("Este login é apenas para usuários");
      }

      if (!profile.barber_shop_id) {
        throw new Error("Usuário não está vinculado a nenhuma barbearia");
      }

      // 4️⃣ Buscar slug da barbearia
      const { data: shop, error: shopError } = await supabase
        .from("barber_shops")
        .select("slug")
        .eq("id", profile.barber_shop_id)
        .single();

      if (shopError || !shop) {
        throw new Error("Barbearia não encontrada");
      }

      // 5️⃣ Redirecionar
      navigate(`/agendar/${shop.slug}`);
    } catch (err) {
      console.error("Erro no login:", err);
      alert(err.message || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="absolute top-6 left-6">
        <BackButton />
      </div>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4 shadow-xl"
      >
        <h1 className="text-xl font-semibold text-zinc-100 p-3">
          Login do Usuário
        </h1>

        <InputRegister
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputRegister
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </section>
  );
}
