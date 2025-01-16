import Header from "@/components/ui/header";
import { MySubmissionsDataTable } from "./_components/submissions-table";
import type { Metadata } from "next";
import { getCurrentUserReports } from "@/data/reports";
import { getUserLocations } from "@/data/wholesalers";
import { getDeadline } from "@/data/deadline";

export const metadata: Metadata = {
  title: "My Income Reports",
};

export default async function UserSubmissions() {
  const reports = (await getCurrentUserReports()) || [];

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

  const acceptReports = await getDeadline();

  return (
    <>
      <Header pageTitle={metadata.title} />
      <div className="container mx-auto py-10">
        <MySubmissionsDataTable
          data={formattedReports}
          userLocations={userLocations || []}
          acceptReports={acceptReports}
        />
      </div>
    </>
  );
}
