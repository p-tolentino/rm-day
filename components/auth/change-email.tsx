"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { changeEmail } from "@/actions/auth";

const changeEmailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

export function ChangeEmailDialog({ currentEmail }: { currentEmail: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof changeEmailSchema>) => {
    setIsLoading(true);

    try {
      const result = await changeEmail(values.newEmail);
      if (result.success) {
        toast.info(result.message);
        form.reset();
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating your email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 w-full" variant={"outline"}>
          <Mail size={18} />
          <span>Change Email</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail size={18} />
            <span>Change Email Address</span>
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Current Email Address</FormLabel>
              <Input value={currentEmail} disabled />
            </FormItem>
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="new@email.com"
                      type="email"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Change Email"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
