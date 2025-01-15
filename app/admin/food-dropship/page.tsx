import Header from "@/components/ui/header";
import { FoodDataTable } from "./_components/food-table";
import { CategoryTable } from "./_components/category-table";
import type { Metadata } from "next";
import { getAllCategories, getAllProducts } from "@/data/food";
import { getCurrentRole } from "@/data/wholesalers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Food Dropshipping",
};

export default async function FoodsPage() {
  const categories = await getAllCategories();

  const products = await getAllProducts();

  const role = await getCurrentRole();

  return (
    <>
      <Header
        pageTitle={metadata.title}
        categories={categories.map((category) => category.name).sort()}
        role={role}
      />
      <div className="container mx-auto py-10">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-1/2 grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="products">
            <FoodDataTable
              data={products}
              categories={categories.map((category) => category.name).sort()}
            />
          </TabsContent>
          <TabsContent value="categories">
            <CategoryTable categories={categories} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
