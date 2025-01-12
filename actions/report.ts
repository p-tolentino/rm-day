"use server";

import * as z from "zod";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentRole } from "@/data/wholesalers";
import { reportSchema } from "@/components/reports/rm-day";
import { uploadFile } from "./upload";
import { BLC_TITLES, WBC_TITLES } from "@/utils/titles";

export async function createRmdReport(values: z.infer<typeof reportSchema>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return { message: "User is not logged in." };
  // }

  // const currentRole = await getCurrentRole();
  // const isAuthorized = currentRole === "ADMIN" || currentRole === "LEADER"

  // if (!isAuthorized) {
  //   return { message: "Unauthorized: Only admins or leaders can register wholesalers."};
  // }

  const {
    idNumber,
    agree,
    consolidatedMonthlyFoodIncome,
    consolidatedMonthlyIncome,
    mmppSummaryReport,
    monthlyIncome,
    monthlyWholesale,
    ssCMIRUrl,
    ssMSRUrl,
    fullName,
  } = values;

  const { data: wholesalerData, error: wholesalerError } = await supabase
    .from("wholesalers")
    .select("totalWholesale, totalIncome, achievements")
    .eq("idNum", idNumber)
    .single();

  if (wholesalerError) {
    return { success: false, message: wholesalerError.message };
  }

  const currentWholesale = wholesalerData.totalWholesale || 0;
  const currentIncome = wholesalerData.totalIncome || 0;

  if (
    monthlyWholesale < currentWholesale ||
    parseFloat(monthlyIncome) < currentIncome
  ) {
    return {
      success: false,
      message:
        "Wholesale / Income values cannot be less than your current highest values.",
    };
  }

  const { data: currentUser } = await supabase
    .from("wholesalers")
    .select("firstName, middleName, lastName")
    .eq("email", user?.email)
    .single();

  const { data: reportData, error: reportError } = await supabase
    .from("reports")
    .insert({
      createdBy: `${currentUser?.firstName} ${currentUser?.middleName[0]}. ${currentUser?.lastName}`,
      wholesalerId: idNumber,
      fullName,
      wholesale: monthlyWholesale,
      income: parseFloat(monthlyIncome),
      cmir: parseFloat(consolidatedMonthlyIncome),
      ssCMIR: ssCMIRUrl,
      msr: mmppSummaryReport,
      ssMSR: ssMSRUrl,
      food: consolidatedMonthlyFoodIncome,
      agree,
    });

  if (reportError) {
    return { success: false, message: reportError.message };
  }

  const currentAchievements = wholesalerData.achievements || {
    bigLeagueCircle: [],
    wealthBuildersCircle: [],
  };

  // Calculate achievements based on the submitted totals
  const newAchievements = {
    bigLeagueCircle: BLC_TITLES.map(({ title, threshold }) => ({
      title,
      achieved:
        currentAchievements.bigLeagueCircle.find((a: any) => a.title === title)
          ?.achieved || monthlyWholesale >= threshold,
    })),
    wealthBuildersCircle: WBC_TITLES.map(({ title, threshold }) => ({
      title,
      achieved:
        currentAchievements.wealthBuildersCircle.find(
          (a: any) => a.title === title
        )?.achieved || parseFloat(monthlyIncome) >= threshold,
    })),
  };

  // Update wholesaler's achievements after the report is successfully submitted
  const { error: updateError } = await supabase
    .from("wholesalers")
    .update({
      totalWholesale: monthlyWholesale,
      totalIncome: parseFloat(monthlyIncome),
      achievements: newAchievements,
    })
    .eq("idNum", idNumber);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
    message: "Report submitted and achievements updated successfully.",
    data: reportData,
  };
}

export async function updateReportProof(
  reportId: string,
  ssCMIR: string,
  ssMSR: string
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("reports")
      .update({ ssCMIR, ssMSR })
      .eq("id", reportId)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      message: "Proof updated successfully",
      data,
    };
  } catch (error) {
    console.error("Proof update error:", error);
    return {
      success: false,
      message: "Failed to update proofs",
    };
  }
}
