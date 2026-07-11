export interface Category {
  id: string;
  name: string;
  icon: string; // lucide 图标名
  order: number;
}

export interface Item {
  id: string;
  categoryId: string;
  name: string;
  quantity: number;
  note?: string;
  packed: boolean;
  order: number;
}

export interface Trip {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  categories: Category[];
  items: Item[];
}

export interface SharedPayload {
  title: string;
  categories: Category[];
  items: Item[];
  exportedAt: number;
}

/** 导出文件的结构 */
export interface BackupFile {
  version: 1;
  exportedAt: number;
  trip: {
    title: string;
    categories: Category[];
    items: Item[];
  };
}

export type DraftItem = Omit<Item, "id" | "order" | "packed"> & {
  id?: string;
};

export const CATEGORY_ICONS = [
  "Wallet",
  "Shirt",
  "Droplets",
  "Plug",
  "Pill",
  "Package",
  "Backpack",
  "Camera",
  "BookOpen",
  "Umbrella",
  "Sun",
  "Compass",
  "Plane",
  "Key",
  "Footprints",
  "Glasses",
] as const;

export type CategoryIconName = (typeof CATEGORY_ICONS)[number];
