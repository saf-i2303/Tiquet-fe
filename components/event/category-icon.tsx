import { Mic, Music, Smile, Tent, Volleyball, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import type { EventCategory } from "@/types/event";

const icons: Record<EventCategory, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  music: Music,
  conference: Mic,
  comedy: Smile,
  workshop: Wrench,
  festival: Tent,
  sport: Volleyball,
};

export function CategoryIcon({
  category,
  className,
  strokeWidth = 1.75,
}: {
  category: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = icons[category as EventCategory] ?? Music;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
