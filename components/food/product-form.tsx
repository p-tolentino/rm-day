/* eslint-disable @typescript-eslint/no-explicit-any */
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
import ComboBoxSelector from "../ui/combo-box-input";
import { createProduct } from "@/actions/food";
import { useState } from "react";

export const productSchema = z.object({
  category: z.string(),
  name: z.string(),
  points: z.number().min(0),
});

export default function ProductForm({
  categories,
  onProductSucess,
}: {
  // TODO: TYPESAFETY
  categories?: any;
  onProductSucess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
  });

  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsLoading(true);

    try {
      const result = await createProduct(values);
      if (result.success) {
        toast.success(result.message);
        onProductSucess();
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
        className="space-y-4 max-w-sm mx-auto py-4"
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <ComboBoxSelector
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                  itemName="category"
                  items={categories}
                  disabled={isLoading}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name"
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

        <FormField
          control={form.control}
          name="points"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Points</FormLabel>
              <FormControl>
                <Input
                  placeholder="0"
                  type="number"
                  {...field}
                  onChange={(e) =>
                    form.setValue("points", Number(e.target.value))
                  }
                  disabled={isLoading}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? `Adding Product...` : `Add Product`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
