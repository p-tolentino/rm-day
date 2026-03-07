import Header from "@/components/ui/header";
import {
  Report,
  OverallRankingDataTable,
} from "./_components/overall-ranking-table";
import type { Metadata } from "next";
import { getAllReports } from "@/data/reports";
import { getUserLocationsMap } from "@/data/wholesalers";

export const metadata: Metadata = {
  title: "Overall Ranking",
};

/**
 * Consolidates all monthly reports per user into a single running total.
 * Uses a Map for a single O(n) pass instead of nested loops.
 */
const consolidateReports = (reports: Report[]): Report[] => {
  const userMap = new Map<string, Report>();

  for (const report of reports) {
    const existing = userMap.get(report.wholesalerId);
    if (existing) {
      existing.cmir += report.cmir;
      existing.msr += report.msr;
      existing.food += report.food;
    } else {
      userMap.set(report.wholesalerId, { ...report });
    }
  }

  return Array.from(userMap.values()).sort((a, b) => b.cmir - a.cmir);
};

export default async function OverallRanking() {
  const [reports, userLocationsMap] = await Promise.all([
    getAllReports(),
    getUserLocationsMap(),
  ]);

  const consolidated = consolidateReports(reports);

  const formattedReports = consolidated
    .map((report) => {
      const userInfo = userLocationsMap.get(report.wholesalerId);
      if (!userInfo) return null;
      const {
        subTeam,
        country,
        idNum,
        profession,
        avatar,
        totalWholesale,
        totalIncome,
      } = userInfo;
      return {
        ...report,
        wholesale: totalWholesale,
        income: totalIncome,
        subTeam,
        country,
        wholesalerId: idNum,
        profession,
        avatar,
      };
    })
    .filter((r): r is Report => r !== null);

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <OverallRankingDataTable
          data={formattedReports}
          userLocations={Array.from(userLocationsMap.values())}
        />
      </div>
    </>
  );
}
