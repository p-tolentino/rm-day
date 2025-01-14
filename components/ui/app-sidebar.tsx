/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useState, createElement, useEffect } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Trophy,
  CalendarArrowUp,
  Utensils,
  Database,
  UserRoundPen,
  FileInput,
  LogOut,
  FileText,
} from "lucide-react";

import Image from "next/image";
import { Button } from "./button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";

import { Separator } from "./separator";

import { Switch } from "@/components/ui/switch";

import { createClient } from "@/utils/supabase/client";
import { updateDeadline } from "@/actions/deadline";
import RMDayForm from "../reports/rm-day";
import ChangePasswordDialog from "../auth/change-password";
import { useRouter } from "next/navigation";
import { ChangeEmailDialog } from "../auth/change-email";

const adminLinks = {
  navMain: [
    {
      title: "Overview",
      items: [
        // {
        //   title: "Dashboard",
        //   url: `/admin/dashboard`,
        //   icon: Gauge,
        // },
        {
          title: "Wholesaler Database",
          url: `/admin/wholesalers`,
          icon: Database,
        },
      ],
    },
    {
      title: "Sales Management",
      items: [
        {
          title: "Overall Ranking",
          url: "/admin/overall-ranking",
          icon: Trophy,
        },
        {
          title: "Monthly Ranking",
          url: "/admin/ranking",
          icon: CalendarArrowUp,
        },
        {
          title: "Food Dropshipping",
          url: "/admin/food-dropship",
          icon: Utensils,
        },
      ],
    },
    {
      title: "My Account",
      items: [
        // {
        //   title: "Submit RM Day Report",
        //   url: "#",
        //   icon: FileInput,
        // },
        {
          title: "Profile",
          url: "/wholesaler/profile",
          icon: UserRoundPen,
        },
        {
          title: "My Submissions",
          url: "/wholesaler/submissions",
          icon: FileText,
        },
      ],
    },
  ],
};

const leaderLinks = {
  navMain: [
    {
      title: "Overview",
      items: [
        // {
        //   title: "Dashboard",
        //   url: `/admin/dashboard`,
        //   icon: Gauge,
        // },
        {
          title: "Subteam Database",
          url: `/leader/subteam`,
          icon: Database,
        },
      ],
    },
    {
      title: "Sales Management",
      items: [
        {
          title: "Monthly Ranking",
          url: "/leader/ranking",
          icon: CalendarArrowUp,
        },
      ],
    },
    {
      title: "My Account",
      items: [
        {
          title: "Profile",
          url: "/wholesaler/profile",
          icon: UserRoundPen,
        },
        {
          title: "My Submissions",
          url: "/wholesaler/submissions",
          icon: FileText,
        },
      ],
    },
  ],
};

const memberLinks = {
  navMain: [
    {
      title: "My Account",
      items: [
        {
          title: "Profile",
          url: "/wholesaler/profile",
          icon: UserRoundPen,
        },
        {
          title: "My Submissions",
          url: "/wholesaler/submissions",
          icon: FileText,
        },
      ],
    },
  ],
};

const formSchema = z.object({
  responses: z.boolean(),
});

// TODO: TYPE SAFETY FOR USER DATA TYPE
export function AppSidebar({
  acceptReports,
  userRole,
  user,
  categories,
  products,
  hasSubmitted,
  incompleteAccountSetup,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  userRole: "ADMIN" | "LEADER" | "WHOLESALER";
  acceptReports: boolean;
  user: any;
  categories?: any;
  products?: any;
  hasSubmitted: boolean;
  incompleteAccountSetup: boolean;
}) {
  const [open, setOpen] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const linksToUse =
    userRole === "ADMIN"
      ? adminLinks
      : userRole === "LEADER"
      ? leaderLinks
      : memberLinks;

  // Supabase Auth listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "USER_UPDATED") {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          console.log(user?.user_metadata);

          if (user?.email) {
            // Retrieve the old and new emails from the user's metadata
            const oldEmail = user.user_metadata?.oldEmail;
            const newEmail = user.user_metadata?.newEmail;

            if (oldEmail && newEmail && newEmail === user.email) {
              // Update the `wholesalers` table using the old email
              const { error } = await supabase
                .from("wholesalers")
                .update({ email: newEmail })
                .eq("email", oldEmail);

              if (error) {
                console.error(
                  "Failed to update email in wholesalers table:",
                  error
                );
                toast.error("Failed to update your email in the database.");
              } else {
                toast.success("Your email has been updated successfully.");

                // Clear the stored emails from metadata
                await supabase.auth.updateUser({
                  data: { oldEmail: null, newEmail: null },
                });
              }
            } else {
              console.error("Old or new email not found in metadata.");
              toast.error("Failed to retrieve email data for update.");
            }
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      responses: acceptReports,
    },
  });

  const handleFormSubmitSuccess = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      await supabase.auth.signOut();
      setTimeout(() => {
        toast.dismiss(loadingToast);
        router.replace(`/`);
      }, 500);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to log out");
      console.error("Logout error:", error);
    }
  };

  const handleReportChange = async (value: boolean) => {
    try {
      const result = await updateDeadline(value);
      if (result?.success) {
        form.setValue("responses", value);
        if (value) {
          toast.success("Accepting RM Day submissions");
        } else {
          toast.error("Not accepting RM Day submissions");
        }
      } else {
        toast.error("Failed to update submission status");
        form.setValue("responses", !value); // Revert switch
      }
    } catch {
      toast.error("Failed to update submission status");
      form.setValue("responses", !value);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex items-center">
        <Image
          src="/images/RM-wide.jpg"
          alt="Team RM"
          height={200}
          width={200}
        />
      </SidebarHeader>
      <SidebarContent>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex justify-center pt-4">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    className={
                      "flex align-middle items-center space-x-2 transition-all"
                    }
                    onClick={() => setOpen(true)}
                    disabled={
                      incompleteAccountSetup ||
                      !form.watch("responses") ||
                      hasSubmitted
                    }
                  >
                    <FileInput className="w-4 h-4" />
                    <span>Submit RM Day Report</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[425px] md:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <FileInput className="w-6 h-6" />
                      <span>Submit RM Day Report</span>
                    </DialogTitle>
                  </DialogHeader>

                  <div>
                    <Separator />
                    <RMDayForm
                      userRole={userRole}
                      acceptReports={acceptReports}
                      user={user}
                      categories={categories}
                      products={products}
                      onFormSubmitSuccess={handleFormSubmitSuccess}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TooltipTrigger>
          {hasSubmitted && (
            <TooltipContent>
              <p>You have already submitted a report for this month.</p>
            </TooltipContent>
          )}

          {incompleteAccountSetup && (
            <TooltipContent>
              <p>
                You need to setup your account: Birthdate, Location, Profession,
                Sponsor and Subteam.
              </p>
            </TooltipContent>
          )}
        </Tooltip>
        {linksToUse.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      {incompleteAccountSetup ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              key={item.url}
                              className="flex items-center ps-2 space-x-2 py-1 text-gray-400 italic hover:cursor-not-allowed"
                            >
                              <span>
                                {item.icon &&
                                  createElement(item.icon, { size: 18 })}
                              </span>
                              <span>{item.title}</span>
                            </div>
                          </TooltipTrigger>
                          {incompleteAccountSetup && (
                            <TooltipContent>
                              <p>
                                You need to setup your account: Birthdate,
                                Location, Profession, Sponsor and Subteam.
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      ) : (
                        <a href={item.url}>
                          {item.icon && createElement(item.icon, { size: 18 })}
                          {item.title}
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {userRole === "ADMIN" && (
          <Form {...form}>
            <form className="space-y-2 w-full mx-auto mb-10">
              <FormField
                control={form.control}
                name="responses"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-gray-300 p-4">
                    <FormLabel>RM Day Reports</FormLabel>

                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          handleReportChange(checked);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
        <ChangeEmailDialog currentEmail={user?.email} />
        <ChangePasswordDialog />
        <Button
          type="button"
          className="flex items-center space-x-2"
          onClick={() => handleLogout()}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
