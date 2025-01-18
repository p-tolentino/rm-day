import { createClient } from "@/utils/supabase/server";
import RecoverPasswordForm from "./_components/recover-page";
import { redirect } from "next/navigation";

export default async function RecoverPage({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const { token, email } = searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/wholesaler/profile");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <RecoverPasswordForm token={token} email={email} />
    </div>
  );
}
