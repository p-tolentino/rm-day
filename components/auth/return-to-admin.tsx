"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MoveLeft } from "lucide-react";

export const ImpersonationButton = () => {
  const router = useRouter();

  const cancelImpersonation = async () => {
    const response = await fetch("/api/impersonate/cancel", {
      method: "POST",
    });

    if (response.ok) {
      router.push("/wholesaler/profile");
      router.refresh();
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 animate-fade-in transition-all">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={cancelImpersonation}
            variant="destructive"
            className="flex items-center rounded-full"
          >
            <MoveLeft className="w-24 h-24" />
            <span>Return to Admin</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Return to Admin</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
