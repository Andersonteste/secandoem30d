import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AccountState = {
  loading: boolean;
  userId: string | null;
  email: string | null;
  isAdmin: boolean;
  hasAccess: boolean;
  profile: any | null;
};

const initial: AccountState = {
  loading: true,
  userId: null,
  email: null,
  isAdmin: false,
  hasAccess: false,
  profile: null,
};

/**
 * Estado central do aluno: sessão, perfil, função administrativa e
 * autorização de acesso ativa (validada sempre no backend).
 */
export const useAccount = () => {
  const [state, setState] = useState<AccountState>(initial);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        setState({ ...initial, loading: false });
        return;
      }

      const [profileRes, rolesRes, entRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase
          .from("entitlements")
          .select("id, active, expires_at")
          .eq("user_id", user.id)
          .eq("active", true),
      ]);

      if (!mounted) return;

      const isAdmin = (rolesRes.data ?? []).some((r: any) => r.role === "admin");
      const hasAccess =
        isAdmin ||
        (entRes.data ?? []).some(
          (e: any) => !e.expires_at || new Date(e.expires_at) > new Date()
        );

      setState({
        loading: false,
        userId: user.id,
        email: user.email ?? null,
        isAdmin,
        hasAccess,
        profile: profileRes.data ?? null,
      });
    };

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setState({ ...initial, loading: false });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
};
