export function calculateBLC(totalWholesale: number): string {
  if (totalWholesale >= 31) return "DIAMOND";
  if (totalWholesale >= 15) return "RUBY";
  if (totalWholesale >= 7) return "EMERALD";
  if (totalWholesale >= 3) return "SAPPHIRE";
  if (totalWholesale >= 1) return "PLATINUM";
  return "-";
}

export function calculateWBC(totalIncome: number): string {
  if (totalIncome >= 100000000) return "1 MILLION DOLLAR";
  if (totalIncome >= 51000000) return "DARK HORSE";
  if (totalIncome >= 21000000) return "LEGEND";
  if (totalIncome >= 11000000) return "CHAMPION";
  if (totalIncome >= 6000000) return "PRESIDENT";
  if (totalIncome >= 1000000) return "AMBASSADOR";
  if (totalIncome >= 750000) return "750K";
  if (totalIncome >= 500000) return "500K";
  if (totalIncome >= 250000) return "250K";
  if (totalIncome >= 100000) return "100K";
  if (totalIncome >= 50000) return "PROJECT 50K";
  return "-";
}

export const getHighestAchievedTitle = (
  achievements: { title: string; achieved: boolean }[],
  orderedTitles: string[]
): string => {
  for (const title of orderedTitles) {
    const achievement = achievements?.find((a) => a.title === title);
    if (achievement && achievement.achieved) {
      return title;
    }
  }
  return "-"; // Return "-" if no title is achieved
};

export const BLC_TITLES = [
  { title: "DIAMOND", threshold: 31 },
  { title: "RUBY", threshold: 15 },
  { title: "EMERALD", threshold: 7 },
  { title: "SAPPHIRE", threshold: 3 },
  { title: "PLATINUM", threshold: 1 },
];

export const WBC_TITLES = [
  { title: "1 MILLION DOLLAR", threshold: 100000000 },
  { title: "DARK HORSE", threshold: 51000000 },
  { title: "LEGEND", threshold: 21000000 },
  { title: "CHAMPION", threshold: 11000000 },
  { title: "PRESIDENT", threshold: 6000000 },
  { title: "AMBASSADOR", threshold: 1000000 },
  { title: "750K", threshold: 750000 },
  { title: "500K", threshold: 500000 },
  { title: "250K", threshold: 250000 },
  { title: "100K", threshold: 100000 },
  { title: "PROJECT 50K", threshold: 50000 },
];
