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
import ComboBoxSelector from "@/components/ui/combo-box-input";

interface EditProfileDialogProps {
  profile: any;
  wholesalers: any[];
}

export function EditProfileDialog({
  profile,
  wholesalers,
}: EditProfileDialogProps) {
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
                          value={field.value?.toLocaleUpperCase()}
                          disabled={isLoading}
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
                          value={field.value?.toLocaleUpperCase()}
                          disabled={isLoading}
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
                          value={field.value?.toLocaleUpperCase()}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Profession, Date of Birth, Sponsor */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
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
              </div>

              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <EnhancedDatePicker
                          value={
                            field.value ? new Date(field.value) : undefined
                          }
                          onChange={(date) => field.onChange(date)}
                          disabled={isLoading}
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
