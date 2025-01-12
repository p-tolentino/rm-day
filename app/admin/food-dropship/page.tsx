import Header from "@/components/ui/header";
import { FoodDataTable } from "./_components/food-table";
import type { Metadata } from "next";
import { getAllCategories, getAllProducts } from "@/data/food";
import { getCurrentRole } from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "Food Dropshipping",
};

export default async function FoodsPage() {
  const categories = await getAllCategories();

  const formattedCategories = categories.map((category) => {
    return category.name;
  });

  const products = await getAllProducts();

  const role = await getCurrentRole();

  return (
    <>
      <Header
        pageTitle={metadata.title}
        categories={formattedCategories}
        role={role}
      />
      <div className="container mx-auto py-10">
        <FoodDataTable data={products} categories={formattedCategories} />
      </div>
    </>
  );
}
