/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateWholesalerId } from "@/actions/wholesaler";

const changeIdSchema = z.object({
  newId: z.string(),
});

// TODO: TYPE-SAFETY
export default function ChangeWholesalerIdDialog({
  user,
  onFormSubmitSuccess,
}: {
  user: any;
  onFormSubmitSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof changeIdSchema>>({
    resolver: zodResolver(changeIdSchema),
    defaultValues: {
      newId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof changeIdSchema>) {
    setIsLoading(true);
    try {
      const result = await updateWholesalerId(user.idNum, values.newId);
      if (result.success) {
        toast.success(
          `${result.message} ${user.firstName} ${
            user.middleName && user.middleName[0]
          }${user.middleName && `. `}${user.lastName}`
        );
        form.reset();
        onFormSubmitSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormItem>
          <FormLabel>Current Wholesaler ID</FormLabel>
          <Input value={user.idNum} disabled />
        </FormItem>
        <FormField
          control={form.control}
          name="newId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Wholesaler ID</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ID Number"
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Updating..." : "Change Wholesaler ID"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
