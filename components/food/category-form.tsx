"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { createCategory } from "@/actions/food";
import { useState } from "react";

export const categorySchema = z.object({
  name: z.string(),
});

export default function CategoryForm({
  onCategorySucess,
}: {
  onCategorySucess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
  });

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    setIsLoading(true);

    try {
      const result = await createCategory(values);
      if (result.success) {
        toast.success(result.message);
        onCategorySucess();
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-3xl mx-auto py-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Category"
                  type="text"
                  {...field}
                  value={field.value && field.value.toLocaleUpperCase()}
                  disabled={isLoading}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? `Adding Category...` : `Add Category`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
