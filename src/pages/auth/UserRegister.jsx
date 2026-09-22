import { useState } from "react";
import { supabase } from "../../lib/supabase";
import InputRegister from "../../components/InputRegister";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";

export default function UserRegister() {
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function normalizeSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\/[^/]+\/agendar\//, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  async function handleRegister(e) {
    e.preventDefault();

    if (!fullName || !slug || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);
    const finalSlug = normalizeSlug(slug);

    try {
      // 1️⃣ Buscar barbearia
      const { data: shop, error: shopError } = await supabase
        .from("barber_shops")
        .select("id")
        .eq("slug", finalSlug)
        .single();

      if (shopError || !shop) {
        throw new Error("Barbearia não encontrada");
      }

      // 2️⃣ Criar usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Usuário não retornado");

      const userId = authData.user.id;

      // 3️⃣ Criar profile (com RLS correta isso FUNCIONA)
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: fullName,
          role: "user",
          barber_shop_id: shop.id,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        console.error("Erro profile:", profileError);
        throw profileError;
      }
      // 4️⃣ Redirecionar direto para a barbearia
      navigate(`/agendar/${finalSlug}`);

      alert("Conta criada! Verifique seu e-mail para confirmar.");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      alert(err.message || "Erro ao criar conta");
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
        onSubmit={handleRegister}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4"
      >
        <h1 className="text-zinc-100 font-bold">Criar conta</h1>

        <InputRegister
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <InputRegister
          placeholder="Cole o link ou slug da barbearia"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

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
          disabled={loading}
          className="mt-4 bg-amber-600 hover:bg-amber-500 text-zinc-900 font-semibold py-3 rounded-lg disabled:opacity-60"
        >
          {loading ? "Criando..." : "Cadastrar"}
        </button>
      </form>
    </section>
  );
}
