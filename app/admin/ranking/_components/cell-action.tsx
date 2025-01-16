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
  DialogTrigger,
} from "@/components/ui/dialog";

import { Copy, FileUser, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditReportForm from "@/components/reports/edit-report";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { AlertModal } from "@/components/modals/alert-modal";
import { deleteProof, deleteRmdReport } from "@/actions/report";

interface CellActionProps {
  report: any;
  acceptReports: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
  report,
  acceptReports,
}) => {
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const deleteCMIRResult = await deleteProof(report.ssCMIR, "ssCMIR");
      if (deleteCMIRResult.success) {
        toast.success("CMIR Proof deleted successfully");
      } else {
        toast.error(deleteCMIRResult.message);
      }

      const deleteMSRResult = await deleteProof(report.ssMSR, "ssMSR");
      if (deleteMSRResult.success) {
        toast.success("MSR Proof deleted successfully");
      } else {
        toast.error(deleteMSRResult.message);
      }

      const result = await deleteRmdReport(report.id);

      if (result.success) {
        toast.success(result.message);
        setOpenDeleteModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete report");
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
        title="Delete Report"
        description={
          <>
            <span>
              Are you sure you want to delete {report.fullName}&apos;s report?{" "}
              <span className="font-semibold">
                This action cannot be undone.
              </span>
            </span>
          </>
        }
        actionLabel="Delete"
        variant="danger"
      />

      <Dialog open={openEditForm} onOpenChange={setOpenEditForm}>
        <DialogTrigger asChild>
          {/* <Button
            type="button"
            className={
              "flex align-middle items-center space-x-2 transition-all w-[90%]"
            }
            onClick={() => setOpenEditForm(true)}
          >
            <FileUser className="w-4 h-4" />
            <span>Edit Income Report for {report.fullName}</span>
          </Button> */}
        </DialogTrigger>
        <DialogContent className="max-w-[425px] md:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileUser className="w-6 h-6" />
              <span>Edit Income Report for {report.fullName}</span>
            </DialogTitle>
          </DialogHeader>

          <div>
            <Separator />
            <EditReportForm
              report={report}
              acceptReports={acceptReports}
              onFormSubmitSuccess={() => setOpenEditForm(false)}
              isDialogOpen={openEditForm}
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
              navigator.clipboard.writeText(report.id);
              toast.info("Report ID copied to clipboard");
            }}
          >
            <Copy />
            Copy report ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem
                  onClick={() => setOpenEditForm(true)}
                  disabled={!acceptReports}
                >
                  <Pencil />
                  Edit report
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            {!acceptReports && (
              <TooltipContent>
                <p>Admin has disabled submitting reports</p>
              </TooltipContent>
            )}
          </Tooltip>

          <DropdownMenuItem
            onClick={() => setOpenDeleteModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash />
            Delete report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
