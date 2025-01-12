"use client";

import React, { useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, X } from "lucide-react";

export type Product = {
  id: string;
  name: string;
  points: number;
  category: string;
};

export type Category = {
  id: string;
  name: string;
};

// Create a schema for the form
const formSchema = z.object({
  products: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      points: z.number(),
      quantity: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
          message: "Quantity must be a non-negative number",
        }),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface FoodCalculatorProps {
  // TODO: TYPE SAFETY DATA TYPES
  categories: Category[];
  products: Product[];
  onCalculate: (totalPoints: number) => void;
  initialValues: {
    id: string;
    name: string;
    points: number;
    quantity: string;
  }[];
  onValuesChange: (
    values: { id: string; name: string; points: number; quantity: string }[]
  ) => void;
}

export function FoodCalculator({
  categories,
  products,
  onCalculate,
  initialValues,
  onValuesChange,
}: FoodCalculatorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const validProducts = products.filter(
    (product) =>
      product && product.id && product.name && product.points !== undefined
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      products:
        initialValues.length > 0
          ? initialValues
          : validProducts.map((product) => ({
              ...product,
              quantity: "0",
            })),
    },
  });

  const { control, watch } = form;
  const watchProducts = watch("products");

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const totalPoints = data.products.reduce((total, product) => {
      return total + product.points * Number(product.quantity);
    }, 0);
    onCalculate(totalPoints);
    onValuesChange(data.products);
  };

  const totalPoints = watchProducts.reduce((total, product) => {
    return total + product.points * Number(product.quantity);
  }, 0);

  // Organize products by category
  const productsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      // Only include products that have a matching category name
      const categoryProducts = products.filter(
        (product) => product.category && product.category === category.name
      );
      if (categoryProducts.length > 0) {
        acc[category.name] = categoryProducts;
      }
      return acc;
    }, {} as Record<string, Product[]>);
  }, [categories, products]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;

    return categories.filter((category) => {
      const categoryProducts = productsByCategory[category.name] || [];
      const filteredProducts = categoryProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return filteredProducts.length > 0; // Only include categories with matching products
    });
  }, [searchTerm, categories, productsByCategory]);

  return (
    <Form {...form}>
      <form className="flex flex-col h-full p-2">
        <div className="flex items-end space-x-2 w-full">
          <div className="mb-4 relative w-full">
            <Input
              className="peer pe-9 ps-9 pl-10"
              placeholder="Search products..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <Search size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
        {filteredCategories.length <= 0 && (
          <div className="w-full h-full">
            <div className="flex justify-center text-sm italic text-gray-400">
              No results found.
            </div>
          </div>
        )}
        <ScrollArea className="flex-grow pr-4">
          <Accordion
            type="multiple"
            value={openCategories}
            onValueChange={setOpenCategories}
          >
            {filteredCategories.map((category) => {
              const categoryProducts = productsByCategory[category.name] || [];
              const filteredProducts = categoryProducts.filter((product) =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
              );

              return (
                <AccordionItem value={category.name} key={category.id}>
                  <AccordionTrigger
                    className="flex justify-between"
                    disabled={
                      (productsByCategory[category.name] || []).length <= 0
                    }
                  >
                    <div className="space-x-1">
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-gray-400 italic">
                        ({filteredProducts.length} items)
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    <div className="space-y-4">
                      {filteredProducts.map((product) => (
                        <FormField
                          key={product.id}
                          control={control}
                          name={`products.${watchProducts.findIndex(
                            (p) => p.id === product.id
                          )}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center space-x-4">
                                <FormLabel className="flex-1">
                                  {product.name}
                                </FormLabel>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium w-20 text-right">
                                    {product.points.toFixed(2)} pts.
                                  </span>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="number"
                                      min={0}
                                      className="w-20"
                                    />
                                  </FormControl>
                                  <span className="text-xs w-8 text-gray-400">
                                    QTY
                                  </span>
                                </div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
        <Separator className="my-4" />
        <div className="flex justify-between items-center pt-4">
          <div className="text-lg font-semibold">
            Total Points: {totalPoints.toFixed(2)}
          </div>
          <Button type="button" onClick={() => onSubmit(form.getValues())}>
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
