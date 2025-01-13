import Header from "@/components/ui/header";
import { WholesalerDataTable } from "./_components/user-table";
import type { Metadata } from "next";
import {
  getAllWholesalers,
  getCurrentRole,
  getUserLocations,
} from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "Wholesaler Data",
};

export default async function WholesalerData() {
  // TODO: FIX TYPE SAFETY

  const wholesalers = await getAllWholesalers();
  const userLocations = await getUserLocations();

  const role = await getCurrentRole();

  const formattedWholesalers = wholesalers.map((wholesaler) => {
    return `${wholesaler.firstName} ${
      wholesaler.middleName && wholesaler.middleName[0]
    }${wholesaler.middleName && `. `}${wholesaler.lastName}`;
  });

  return (
    <>
      <Header
        pageTitle={metadata.title}
        wholesalers={formattedWholesalers}
        role={role}
      />
      <div className="container mx-auto py-10">
        <WholesalerDataTable
          data={wholesalers.filter((wholesaler) => wholesaler.role !== "ADMIN")}
          userLocations={userLocations}
        />
      </div>
    </>
  );
}
