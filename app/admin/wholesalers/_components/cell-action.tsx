/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Copy,
  IdCard,
  MoreHorizontal,
  Pencil,
  Trash,
  UserRoundX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertModal } from "@/components/modals/alert-modal";
import { deleteWholesaler } from "@/actions/wholesaler";
import ChangeWholesalerIdDialog from "@/components/auth/change-id";

interface CellActionProps {
  user: any;
}

export const CellAction: React.FC<CellActionProps> = ({ user }) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditWholesalerId, setOpenEditWholesalerId] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const deleteUserResult = await deleteWholesaler(user.id);

      if (deleteUserResult.success) {
        toast.success(deleteUserResult.message);
        setOpenDeleteModal(false);
      } else {
        toast.error(deleteUserResult.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <AlertModal
        isOpen={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title={
          <>
            <UserRoundX />
            <span>Delete User</span>
          </>
        }
        description={
          <>
            <span>
              Are you sure you want to delete{" "}
              {`${user.firstName} ${user.middleName && user.middleName[0]}${
                user.middleName && `. `
              }${user.lastName} (${user.idNum})? `}
              <span className="font-semibold">
                This action cannot be undone.
              </span>
            </span>
          </>
        }
        actionLabel="Delete"
        variant="danger"
      />

      <Dialog
        open={openEditWholesalerId}
        onOpenChange={setOpenEditWholesalerId}
      >
        <DialogContent className="max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <IdCard className="w-6 h-6" />
              <span>Edit Wholesaler ID</span>
            </DialogTitle>
          </DialogHeader>

          <div>
            <Separator />
            <ChangeWholesalerIdDialog
              user={user}
              onFormSubmitSuccess={() => setOpenEditWholesalerId(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.idNum);
              toast.info("Wholesaler ID copied to clipboard");
            }}
          >
            <Copy />
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setOpenEditWholesalerId(true)}>
            <Pencil />
            Edit user ID
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDeleteModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash />
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
