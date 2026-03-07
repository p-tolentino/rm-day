import Header from "@/components/ui/header";
import { MySubmissionsDataTable } from "./_components/submissions-table";
import type { Metadata } from "next";
import { getCurrentUserReports } from "@/data/reports";
import { getUserLocationsMap } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";

export const metadata: Metadata = {
  title: "My Income Reports",
};

export default async function UserSubmissions() {
  const [rawReports, userLocationsMap, acceptReports] = await Promise.all([
    getCurrentUserReports(),
    getUserLocationsMap(),
    getDeadline(),
  ]);

  const reports = rawReports || [];

  const formattedReports = reports
    .map((report) => {
      const userInfo = userLocationsMap.get(report.wholesalerId);
      if (!userInfo) return null;
      const { subTeam, city, country, idNum, profession } = userInfo;
      return { ...report, subTeam, country, idNum, profession, city };
    })
    .filter(Boolean);

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <MySubmissionsDataTable
          data={formattedReports}
          userLocations={Array.from(userLocationsMap.values())}
          acceptReports={acceptReports}
        />
      </div>
    </>
  );
}
