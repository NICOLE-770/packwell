import type { Item, Trip } from "@/types";

export interface ProgressInfo {
  total: number;
  packed: number;
  percent: number;
}

export function computeProgress(items: Item[]): ProgressInfo {
  const total = items.length;
  const packed = items.filter((i) => i.packed).length;
  const percent = total === 0 ? 0 : Math.round((packed / total) * 100);
  return { total, packed, percent };
}

export function computeCategoryProgress(
  trip: Trip,
  categoryId: string
): ProgressInfo {
  return computeProgress(trip.items.filter((i) => i.categoryId === categoryId));
}
