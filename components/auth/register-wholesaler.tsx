/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { subYears } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CloudUpload, Paperclip } from "lucide-react";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import LocationSelector from "../ui/location-input";
// import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import ComboBoxSelector from "../ui/combo-box-input";
import { useRouter } from "next/navigation";
import {
  registerWholesalerInfo,
  updateWholesalerAvatar,
} from "@/actions/wholesaler";
import { uploadAvatar } from "@/actions/upload";
import { subTeams } from "@/utils/subteams";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

export const registerSchema = z.object({
  avatar: z
    .custom<File[]>()
    .refine((files) => files?.length === 1, "Image is required")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 4MB`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png formats are supported"
    )
    .optional(),
  idNum: z.string(),
  subTeam: z.string(),
  sponsor: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  profession: z.string(),
  // dob: z.coerce.date(),
  location: z.tuple([z.string(), z.string().optional()]),
  email: z.string(),
});

export default function RegisterWholesalerForm({
  wholesalers,
  onOpenChange,
}: {
  // TODO: WHOLESALER DATA TYPE
  wholesalers: any;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dropZoneConfig = {
    maxFiles: 1,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  const [countryName, setCountryName] = useState<string>("");
  const [cityName, setCityName] = useState<string>("");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // dob: convertToPhilippineTime(subYears(new Date(), 18)),
    },
  });

  const signUp = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);

    try {
      // const phDob = convertToPhilippineTime(new Date(values.dob));
      // const updatedValues = { ...values, dob: phDob };

      const wholesalerResponse = await registerWholesalerInfo(values);

      if (!wholesalerResponse.success) {
        toast.warning("Failed to register wholesaler");
        return;
      }

      if (files?.[0]) {
        const formData = new FormData();
        formData.append("file", files[0]);

        const uploadResult = await uploadAvatar(formData);
        if (uploadResult.error) {
          toast.error("Failed to upload image");
          return;
        }

        // Update wholesaler with avatar URL
        await updateWholesalerAvatar(values.idNum, uploadResult.url);
      }

      if (wholesalerResponse.success) {
        toast.success(wholesalerResponse.message);
        router.refresh();
        form.reset();
        onOpenChange(false);
        setFiles(null);
      } else {
        toast.warning(
          `Something went wrong while registering wholesaler info.`
        );
      }
    } catch {
      toast.warning(`An unexpected error occurred.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full">
      <div className="container">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(signUp)}
            className="space-y-4 w-full py-4 flex flex-col"
          >
            <div className="space-y-4">
              {/* Upload Picture */}
              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>Upload Picture</FormLabel>
                    <FormControl>
                      <FileUploader
                        value={files}
                        onValueChange={setFiles}
                        dropzoneOptions={dropZoneConfig}
                        className="relative bg-background rounded-lg p-2"
                      >
                        <FileInput
                          id="fileInput"
                          className="outline-dashed outline-1 outline-slate-500"
                        >
                          <div className="flex items-center justify-center flex-col p-8 w-full ">
                            <CloudUpload className="text-gray-500 w-10 h-10" />
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">
                                Click to upload
                              </span>
                              &nbsp; or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG
                            </p>
                          </div>
                        </FileInput>
                        <FileUploaderContent>
                          {files &&
                            files.length > 0 &&
                            files.map((file, i) => (
                              <FileUploaderItem key={i} index={i}>
                                <Paperclip className="h-4 w-4 stroke-current" />
                                <span>{file.name}</span>
                              </FileUploaderItem>
                            ))}
                        </FileUploaderContent>
                      </FileUploader>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ID Number, Subteam, Sponsor */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="idNum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Wholesaler ID"
                            value={field.value?.toLocaleUpperCase()}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="subTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subteam</FormLabel>
                        <FormControl>
                          <ComboBoxSelector
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            itemName="subteam"
                            items={subTeams}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="sponsor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor</FormLabel>
                        <FormControl>
                          <ComboBoxSelector
                            onChange={(value) => {
                              field.onChange(value);
                            }}
                            itemName="sponsor"
                            items={wholesalers}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="First"
                            value={field.value?.toLocaleUpperCase()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Middle"
                            value={field.value?.toLocaleUpperCase()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-4">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Last"
                            value={field.value?.toLocaleUpperCase()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Profession, Date of Birth */}
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="profession"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Profession"
                            value={field.value?.toLocaleUpperCase()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email */}
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address:</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="juan.delacruz@example.com"
                            type="email"
                            value={field.value?.toLocaleUpperCase()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2">
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <EnhancedDatePicker
                            value={
                              field.value
                                ? convertToPhilippineTime(new Date(field.value))
                                : undefined
                            }
                            onChange={(date) => {
                              if (date) {
                                // Convert the selected date to Philippine Time
                                const phDate = convertToPhilippineTime(date);
                                field.onChange(phDate);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div> */}
              </div>

              {/* Country, State, City */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <LocationSelector
                        onCountryChange={(country) => {
                          setCountryName(country || "");
                          form.setValue(field.name, [
                            country || "",
                            cityName || "",
                          ]);
                        }}
                        onStateChange={(state) => {
                          setCityName(state || "");
                          form.setValue(field.name, [
                            countryName || "",
                            state || "",
                          ]);
                        }}
                        onCityChange={(city) => {
                          setCityName(city || cityName || "");
                          form.setValue(field.name, [
                            countryName || "",
                            city || cityName || "",
                          ]);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between align-middle">
              <Button
                variant={"link"}
                type="button"
                onClick={() => onOpenChange(false)}
              >{`← Cancel`}</Button>

              <Button type="submit" disabled={isLoading}>
                Register Wholesaler
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
