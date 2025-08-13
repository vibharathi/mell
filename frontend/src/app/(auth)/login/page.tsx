"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/shared/Header";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function LoginPage() {
  const authContext = useContext(AuthContext);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (authContext) {
        const loginData = new URLSearchParams();
        loginData.append("username", values.email);
        loginData.append("password", values.password);
        const { access_token } = await login(loginData);
        authContext.login(access_token);
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.detail) {
        form.setError("email", {
          type: "manual",
          message: error.response.data.detail,
        });
      } else {
        console.error("Login failed", error);
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/register">
                <Button variant="secondary">Get Started</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}