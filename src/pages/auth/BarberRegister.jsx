import { useState } from "react";
import { supabase } from "../../lib/supabase";
import InputRegister from "../../components/InputRegister";
import BackButton from "../../components/BackButton";
import { useNavigate } from "react-router-dom";

export default function BarberRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Função para limpar o slug enquanto o usuário digita
  const formatSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Substitui espaços por hifen
      .replace(/[^\w-]+/g, ""); // Remove caracteres especiais
  };

  async function handleRegister(e) {
    e.preventDefault();

    const finalSlug = formatSlug(slug);

    if (!name.trim() || !shopName.trim() || !finalSlug) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verifica se a slug já existe
      const { data: existingShop, error: checkError } = await supabase
        .from("barber_shops")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingShop) {
        alert("Este link já está em uso. Escolha outro.");
        setLoading(false);
        return;
      }

      // 2. Cria usuário no Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim(),
            role: "barber",
          },
        },
      });

      if (authError) throw authError;

      const userId = data.user.id;

      // 3. Cria a barbearia

      const trialStartedAt = new Date();
      const trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

      const { data: shop, error: shopError } = await supabase
        .from("barber_shops")
        .insert({
          name: shopName.trim(),
          slug: finalSlug,
          owner_id: userId,
          trial_started_at: trialStartedAt,
          trial_ends_at: trialEndsAt,
          is_paid: false,
          is_active: true,
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // 4. Atualiza o profile com a barbearia
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          barber_shop_id: shop.id,
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // 5. Sucesso
      alert("Barbearia criada com sucesso! Verifique seu e-mail.");
      navigate("/login");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao criar barbearia. Tente novamente.");
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
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col gap-4 shadow-xl"
      >
        <div className="mb-2">
          <h1 className="text-zinc-100 text-xl font-bold">Criar conta</h1>
          <p className="text-zinc-500 text-sm">Painel do Barbeiro</p>
        </div>

        <InputRegister
          type="text"
          placeholder="Seu Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <InputRegister
          type="text"
          placeholder="Nome da Barbearia"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs text-zinc-500 ml-2">
            Seu link: barbearia.com/{formatSlug(slug) || "..."}
          </label>
          <InputRegister
            type="text"
            placeholder="Ex: barbearia-do-bairro"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>

        <hr className="border-zinc-800 my-2" />

        <InputRegister
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputRegister
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-amber-600 hover:bg-amber-500 text-zinc-900 font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Processando..." : "Cadastrar Barbearia"}
        </button>
      </form>
    </section>
  );
}
