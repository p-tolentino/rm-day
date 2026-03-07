import Header from "@/components/ui/header";
import { ReportDataTable } from "./_components/ranking-table";
import type { Metadata } from "next";
import { getAllReports } from "@/data/reports";
import { getUserLocationsMap } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";

export const metadata: Metadata = {
  title: "Monthly Ranking",
};

export default async function Ranking() {
  const [reports, userLocationsMap, acceptReports] = await Promise.all([
    getAllReports(),
    getUserLocationsMap(),
    getDeadline(),
  ]);

  const formattedReports = reports
    .map((report) => {
      const userInfo = userLocationsMap.get(report.wholesalerId);
      if (!userInfo) return null;
      const { subTeam, city, country, idNum, profession, avatar } = userInfo;
      return { ...report, subTeam, country, idNum, profession, city, avatar };
    })
    .filter(Boolean);

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <ReportDataTable
          data={formattedReports.sort((a, b) => b.cmir - a.cmir)}
          userLocations={Array.from(userLocationsMap.values())}
          acceptReports={acceptReports}
        />
      </div>
    </>
  );
}
