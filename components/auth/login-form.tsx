"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { login, recoverPassword } from "@/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const authSchema = z.object({
    username: z.string(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long" }),
    email: z.string().email("Please enter a valid email address").optional(),
  });

  const router = useRouter();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false);

  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);

  const toggleVisibility = () => setIsVisible((prevState) => !prevState);

  const { register, handleSubmit, getValues, reset } = useForm<
    z.infer<typeof authSchema>
  >({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleRecoverPassword = async (recoverEmail: string | undefined) => {
    setIsRecoveryLoading(true);

    try {
      if (!recoverEmail) {
        toast.warning("Please enter a valid email.");
        return;
      }

      const result = await recoverPassword(recoverEmail);
      if (result.success) {
        toast.info(result.message);
        reset();
        setIsRecoverDialogOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while recovering your password.");
    } finally {
      setIsRecoveryLoading(false);
    }
  };

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
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <div
              className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-gray-400 cursor-pointer"
              onClick={() => setIsRecoverDialogOpen(true)}
            >
              Forgot your password?
            </div>
          </div>
          <div className="relative">
            <Input
              id="password"
              className="pe-9"
              placeholder="Password"
              {...register("password")}
              type={isVisible ? "text" : "password"}
              disabled={isLoading}
            />
            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              aria-controls="password"
            >
              {isVisible ? (
                <Eye size={16} strokeWidth={2} aria-hidden="true" />
              ) : (
                <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          </div>
          {/* <Input
            
            type="password"
            placeholder="••••••"
            {...register("password")}
            
            className="border-gray-400"
          /> */}
        </div>
        <Button
          onClick={() => onSubmit(getValues())}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Logging In..." : "Login"}
        </Button>
      </div>

      <Dialog open={isRecoverDialogOpen} onOpenChange={setIsRecoverDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recover Password</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <p>You will receive an email to recover your password</p>
            <Input
              placeholder="Email"
              type="email"
              className="w-full"
              {...register("email")}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => handleRecoverPassword(getValues("email"))}
                className="flex items-center"
                disabled={isRecoveryLoading}
              >
                {isRecoveryLoading ? (
                  "Sending recovery email..."
                ) : (
                  <>
                    <Send />
                    <span>Send Email</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
