/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Separator } from "@/components/ui/separator";
// import { AlertModal } from "@/components/modals/alert-modal";
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

interface CellActionProps {
  report: any;
  acceptReports: boolean;
}

export const CellAction: React.FC<CellActionProps> = ({
  report,
  acceptReports,
}) => {
  // const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);

  // const onDelete = async (id: string) => {
  //   startTransition(() => {
  //     console.log("TODO: Delete user");
  //     setOpen(false);
  //     // deleteProperty(id)
  //     //   .then((data) => {
  //     //     if (data.error) {
  //     //       console.log(data.error);
  //     //     }

  //     //     if (data.success) {
  //     //       update();
  //     //       setOpen(false);
  //     //       router.refresh();
  //     //       console.log(data.success);
  //     //     }
  //     //   })
  //     //   .catch(() => {
  //     //     console.log("Something went wrong.");
  //     //   });
  //   });
  // };

  return (
    // TODO DELETE MODAL FUNCTION:
    <>
      {/* <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => onDelete(report.id)}
        loading={isPending}
        title="Confirm Report Deletion"
        description={
          <>
            Are you sure you want to delete this report from the system? This
            action cannot be undone.
          </>
        }
      /> */}
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
              // TODO: FETCH ACCEPTING REPORTS OR NOT
              acceptReports={true}
              // TODO: FETCH CATEGORIES AND PRODUCTS IN FORM, IF DONE, UPDATE OTHER REPORT FORMS TO FETCH ENCAPSULATED AND NOT PASS PROPS
              //   categories={categories}
              //   products={products}
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

          <DropdownMenuItem disabled>
            <Trash />
            Delete report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
