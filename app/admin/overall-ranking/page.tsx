import Header from "@/components/ui/header";
import {
  Report,
  OverallRankingDataTable,
} from "./_components/overall-ranking-table";
import type { Metadata } from "next";
import { getAllReports } from "@/data/reports";
import { getUserLocations } from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "Overall Ranking",
};

const consolidateReports = (reports: Report[]): Report[] => {
  const userMap = new Map<string, Report>();

  reports.forEach((report) => {
    const userId = report.wholesalerId;
    if (userMap.has(userId)) {
      const existingReport = userMap.get(userId)!;
      existingReport.cmir += report.cmir;
      existingReport.msr += report.msr;
      existingReport.food += report.food;
    } else {
      userMap.set(userId, { ...report });
    }
  });

  // Convert the map to an array and sort by the desired metric (e.g., `CMIR`)
  const consolidatedReports = Array.from(userMap.values()).sort(
    (a, b) => b.cmir - a.cmir // Sort by `CMIR` in descending order
  );

  return consolidatedReports;
};

export default async function OverallRanking() {
  const reports = await getAllReports(); // Fetch all reports

  const consolidatedReports = consolidateReports(reports); // Consolidate and sort the data

  const userLocations = await getUserLocations();

  const formattedReports = consolidatedReports
    .map((report) => {
      const userInfo = userLocations?.find(
        (user) => user.idNum === report.wholesalerId
      );

      if (userInfo) {
        const { subTeam, country, idNum, profession } = userInfo;

        return { ...report, subTeam, country, wholesalerId: idNum, profession };
      } else {
        return null;
      }
    })
    .filter((report): report is Report => report !== null);

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <OverallRankingDataTable
          data={formattedReports}
          userLocations={userLocations || []}
        />
      </div>
    </>
  );
}
