/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TemplateString } from "next/dist/lib/metadata/types/metadata-types";
import { Button } from "./button";
import { Plus, UserRoundPlus, Utensils, ChartBarStacked } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "./sidebar";
import { Separator } from "./separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import RegisterWholesalerForm from "../auth/register-wholesaler";
import CategoryForm from "../food/category-form";
import ProductForm from "../food/product-form";

const Header = ({
  pageTitle,
  wholesalers,
  categories,
  role,
}: {
  categories?: any;
  wholesalers?: any;
  pageTitle: string | TemplateString | null | undefined;
  role?: string;
}) => {
  const [wholesalerOpen, setWholesalerOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const isAdmin = role === "SUPERADMIN" || role === "ADMIN";
  const isLeader = role === "LEADER";
  const pathname = usePathname();

  return (
    <header className="flex justify-between h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-primary transition-colors shrink-0" />
        <Separator orientation="vertical" className="mr-1 h-4 shrink-0" />
        <span className="font-semibold text-base truncate">
          {pageTitle?.toString()}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {role &&
          (isAdmin || isLeader) &&
          (pathname === "/admin/wholesalers" ||
            pathname === "/leader/subteam") && (
            <Dialog open={wholesalerOpen} onOpenChange={setWholesalerOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => setWholesalerOpen(true)}
                >
                  <UserRoundPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Wholesaler</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[425px] md:max-w-3xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <UserRoundPlus className="w-6 h-6" />
                    <span>Register New Wholesaler</span>
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <Separator />
                  <RegisterWholesalerForm
                    onOpenChange={setWholesalerOpen}
                    wholesalers={wholesalers}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}

        {role && isAdmin && pathname === "/admin/food-dropship" && (
          <div className="flex items-center gap-2">
            <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1.5"
                  onClick={() => setCategoryOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Category</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <ChartBarStacked className="w-6 h-6" />
                    <span>Create New Category</span>
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <Separator />
                  <CategoryForm
                    onCategorySucess={() => setCategoryOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={productOpen} onOpenChange={setProductOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => setProductOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Product</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Utensils className="w-6 h-6" />
                    <span>Create New Product</span>
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <Separator />
                  <ProductForm
                    categories={categories}
                    onProductSucess={() => setProductOpen(false)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
