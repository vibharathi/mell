"use client";

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (!authContext) {
    // This can happen if the component is rendered outside of AuthProvider
    // You might want to handle this case, e.g., by redirecting or showing a message
    return <div>Loading...</div>;
  }

  const { token, loading } = authContext;

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [loading, token, router]);

  if (loading || !token) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}