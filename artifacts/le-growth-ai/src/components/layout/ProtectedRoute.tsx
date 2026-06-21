import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/spinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Spinner className="text-primary size-10" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};
