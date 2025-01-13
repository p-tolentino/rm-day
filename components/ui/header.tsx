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
  // TODO: TYPESAFETY
  categories?: any;
  wholesalers?: any;
  pageTitle: string | TemplateString | null | undefined;
  role?: string;
}) => {
  const [wholesalerOpen, setWholesalerOpen] = useState(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const onCategorySucess = async () => {
    setCategoryOpen(false);
  };

  const onProductSucess = async () => {
    setProductOpen(false);
  };

  const isAdmin = role === "ADMIN";
  const isLeader = role === "LEADER";

  const pathname = usePathname();

  return (
    <>
      <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
        <div className="flex items-center space-x-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="font-semibold text-lg">{pageTitle?.toString()}</span>
        </div>

        {role &&
          (isAdmin || isLeader) &&
          (pathname === `/admin/wholesalers` ||
            pathname === `/leader/subteam`) && (
            <Dialog open={wholesalerOpen} onOpenChange={setWholesalerOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="flex align-middle items-center space-x-2"
                  onClick={() => setWholesalerOpen(true)}
                >
                  <UserRoundPlus className="w-4 h-4" />
                  <span>New Wholesaler</span>
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

        {role && isAdmin && pathname === `/admin/food-dropship` && (
          <div className="flex space-x-4">
            <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="flex align-middle items-center space-x-2"
                  onClick={() => setCategoryOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Category</span>
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
                  <CategoryForm onCategorySucess={onCategorySucess} />
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={productOpen} onOpenChange={setProductOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="flex align-middle items-center space-x-2"
                  onClick={() => setProductOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Product</span>
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
                    onProductSucess={onProductSucess}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
