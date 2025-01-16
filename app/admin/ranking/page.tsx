import Header from "@/components/ui/header";
import { ReportDataTable } from "./_components/ranking-table";
import type { Metadata } from "next";
import { getAllReports } from "@/data/reports";
import { getUserLocations } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";

export const metadata: Metadata = {
  title: "Monthly Ranking",
};

export default async function Ranking() {
  const reports = await getAllReports();

  const userLocations = await getUserLocations();

  const formattedReports = reports.map((report) => {
    const userInfo = userLocations?.find(
      (user) => user.idNum === report.wholesalerId
    );

    if (userInfo) {
      const { subTeam, city, country, idNum, profession, avatar } = userInfo;

      return { ...report, subTeam, country, idNum, profession, city, avatar };
    } else {
      return [];
    }
  });

  const acceptReports = await getDeadline();

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <ReportDataTable
          data={formattedReports.sort((a, b) => b.cmir - a.cmir)}
          userLocations={userLocations || []}
          acceptReports={acceptReports}
        />
      </div>
    </>
  );
}
