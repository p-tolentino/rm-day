/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import AchievementViewer from "@/components/ui/achievement-viewer";
import { EditProfileDialog } from "./edit-profile";
import { AvatarUpdateButton } from "@/components/profile/update-avatar";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Briefcase,
  Hash,
  Users,
  Award,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

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
  | "SUPERADMIN"
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
  SUPERADMIN: "/images/subteams/rm.png",

  // Placeholder for missing images
  PLACEHOLDER: "/images/subteams/placeholder.png",
};

// Rank order for Big League Circle (highest to lowest)
const BLC_ORDER: AchievementTitle[] = [
  "DIAMOND",
  "RUBY",
  "EMERALD",
  "SAPPHIRE",
  "PLATINUM",
];

// Rank order for Wealth Builders Circle (highest to lowest)
const WBC_ORDER: AchievementTitle[] = [
  "1 MILLION DOLLAR",
  "DARK HORSE",
  "LEGEND",
  "CHAMPION",
  "PRESIDENT",
  "AMBASSADOR",
  "750K",
  "500K",
  "250K",
  "100K",
  "PROJECT 50K",
];

// TODO: TYPE SAFETY FOR USER DATATYPE
export default function ProfilePage({
  profile,
  wholesalers,
}: {
  profile: any;
  wholesalers: any[];
}) {
  // Carousel hooks
  const [emblaRefBLC, emblaApiBLC] = useEmblaCarousel({
    align: "center",
    loop: false,
    skipSnaps: false,
    containScroll: "keepSnaps",
    startIndex: 0,
  });
  const [emblaRefWBC, emblaApiWBC] = useEmblaCarousel({
    align: "center",
    loop: false,
    skipSnaps: false,
    containScroll: "keepSnaps",
    startIndex: 0,
  });

  const [prevBtnDisabledBLC, setPrevBtnDisabledBLC] = useState(true);
  const [nextBtnDisabledBLC, setNextBtnDisabledBLC] = useState(true);
  const [prevBtnDisabledWBC, setPrevBtnDisabledWBC] = useState(true);
  const [nextBtnDisabledWBC, setNextBtnDisabledWBC] = useState(true);

  const [selectedIndexBLC, setSelectedIndexBLC] = useState(0);
  const [selectedIndexWBC, setSelectedIndexWBC] = useState(0);

  // Find highest achieved rank for BLC
  useEffect(() => {
    if (!profile.achievements?.bigLeagueCircle || !emblaApiBLC) return;
    const achievements = profile.achievements.bigLeagueCircle;
    for (const rank of BLC_ORDER) {
      const index = achievements.findIndex(
        (a: Achievement) => a.title === rank && a.achieved,
      );
      if (index !== -1) {
        setSelectedIndexBLC(index);
        emblaApiBLC.scrollTo(index);
        break;
      }
    }
  }, [profile.achievements, emblaApiBLC]);

  // Find highest achieved rank for WBC
  useEffect(() => {
    if (!profile.achievements?.wealthBuildersCircle || !emblaApiWBC) return;
    const achievements = profile.achievements.wealthBuildersCircle;
    for (const rank of WBC_ORDER) {
      const index = achievements.findIndex(
        (a: Achievement) => a.title === rank && a.achieved,
      );
      if (index !== -1) {
        setSelectedIndexWBC(index);
        emblaApiWBC.scrollTo(index);
        break;
      }
    }
  }, [profile.achievements, emblaApiWBC]);

  const scrollPrevBLC = useCallback(
    () => emblaApiBLC?.scrollPrev(),
    [emblaApiBLC],
  );
  const scrollNextBLC = useCallback(
    () => emblaApiBLC?.scrollNext(),
    [emblaApiBLC],
  );
  const scrollPrevWBC = useCallback(
    () => emblaApiWBC?.scrollPrev(),
    [emblaApiWBC],
  );
  const scrollNextWBC = useCallback(
    () => emblaApiWBC?.scrollNext(),
    [emblaApiWBC],
  );

  const onSelectBLC = useCallback(() => {
    if (!emblaApiBLC) return;
    setSelectedIndexBLC(emblaApiBLC.selectedScrollSnap());
    setPrevBtnDisabledBLC(!emblaApiBLC.canScrollPrev());
    setNextBtnDisabledBLC(!emblaApiBLC.canScrollNext());
  }, [emblaApiBLC]);

  const onSelectWBC = useCallback(() => {
    if (!emblaApiWBC) return;
    setSelectedIndexWBC(emblaApiWBC.selectedScrollSnap());
    setPrevBtnDisabledWBC(!emblaApiWBC.canScrollPrev());
    setNextBtnDisabledWBC(!emblaApiWBC.canScrollNext());
  }, [emblaApiWBC]);

  useEffect(() => {
    if (!emblaApiBLC) return;
    emblaApiBLC.on("select", onSelectBLC);
    onSelectBLC();
  }, [emblaApiBLC, onSelectBLC]);

  useEffect(() => {
    if (!emblaApiWBC) return;
    emblaApiWBC.on("select", onSelectWBC);
    onSelectWBC();
  }, [emblaApiWBC, onSelectWBC]);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-2 sm:px-4 w-full">
      <div className="container mx-auto max-w-7xl w-full">
        {/* Consolidated Profile Card with Images Beside Info */}
        <div className="mb-8 sm:mb-12 w-full">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-md border border-white/20 p-4 sm:p-6">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
              {/* Left column with stacked images */}
              <div className="flex flex-row gap-4 items-center md:items-start">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-gray-800">
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority
                      />
                    ) : (
                      <Image
                        src={SUBTEAM_IMAGES.PLACEHOLDER}
                        alt="Placeholder"
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                  <AvatarUpdateButton
                    idNum={profile.idNum}
                    currentAvatarUrl={profile.avatar}
                  />
                </div>

                {/* Subteam Logo */}
                <div className="relative shrink-0">
                  <div className="relative h-40 w-40 sm:h-48 sm:w-48 md:h-56 md:w-56 lg:h-64 lg:w-64 overflow-hidden rounded-xl border-4 border-white bg-white shadow-xl dark:border-gray-800 dark:bg-gray-800">
                    {profile.subTeam ? (
                      <Image
                        src={
                          SUBTEAM_IMAGES[profile.subTeam as SubteamTitle] ||
                          SUBTEAM_IMAGES.PLACEHOLDER
                        }
                        alt="Subteam"
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <Image
                        src={SUBTEAM_IMAGES.PLACEHOLDER}
                        alt="Placeholder"
                        fill
                        className="object-contain p-2"
                      />
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 rounded-full bg-gradient-to-r from-blue-600 to-red-600 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white shadow-lg">
                    {profile.subTeam || "No Subteam"}
                  </div>
                </div>
              </div>

              {/* Right column with info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent break-words">
                    {`${profile.firstName} ${profile.middleName ? profile.middleName.charAt(0) + "." : ""} ${profile.lastName}`}
                  </h1>
                  <EditProfileDialog
                    profile={profile}
                    wholesalers={wholesalers}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Wholesaler ID
                      </p>
                      <p className="font-medium text-sm truncate">
                        {profile.idNum}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Subteam
                      </p>
                      <p className="font-medium text-sm truncate">
                        {profile.subTeam || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Location
                      </p>
                      <p className="font-medium text-sm truncate">
                        {`${profile.city || ""}${profile.city && profile.country ? ", " : ""}${profile.country || ""}` ||
                          "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-green-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Profession
                      </p>
                      <p className="font-medium text-sm truncate">
                        {profile.profession || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        Sponsor
                      </p>
                      <p className="font-medium text-sm truncate">
                        {profile.sponsor || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Two‑column carousels for achievements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Big League Circle */}
          <Card className="overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
            <CardHeader className="border-b border-white/20 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="h-5 w-5 text-yellow-500" />
                Big League Circle
              </CardTitle>
            </CardHeader>
            <CardContent className="relative flex flex-col h-full">
              {/* Viewport with horizontal padding to allow centering of first/last slides */}
              <div
                className="overflow-hidden flex-1 px-8 sm:px-12 md:px-16"
                ref={emblaRefBLC}
              >
                <div className="flex h-full items-center">
                  {profile.achievements?.bigLeagueCircle.map(
                    (achievement: Achievement, index: number) => (
                      <div
                        key={achievement.title}
                        className={cn(
                          "flex-[0_0_90%] md:flex-[0_0_60%] min-w-0 transition-all duration-300 h-full flex items-center",
                          index === selectedIndexBLC
                            ? "opacity-100 scale-100"
                            : "opacity-30 blur-[2px] scale-90",
                        )}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-4 w-full">
                          <div
                            className={cn(
                              "relative transition-all duration-300 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52",
                              achievement.achieved
                                ? "drop-shadow-[0_0_20px_rgba(255,215,0,0.7)]"
                                : "grayscale",
                            )}
                          >
                            <AchievementViewer
                              title={achievement.title as AchievementTitle}
                              achieved={achievement.achieved}
                            />
                          </div>
                          {ACHIEVEMENT_IMAGES[
                            achievement.title as AchievementTitle
                          ] === ACHIEVEMENT_IMAGES.PLACEHOLDER && (
                            <span className="text-xs sm:text-sm font-semibold text-center px-2">
                              {achievement.title}
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 h-8 w-8 sm:h-9 sm:w-9"
                onClick={scrollPrevBLC}
                disabled={prevBtnDisabledBLC}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 h-8 w-8 sm:h-9 sm:w-9"
                onClick={scrollNextBLC}
                disabled={nextBtnDisabledBLC}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Wealth Builders Circle */}
          <Card className="overflow-hidden border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md min-h-[300px] sm:min-h-[350px] md:min-h-[400px]">
            <CardHeader className="border-b border-white/20 py-3 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Award className="h-5 w-5 text-purple-500" />
                Wealth Builders Circle
              </CardTitle>
            </CardHeader>
            <CardContent className="relative flex flex-col h-full">
              <div
                className="overflow-hidden flex-1 px-8 sm:px-12 md:px-16"
                ref={emblaRefWBC}
              >
                <div className="flex h-full items-center">
                  {profile.achievements?.wealthBuildersCircle.map(
                    (achievement: Achievement, index: number) => (
                      <div
                        key={achievement.title}
                        className={cn(
                          "flex-[0_0_90%] md:flex-[0_0_60%] min-w-0 transition-all duration-300 h-full flex items-center",
                          index === selectedIndexWBC
                            ? "opacity-100 scale-100"
                            : "opacity-30 blur-[2px] scale-90",
                        )}
                      >
                        <div className="flex flex-col items-center gap-2 sm:gap-4 w-full">
                          <div
                            className={cn(
                              "relative transition-all duration-300 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52",
                              achievement.achieved
                                ? "drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]"
                                : "grayscale",
                            )}
                          >
                            <AchievementViewer
                              title={achievement.title as AchievementTitle}
                              achieved={achievement.achieved}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 h-8 w-8 sm:h-9 sm:w-9"
                onClick={scrollPrevWBC}
                disabled={prevBtnDisabledWBC}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white dark:hover:bg-gray-700 disabled:opacity-30 h-8 w-8 sm:h-9 sm:w-9"
                onClick={scrollNextWBC}
                disabled={nextBtnDisabledWBC}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
