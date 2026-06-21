import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useGetProfile, useGetCompany } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  company: any | null;
  loading: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
  companyId: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  company: null,
  loading: true,
  signIn: () => {},
  signOut: async () => {},
  companyId: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile } = useGetProfile(user?.id || '', {
    query: { enabled: !!user?.id, queryKey: ['getProfile', user?.id] }
  });

  const companyId = profile?.company_id || null;

  const { data: company } = useGetCompany(companyId || '', {
    query: { enabled: !!companyId, queryKey: ['getCompany', companyId] }
  });

  const signIn = () => {
    // Will be handled by the login page component directly with Supabase
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: profile || null,
        company: company || null,
        loading,
        signIn,
        signOut,
        companyId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
