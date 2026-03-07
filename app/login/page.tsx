import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

import Image from "next/image";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/wholesaler/profile");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left — form panel */}
      <div className="flex flex-col p-6 md:p-10 bg-background">
        <div className="flex justify-center md:justify-start">
          <a href="#" className="flex items-center gap-2">
            <Image
              src="/images/RM-wide.jpg"
              alt="Team RM"
              height={80}
              width={120}
              className="object-contain"
            />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-1 w-10 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Team RM Portal
              </span>
            </div>
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} Team RM. All rights reserved.
        </p>
      </div>

      {/* Right — hero image */}
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-primary/25 z-10" />
        <Image
          fill
          src="/images/RM-cover.jpeg"
          alt="RM Company Photo"
          className="object-cover"
          priority
        />
        <div className="absolute bottom-10 left-10 z-20 text-white">
          <p className="text-3xl font-bold drop-shadow-lg">RM Day</p>
          <p className="text-sm text-white/80 mt-1 drop-shadow">
            Track your income. Rise to the top.
          </p>
        </div>
      </div>
    </div>
  );
}
