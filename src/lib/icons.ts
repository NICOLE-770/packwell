import {
  Wallet,
  Shirt,
  Droplets,
  Plug,
  Pill,
  Package,
  Backpack,
  Camera,
  BookOpen,
  Umbrella,
  Sun,
  Compass,
  Plane,
  Key,
  Footprints,
  Glasses,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Wallet,
  Shirt,
  Droplets,
  Plug,
  Pill,
  Package,
  Backpack,
  Camera,
  BookOpen,
  Umbrella,
  Sun,
  Compass,
  Plane,
  Key,
  Footprints,
  Glasses,
};

export function getCategoryIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Package;
}

export const CATEGORY_ICON_OPTIONS = Object.keys(ICON_MAP);
