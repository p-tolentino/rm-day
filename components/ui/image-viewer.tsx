import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export const ImageViewer = ({
  imageUrl,
  title,
}: {
  imageUrl: string;
  title: string;
}) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setHasError(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[600px] mt-4">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
          )}
          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Failed to load image
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={imageUrl}
              className={cn(
                "object-contain rounded-lg transition-opacity duration-200",
                isImageLoading ? "opacity-0" : "opacity-100"
              )}
              fill
              priority
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewer;
