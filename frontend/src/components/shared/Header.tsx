import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Link href="/" className="text-2xl font-bold">
        MELL
      </Link>
      <nav>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </nav>
    </header>
  );
}