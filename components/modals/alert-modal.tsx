"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { Button } from "../ui/button";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: React.ReactNode;
  actionLabel?: string;
  variant?: "danger" | "warning" | "default";
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "Are you absolutely sure?",
  description = "This action cannot be undone.",
  actionLabel = "Continue",
  variant = "default",
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
      case "warning":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90";
    }
  };

  return (
    <Modal
      title={title}
      description={
        <div className="flex justify-start items-center gap-2">
          {description}
        </div>
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex justify-end items-center gap-2 pt-4">
        <Button disabled={loading} variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={loading}
          onClick={onConfirm}
          className={getVariantStyles()}
        >
          {loading ? "Loading..." : actionLabel}
        </Button>
      </div>
    </Modal>
  );
};
