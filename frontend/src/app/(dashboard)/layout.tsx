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

  useEffect(() => {
    if (authContext && !authContext.loading && !authContext.token) {
      router.push('/login');
    }
  }, [authContext, router]);

  if (!authContext || authContext.loading || !authContext.token) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}