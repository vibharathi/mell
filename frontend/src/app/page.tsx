"use client";

import { Button } from "@/components/ui/button";
import Icon from "@/components/shared/Icon";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Connecting Communities Through{" "}
                <span className="text-primary">Medical Equipment</span> Sharing
              </h1>
              <p className="mx-auto text-gray-500 md:text-xl dark:text-gray-400">
                A platform for community members to borrow and manage medical equipment.
              </p>
              <div className="space-x-4">
                <Link href="/equipment">
                  <Button>Browse Equipment</Button>
                </Link>
                <Button variant="secondary">Learn More</Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Icon name="users" className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Community Driven</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Built by the community, for the community.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Icon name="shield" className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Safe & Secure</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All transactions are secure and your data is safe.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <Icon name="clock" className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Available 24/7</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Access the platform anytime, anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
