import { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega o perfil de forma isolada
  async function fetchProfileData(userId) {
    if (!userId) return null;
    const { data } = await supabase
      .from("profiles")
      .select(`*, barber_shops (*)`)
      .eq("id", userId)
      .maybeSingle();
    return data;
  }

  useEffect(() => {
    let isMounted = true;

    // Função de inicialização
    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          const p = await fetchProfileData(session.user.id);
          if (isMounted) setProfile(p);
        }
      } catch (err) {
        console.error("Erro na sessão inicial:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    getInitialSession();

    // Listener de Auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Evento detectado:", event);

      if (session?.user) {
        setUser(session.user);
        // Buscamos o perfil em segundo plano para não travar o estado global
        fetchProfileData(session.user.id).then((p) => {
          if (isMounted) setProfile(p);
        });
      } else {
        setUser(null);
        setProfile(null);
      }

      // Força a saída do loading em qualquer evento
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),
      signOut: () => supabase.auth.signOut(),
    }),
    [user, profile, loading]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-amber-500"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
