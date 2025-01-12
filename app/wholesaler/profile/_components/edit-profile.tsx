/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { registerSchema } from "@/components/auth/register-wholesaler";
import { updateWholesalerInfo } from "@/actions/wholesaler";
import { toast } from "sonner";
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker";
import LocationSelector from "@/components/ui/location-input";

interface EditProfileDialogProps {
  profile: any;
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dob: profile.dob,
      email: profile.email,
      firstName: profile.firstName,
      idNum: profile.idNum,
      lastName: profile.lastName,
      middleName: profile.middleName,
      profession: profile.profession,
      sponsor: profile.sponsor,
      subTeam: profile.subTeam,
      location: [profile.country, profile.city],
      avatar: profile.avatar,
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    console.log(values);
    setIsLoading(true); // Start loading
    try {
      const result = await updateWholesalerInfo(values);
      if (result.success) {
        toast.success(result.message);
        setOpen(false); // Close the dialog on success
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the profile.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields in One Line */}
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.toLocaleUpperCase()}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.toLocaleUpperCase()}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.toLocaleUpperCase()}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date of Birth and Profession in One Line */}
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="profession"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Profession</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value?.toLocaleUpperCase()}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <EnhancedDatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => {
                          if (date) {
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            field.onChange(formattedDate);
                          } else {
                            field.onChange("");
                          }
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Input at the Bottom */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <LocationSelector
                      onCountryChange={(country) => {
                        form.setValue(field.name, [country || "", ""]);
                      }}
                      onStateChange={() => {
                        // Clear city when state changes
                        const [country] = form.getValues(field.name);
                        form.setValue(field.name, [country, ""]);
                      }}
                      onCityChange={(city) => {
                        const [country] = form.getValues(field.name);
                        form.setValue(field.name, [country, city || ""]);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Save Changes Button */}
            <div className="flex justify-end">
              <Button
                disabled={isLoading}
                onClick={() => onSubmit(form.getValues())}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
