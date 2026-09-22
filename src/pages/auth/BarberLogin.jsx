import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import InputRegister from "../../components/InputRegister";
import BackButton from "../../components/BackButton";

export default function BarberLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    if (loading) return; // Evita cliques duplos

    setLoading(true);

    try {
      // 1. Autenticação básica
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      if (authError) throw authError;

      // 2. Buscar Profile após login bem-sucedido
      // O RLS precisa permitir SELECT na tabela profiles para auth.uid() = id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        // Se der erro aqui, pode ser que o profile não foi criado ou RLS bloqueou
        console.error("Erro ao buscar profile:", profileError);
        throw new Error(
          "Não foi possível carregar seu perfil. Verifique sua conexão."
        );
      }

      // 3. Verificar permissão
      if (profile.role !== "barber") {
        await supabase.auth.signOut();
        throw new Error(
          "Acesso negado: Esta conta não possui perfil de barbeiro."
        );
      }

      // 4. Buscar barbearia
      const { data: shop, error: shopError } = await supabase
        .from("barber_shops")
        .select("trial_ends_at, is_paid, is_active")
        .eq("owner_id", data.user.id)
        .single();

      if (shopError || !shop) {
        throw new Error("Barbearia não encontrada.");
      }

      // 5. Verificar se a conta está ativa (bloqueio manual)
      if (!shop.is_active) {
        navigate("/payment");
        return;
      }

      // 6. Verificar trial
      const now = new Date();
      const trialEndsAt = new Date(shop.trial_ends_at);
      const trialExpired = now > trialEndsAt;

      if (trialExpired && !shop.is_paid) {
        navigate("/payment");
        return;
      }

      // 8. Sucesso total
      navigate("/dashboard/barber");
    } catch (error) {
      console.error("Erro no login:", error.message);
      alert(error.message);
    } finally {
      // O finally garante que o botão pare de carregar independente do resultado
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
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-xl font-bold text-zinc-100">Login Barbeiro</h1>
          <p className="text-sm text-zinc-500">
            Acesse seu painel administrativo
          </p>
        </div>

        <InputRegister
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputRegister
          type="password"
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-zinc-950"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Entrando...
            </span>
          ) : (
            "Acessar Painel"
          )}
        </button>
      </form>
    </section>
  );
}
