"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const authSchema = z.object({
    username: z.string(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
  });

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit } = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    setIsLoading(true);
    const res = await login(data.username, data.password);
    if (res?.success) {
      toast.success(res.message);
      router.replace(`/wholesaler/profile`);
    } else {
      toast.error(res.message);
    }

    setIsLoading(false);
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your credentials below to login
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="username">Wholesaler ID</Label>
          <Input
            id="username"
            placeholder="Wholesaler ID"
            {...register("username")}
            disabled={isLoading}
            className="border-gray-400"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            {...register("password")}
            disabled={isLoading}
            className="border-gray-400"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging In..." : "Login"}
        </Button>
      </div>
    </form>
  );
}
