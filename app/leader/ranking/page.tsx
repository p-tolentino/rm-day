import Header from "@/components/ui/header";
import { SubteamReportDataTable } from "./_components/subteam-ranking-table";
import type { Metadata } from "next";
import { getSubteamReports } from "@/data/reports";
import { getUserLocations } from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "Monthly Subteam Ranking",
};

export default async function Ranking() {
  const reports = await getSubteamReports();

  const userLocations = await getUserLocations();

  const formattedReports = reports.map((report) => {
    const userInfo = userLocations?.find(
      (user) => user.idNum === report.wholesalerId
    );

    if (userInfo) {
      const { subTeam, city, country, idNum, profession } = userInfo;

      return { ...report, subTeam, country, idNum, profession, city };
    } else {
      return [];
    }
  });

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <SubteamReportDataTable
          data={formattedReports}
          userLocations={userLocations || []}
        />
      </div>
    </>
  );
}
