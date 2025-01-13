/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AchievementViewer from "@/components/ui/achievement-viewer";
import { AvatarUpdateButton } from "@/components/profile/update-avatar";
import { EditProfileDialog } from "./edit-profile";

type Achievement = {
  title: string;
  achieved: boolean;
};

export type AchievementTitle =
  | "DIAMOND"
  | "RUBY"
  | "EMERALD"
  | "SAPPHIRE"
  | "PLATINUM"
  | "1 MILLION DOLLAR"
  | "DARK HORSE"
  | "LEGEND"
  | "CHAMPION"
  | "PRESIDENT"
  | "AMBASSADOR"
  | "750K"
  | "500K"
  | "250K"
  | "100K"
  | "PROJECT 50K"
  | "PLACEHOLDER";

export type SubteamTitle =
  | "BLACK OPS"
  | "DREAM MAKERS"
  | "ELITE"
  | "EVEREST"
  | "GO GETTERS"
  | "HYBRID"
  | "MANGETAR"
  | "MAXIMIZE"
  | "PM7"
  | "SG"
  | "RAINMAKERS"
  | "ADMIN"
  | "PLACEHOLDER";

export const ACHIEVEMENT_IMAGES: Record<AchievementTitle, string> = {
  // TODO: UPDATE IMAGES

  // Big League Circle (BLC) Titles
  DIAMOND: "/images/achievements/diamond.png",
  RUBY: "/images/achievements/ruby.png",
  EMERALD: "/images/achievements/emerald.png",
  SAPPHIRE: "/images/achievements/sapphire.png",
  PLATINUM: "/images/achievements/platinum.png",

  // Wealth Builders Circle (WBC) Titles
  "1 MILLION DOLLAR": "/images/achievements/million-dollar.png",
  "DARK HORSE": "/images/achievements/dark-horse.png",
  LEGEND: "/images/achievements/legend.png",
  CHAMPION: "/images/achievements/champion.png",
  PRESIDENT: "/images/achievements/president.png",
  AMBASSADOR: "/images/achievements/ambassador.png",
  "750K": "/images/achievements/750k.png",
  "500K": "/images/achievements/500k.png",
  "250K": "/images/achievements/250k.png",
  "100K": "/images/achievements/100k.png",
  "PROJECT 50K": "/images/achievements/50k.png",

  // Placeholder for missing images
  PLACEHOLDER: "/images/achievements/placeholder.png",
};

export const SUBTEAM_IMAGES: Record<SubteamTitle, string> = {
  // TODO: UPDATE IMAGES

  "BLACK OPS": "/images/subteams/black-ops.jpg",
  "DREAM MAKERS": "/images/subteams/dream-makers.jpg",
  ELITE: "/images/subteams/elite.jpg",
  EVEREST: "/images/subteams/everest.jpg",
  "GO GETTERS": "/images/subteams/go-getters.jpg",
  HYBRID: "/images/subteams/hybrid.jpg",
  MANGETAR: "/images/subteams/magnetar.png",
  MAXIMIZE: "/images/subteams/maximize.jpg",
  PM7: "/images/subteams/pm7.jpg",
  RAINMAKERS: "/images/subteams/rainmakers.png",
  SG: "/images/subteams/sg.jpg",

  // ADMIN
  ADMIN: "/images/subteams/rm.png",

  // Placeholder for missing images
  PLACEHOLDER: "/images/subteams/placeholder.png",
};

// TODO: TYPE SAFETY FOR USER DATATYPE
export default function ProfilePage({
  profile,
  wholesalers,
}: {
  profile: any;
  wholesalers: any[];
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="relative aspect-square w-full max-w-[325px]">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt="Profile Picture"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              ) : (
                <Skeleton className="w-auto h-full rounded-md opacity-10" />
              )}

              <AvatarUpdateButton
                idNum={profile.idNum}
                currentAvatarUrl={profile.avatar}
              />
            </div>
            <div className="relative aspect-square w-full max-w-[325px]">
              {/* // TODO: SUBTEAM LOGO */}

              {profile.subTeam ? (
                <Image
                  src={
                    SUBTEAM_IMAGES[profile.subTeam as SubteamTitle] ||
                    SUBTEAM_IMAGES.PLACEHOLDER
                  }
                  alt="Subteam Logo"
                  fill
                  className="object-contain rounded-xl"
                  priority
                />
              ) : (
                <Skeleton className="w-auto h-full rounded-md opacity-10" />
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Personal Information
                <EditProfileDialog
                  profile={profile}
                  wholesalers={wholesalers}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">ID NUMBER</Label>
                  <p className="text-sm">{profile.idNum}</p>
                </div>
                <div>
                  <Label className="text-gray-400">COMPLETE NAME</Label>
                  <p className="text-sm">
                    {`${profile.firstName} ${
                      profile.middleName && profile.middleName[0]
                    }${profile.middleName && `. `}${profile.lastName}`}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">BIRTHDATE</Label>
                  <p className="text-sm">
                    {new Date(profile.dob).toLocaleDateString("en-PH")}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">LOCATION</Label>
                  <p className="text-sm">
                    {`${profile.city}${profile.city && `,`} ${profile.country}`}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">PROFESSION</Label>
                  <p className="text-sm">{profile.profession}</p>
                </div>
                <div>
                  <Label className="text-gray-400">SPONSOR</Label>
                  <p className="text-sm">{profile.sponsor}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>BIG LEAGUE CIRCLE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6 justify-center">
                {profile.achievements.bigLeagueCircle.map(
                  (achievement: Achievement) => (
                    <div
                      key={achievement.title}
                      className="flex flex-col items-center"
                    >
                      <AchievementViewer
                        title={achievement.title as AchievementTitle}
                        achieved={achievement.achieved}
                      />
                      {ACHIEVEMENT_IMAGES[
                        achievement.title as AchievementTitle
                      ] === ACHIEVEMENT_IMAGES.PLACEHOLDER && (
                        <span
                          className={cn(
                            "text-xs font-medium text-center",
                            !achievement.achieved && "text-gray-300 opacity-50"
                          )}
                        >
                          {achievement.title}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>WEALTH BUILDERS CIRCLE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 justify-center">
                {profile.achievements.wealthBuildersCircle.map(
                  (achievement: Achievement) => (
                    <div
                      key={achievement.title}
                      className="flex flex-col items-center gap-2"
                    >
                      <AchievementViewer
                        title={achievement.title as AchievementTitle}
                        achieved={achievement.achieved}
                      />

                      <span
                        className={cn(
                          "text-xs font-medium text-center",
                          !achievement.achieved && "text-gray-300 opacity-50"
                        )}
                      >
                        {achievement.title}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
