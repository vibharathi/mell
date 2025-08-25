"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export default function Header() {
  const authContext = useContext(AuthContext);

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        MELL
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