"use client";

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    // This can happen if the component is rendered outside of AuthProvider
    // You might want to handle this case, e.g., by redirecting or showing a message
    return <div>Loading...</div>;
  }

  const { user, loading } = authContext;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>
    </div>
  );
}