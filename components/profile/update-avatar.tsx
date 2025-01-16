"use client";

import { useState } from "react";
import { Image, LoaderCircle, PencilIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { deleteAvatar, uploadAvatar } from "@/actions/upload";
import { updateWholesalerAvatar } from "@/actions/wholesaler";

const formSchema = z.object({
  avatar: z
    .instanceof(File)
    .refine((file) => file.size <= 5000000, `Max file size is 5MB.`)
    .refine(
      (file) => ["image/jpeg", "image/png"].includes(file.type),
      "Only .jpeg/.jpg and .png formats are supported."
    ),
});

interface AvatarUpdateButtonProps {
  idNum: string;
  currentAvatarUrl: string;
}

export function AvatarUpdateButton({
  idNum,
  currentAvatarUrl,
}: AvatarUpdateButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // Upload new avatar
      const formData = new FormData();
      formData.append("file", values.avatar);
      const uploadResult = await uploadAvatar(formData);

      if (uploadResult.error) {
        toast.error("Failed to upload image");
        return;
      }

      // IF successfull upload, delete old avatar
      if (currentAvatarUrl) {
        const deleteResult = await deleteAvatar(currentAvatarUrl);
        console.log(deleteResult.message);
      }

      // Update wholesaler's avatar
      const updateResult = await updateWholesalerAvatar(
        idNum,
        uploadResult.url
      );

      if (!updateResult.success) {
        toast.error(updateResult.message);
        return;
      }

      toast.success("Avatar updated successfully");
      setOpen(false);
    } catch (error) {
      console.error("Avatar update error:", error);
      toast.error("Failed to update avatar. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="absolute bottom-4 right-4">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Image className="w-6 h-6" />
            <span>Update Picture</span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-8">
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Picture</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle
                    className="animate-spin"
                    size={16}
                    strokeWidth={2}
                    role="status"
                    aria-label="Loading..."
                  />
                ) : (
                  "Update Avatar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
