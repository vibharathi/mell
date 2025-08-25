"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export default function Header() {
  const authContext = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="flex items-center gap-2">
        <img src="/mell_logo.png" alt="MELL Logo" className="w-10 h-10" />
        <div>
          <div className="text-2xl font-bold">MELL</div>
          <div className="text-sm text-gray-500">
            Medical Equipment Lending Library
          </div>
        </div>
      </Link>
      <nav>
        {authContext?.user ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {authContext.user.name}</span>
            <Button onClick={authContext.logout}>Logout</Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}