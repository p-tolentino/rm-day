"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { changePasswordSchema } from "@/components/auth/change-password";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RecoverPasswordFormProps {
  token?: string;
  email?: string;
}

export default function RecoverPasswordForm({
  token,
  email,
}: RecoverPasswordFormProps) {
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const hasRendered = useRef(false);
  // Validate the token when the component mounts
  useEffect(() => {
    if (hasRendered.current) return; // Skip if already rendered
    hasRendered.current = true; // Mark as rendered

    if (token && email) {
      validateToken(token);
    } else {
      setIsTokenValid(false);
    }
  }, [token, email]);

  // Function to validate the token
  const validateToken = async (token: string) => {
    const toastId = toast.loading("Validating token...");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (error) {
        toast.error("Token validation failed. Please try again.", {
          id: toastId,
        });
        setIsTokenValid(false);
      } else {
        toast.info(
          "Token validated successfully! You may now reset your password.",
          {
            id: toastId,
          }
        );
        setIsTokenValid(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
      setIsTokenValid(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof changePasswordSchema>) => {
    if (!token || !email) {
      toast.error("Invalid or missing token/email.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        email,
        password: values.newPassword,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset successfully!");
        form.reset();
        router.push(`/login`);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //   if (isTokenValid === null) {
  //     return (
  //       <div className="flex justify-center items-center h-screen">
  //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
  //       </div>
  //     );
  //   }

  //   if (!isTokenValid) {
  //     return (
  //       <div className="rounded-lg text-red-500">
  //         Invalid or expired token. Please request a new{" "}
  //         <Link href="/login" className="underline">
  //           recovery link
  //         </Link>
  //         .
  //       </div>
  //     );
  //   }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <KeyRound className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your new password below.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={isNewPasswordVisible ? "text" : "password"}
                        {...field}
                        disabled={!isTokenValid}
                        className="pe-9"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => setIsNewPasswordVisible((prev) => !prev)}
                        aria-label={
                          isNewPasswordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={isNewPasswordVisible}
                        disabled={!isTokenValid}
                      >
                        {isNewPasswordVisible ? (
                          <Eye size={16} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <EyeOff
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={isConfirmPasswordVisible ? "text" : "password"}
                        {...field}
                        disabled={!isTokenValid}
                        className="pe-9"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() =>
                          setIsConfirmPasswordVisible((prev) => !prev)
                        }
                        aria-label={
                          isConfirmPasswordVisible
                            ? "Hide password"
                            : "Show password"
                        }
                        aria-pressed={isConfirmPasswordVisible}
                        disabled={!isTokenValid}
                      >
                        {isConfirmPasswordVisible ? (
                          <Eye size={16} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <EyeOff
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isTokenValid}
            >
              {isLoading
                ? "Resetting Password..."
                : !isTokenValid
                ? "Invalid Token"
                : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>

      <Link href="/" className="text-sm hover:underline">
        ← Return to Homepage
      </Link>
    </div>
  );
}
