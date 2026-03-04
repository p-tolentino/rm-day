import {
  ACHIEVEMENT_IMAGES,
  AchievementTitle,
} from "@/app/wholesaler/profile/_components/profile-component";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export const AchievementViewer = ({
  title,
  achieved,
}: {
  title: AchievementTitle;
  achieved: boolean;
}) => {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <Image
        src={
          error
            ? ACHIEVEMENT_IMAGES.PLACEHOLDER
            : ACHIEVEMENT_IMAGES[title] || ACHIEVEMENT_IMAGES.PLACEHOLDER
        }
        alt={title}
        fill
        className={cn("object-contain", !achieved && "opacity-50 grayscale")}
        onError={() => setError(true)}
      />
    </div>
  );
};

export default AchievementViewer;
