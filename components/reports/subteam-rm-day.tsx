/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, LoaderCircle } from "lucide-react";
import { Separator } from "../ui/separator";
import { FoodCalculator } from "./food-calculator";
import {
  getNonSubmittingSubteamMembers,
  getWholesalerName,
  getWholesalerRecords,
} from "@/data/wholesalers";
import { createRmdReport } from "@/actions/report";
import { uploadFile } from "@/actions/upload";
import ComboBoxSelector from "../ui/combo-box-input";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png"];

export const reportSchema = z.object({
  idNumber: z.string(),
  fullName: z.string().optional(),
  monthlyWholesale: z.number(),
  monthlyIncome: z.string(),
  consolidatedMonthlyIncome: z.string(),
  ssCMIR: z
    .custom<File[]>()
    .refine((files) => files?.length === 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 4MB`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png formats are supported"
    ),
  ssCMIRUrl: z.string(),
  mmppSummaryReport: z.string(),
  ssMSR: z
    .custom<File[]>()
    .refine((files) => files?.length === 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 4MB`
    )
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png formats are supported"
    ),
  ssMSRUrl: z.string(),
  consolidatedMonthlyFoodIncome: z.number(),
  agree: z.boolean(),
});

// TODO: TYPE SAFETY FOR DATA TYPES
const SubteamMemberForm = ({
  acceptReports,
  categories,
  products,
  onFormSubmitSuccess,
  isDialogOpen,
}: {
  acceptReports: boolean;
  categories?: any;
  products?: any;
  onFormSubmitSuccess: () => void;
  isDialogOpen: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const [subteamMembers, setSubteamMembers] = useState<any[]>([]);

  const [foodCalculatorValues, setFoodCalculatorValues] = useState<
    { id: string; name: string; points: number; quantity: string }[]
  >([]);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      consolidatedMonthlyIncome: "0",
      mmppSummaryReport: "0",
      consolidatedMonthlyFoodIncome: 0,
      monthlyIncome: "0",
      monthlyWholesale: 0,
    },
  });

  const fetchSubteamMembers = async () => {
    setIsLoading(true);
    setIsLoadingFetch(true);

    try {
      const nonSubmittingMembers = await getNonSubmittingSubteamMembers();

      if (!nonSubmittingMembers || nonSubmittingMembers.length === 0) {
        console.log(
          "No subteam members found who haven't submitted this month"
        );
        return;
      }

      setSubteamMembers(nonSubmittingMembers || []);
    } catch (error) {
      console.error("Error fetching subteam members:", error);
      toast.error("Failed to fetch subteam members");
    } finally {
      setIsLoading(false);
      setIsLoadingFetch(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      fetchSubteamMembers();
    }
  }, [isDialogOpen]);

  const onSubmit = async (values: z.infer<typeof reportSchema>) => {
    try {
      setIsLoading(true);

      if (files?.[0] && files?.[1]) {
        const cmirData = new FormData();
        cmirData.append("file", files?.[0]);

        const msrData = new FormData();
        msrData.append("file", files?.[1]);

        const ssCMIR = await uploadFile(cmirData, "ssCMIR");

        if (ssCMIR.error) {
          toast.error("Failed to upload image");
          return;
        }

        const ssMSR = await uploadFile(msrData, "ssMSR");
        if (ssMSR.error) {
          toast.error("Failed to upload image");
          return;
        }

        if (ssCMIR.url && ssMSR.url) {
          const result = await createRmdReport({
            ...values,
            ssCMIRUrl: ssCMIR.url,
            ssMSRUrl: ssMSR.url,
          });

          if (result.success) {
            toast.success("Report submitted successfully");
            onFormSubmitSuccess();
            form.reset();
          } else {
            throw new Error(result.message);
          }
        }
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const wholesalerId = form.watch(`idNumber`);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const fetchWholesaler = async () => {
      setIsLoading(true);
      try {
        if (!wholesalerId) {
          form.setValue("fullName", "Please choose Wholesaler ID");
          return;
        }
        const wholesaler = await getWholesalerName(wholesalerId);
        if (wholesaler.name) {
          form.setValue("fullName", wholesaler.name);
        } else {
          form.setValue("fullName", "No wholesaler data found.");
        }
      } catch (error) {
        console.error("Error fetching wholesaler:", error);
        form.setValue("fullName", "Error fetching wholesaler data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (wholesalerId) {
      timeoutId = setTimeout(fetchWholesaler, 300);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [wholesalerId, form]);

  const handleComboboxChange = async (value: string) => {
    if (!value) {
      form.setValue("monthlyIncome", "0");
      form.setValue("monthlyWholesale", 0);
    }
    const wholesalerData = await getWholesalerRecords(value);
    // Check if the response contains an error
    if ("error" in wholesalerData) {
      console.log(wholesalerData.error); // Show error message
      return;
    }

    // If no error, set the form values
    form.setValue(
      "monthlyIncome",
      wholesalerData.totalIncome?.toString() || "0"
    );
    form.setValue("monthlyWholesale", wholesalerData.totalWholesale || 0);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        className="space-y-3 max-w-3xl mx-auto py-10"
      >
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subteam Member ID</FormLabel>
                  <FormControl>
                    {isLoadingFetch ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <ComboBoxSelector
                        disabled={isLoading || isLoadingFetch}
                        onChange={(value) => {
                          field.onChange(value);
                          handleComboboxChange(value || "");
                        }}
                        itemName="wholesaler ID"
                        items={subteamMembers || []}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complete Name</FormLabel>
                  <FormControl className="flex items-center">
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="Juan M. Dela Cruz"
                        disabled
                        type="text"
                        {...field}
                        className={`${
                          (isLoading ||
                            !wholesalerId ||
                            field.value === "No wholesaler data found.") &&
                          "italic"
                        }`}
                        value={
                          isLoading
                            ? "Loading..."
                            : !wholesalerId
                            ? "Please choose Wholesaler ID"
                            : field.value
                        }
                      />
                    )}
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="monthlyWholesale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Big League Circle</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="0"
                        type="number"
                        {...field}
                        min={0}
                        disabled={!wholesalerId}
                        onChange={(e) =>
                          form.setValue(
                            "monthlyWholesale",
                            Number(e.target.value)
                          )
                        }
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wealth Builder Circle</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="PHP50,000,000"
                        {...field}
                        min={0}
                        type="number"
                        step={0.01}
                        disabled={!wholesalerId}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="consolidatedMonthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CMIR (Ranking)</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="PHP50,000"
                        {...field}
                        min={0}
                        type="number"
                        step={0.01}
                        disabled={!wholesalerId}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="ssCMIR"
              render={() => (
                <FormItem>
                  <FormLabel>CMIR Proof</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFiles((prevArray) => {
                              const updatedArray = [...prevArray]; // Create a shallow copy of the array
                              updatedArray[0] = file; // Update the first element
                              return updatedArray; // Return the new array
                            });
                          }
                        }}
                        required
                        disabled={!wholesalerId}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <FormField
              control={form.control}
              name="mmppSummaryReport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MSR (Product Movers-JC)</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        placeholder="50,000"
                        type="number"
                        {...field}
                        min={0}
                        step={0.01}
                        disabled={!wholesalerId}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-6">
            <FormField
              control={form.control}
              name="ssMSR"
              render={() => (
                <FormItem>
                  <FormLabel>MSR Proof</FormLabel>
                  <FormControl>
                    {isLoading ? (
                      <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                        <LoaderCircle
                          className="animate-spin"
                          size={16}
                          strokeWidth={2}
                          role="status"
                          aria-label="Loading..."
                        />
                      </div>
                    ) : (
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFiles((prevArray) => {
                              const updatedArray = [...prevArray]; // Create a shallow copy of the array
                              updatedArray[1] = file; // Update the first element
                              return updatedArray; // Return the new array
                            });
                          }
                        }}
                        required
                        disabled={!wholesalerId}
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="consolidatedMonthlyFoodIncome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Movers-Food</FormLabel>
              <div className="flex items-center space-x-2 w-full">
                <FormControl>
                  {isLoading ? (
                    <div className="flex items-center justify-start h-9 w-full bg-background border opacity-50 rounded-md px-3">
                      <LoaderCircle
                        className="animate-spin"
                        size={16}
                        strokeWidth={2}
                        role="status"
                        aria-label="Loading..."
                      />
                    </div>
                  ) : (
                    <Input
                      placeholder="50,000"
                      type="number"
                      {...field}
                      disabled
                      readOnly
                    />
                  )}
                </FormControl>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      className={"flex align-middle items-center space-x-2"}
                      onClick={() => setOpen(true)}
                      disabled={!wholesalerId}
                    >
                      <Calculator className="w-4 h-4" />
                      <span className="hidden sm:inline">Food Calculator</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[425px] md:max-w-2xl h-[70vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Calculator className="w-6 h-6" />
                        <span>Food Calculator</span>
                      </DialogTitle>
                    </DialogHeader>

                    <Separator />
                    <div className="flex-grow overflow-hidden">
                      <FoodCalculator
                        categories={categories}
                        products={products}
                        onCalculate={(totalPoints) => {
                          form.setValue(
                            "consolidatedMonthlyFoodIncome",
                            totalPoints
                          );
                          setOpen(false);
                        }}
                        initialValues={foodCalculatorValues}
                        onValuesChange={setFoodCalculatorValues}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agree"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required
                  disabled={!wholesalerId}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className={`${!wholesalerId && "opacity-50"}`}>
                  I have double-checked all the details I filled out and I
                  confirm that my submission is correct and accurate.
                </FormLabel>

                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={!acceptReports || !wholesalerId || isLoading}
        >
          {isLoading ? (
            <LoaderCircle
              className="animate-spin"
              size={16}
              strokeWidth={2}
              role="status"
              aria-label="Loading..."
            />
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SubteamMemberForm;
