"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { updateUserRole } from "@/actions/wholesaler";

interface RoleToggleProps {
  userId: string;
  initialRole: string;
}

export function RoleToggle({ userId, initialRole }: RoleToggleProps) {
  const [isLeader, setIsLeader] = useState(initialRole === "LEADER");

  const handleRoleChange = async (checked: boolean) => {
    const originalRole = isLeader; // Save original state
    setIsLeader(checked); // Optimistically update the UI

    try {
      const newRole = checked ? "LEADER" : "WHOLESALER";
      const result = await updateUserRole(userId, newRole);

      if (result.success) {
        toast.success(result.message);
      } else {
        // Revert to the original state if the update fails
        setIsLeader(originalRole);
        toast.error(result.message || "Failed to update role.");
      }
    } catch (error) {
      // Revert to the original state if an error occurs
      console.error(error);
      setIsLeader(originalRole);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex items-center">
      <Switch
        checked={isLeader}
        onCheckedChange={handleRoleChange}
        className="mr-2"
      />
      <span>{isLeader ? "Leader" : "Wholesaler"}</span>
    </div>
  );
}
