"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    const getStatus = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/health`
        );
        const data = await res.json();
        setStatus(data.status);
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };
    getStatus();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">MELL</h1>
      <p className="text-xl">
        Backend Status: <span className="font-bold">{status}</span>
      </p>
    </main>
  );
}
