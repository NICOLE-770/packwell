import type { Category, Item } from "@/types";

export interface DiffResult {
  localOnly: Item[];
  remoteOnly: Item[];
  both: {
    local: Item;
    remote: Item;
    different: boolean;
    changes: {
      name?: boolean;
      quantity?: boolean;
      packed?: boolean;
      note?: boolean;
      location?: boolean;
    };
  }[];
  categoriesDiff: {
    localOnly: Category[];
    remoteOnly: Category[];
    both: {
      local: Category;
      remote: Category;
      different: boolean;
    }[];
  };
}

export function computeDiff(
  localItems: Item[],
  remoteItems: Item[],
  localCategories: Category[],
  remoteCategories: Category[]
): DiffResult {
  const localMap = new Map(localItems.map((i) => [i.id, i]));
  const remoteMap = new Map(remoteItems.map((i) => [i.id, i]));

  const localOnly: Item[] = [];
  const remoteOnly: Item[] = [];
  const both: DiffResult["both"] = [];

  for (const [id, local] of localMap) {
    const remote = remoteMap.get(id);
    if (!remote) {
      localOnly.push(local);
    } else {
      const changes: DiffResult["both"][0]["changes"] = {};
      if (local.name !== remote.name) changes.name = true;
      if (local.quantity !== remote.quantity) changes.quantity = true;
      if (local.packed !== remote.packed) changes.packed = true;
      if ((local.note ?? "") !== (remote.note ?? "")) changes.note = true;
      if ((local.location ?? "") !== (remote.location ?? "")) changes.location = true;

      both.push({
        local,
        remote,
        different: Object.keys(changes).length > 0,
        changes,
      });
    }
  }

  for (const [id, remote] of remoteMap) {
    if (!localMap.has(id)) {
      remoteOnly.push(remote);
    }
  }

  const localCatMap = new Map(localCategories.map((c) => [c.id, c]));
  const remoteCatMap = new Map(remoteCategories.map((c) => [c.id, c]));

  const localOnlyCats: Category[] = [];
  const remoteOnlyCats: Category[] = [];
  const bothCats: DiffResult["categoriesDiff"]["both"] = [];

  for (const [id, local] of localCatMap) {
    const remote = remoteCatMap.get(id);
    if (!remote) {
      localOnlyCats.push(local);
    } else {
      bothCats.push({
        local,
        remote,
        different: local.name !== remote.name || local.icon !== remote.icon,
      });
    }
  }

  for (const [id, remote] of remoteCatMap) {
    if (!localCatMap.has(id)) {
      remoteOnlyCats.push(remote);
    }
  }

  return {
    localOnly,
    remoteOnly,
    both,
    categoriesDiff: {
      localOnly: localOnlyCats,
      remoteOnly: remoteOnlyCats,
      both: bothCats,
    },
  };
}

export interface MergeChoice {
  action: "keep-local" | "use-remote" | "smart";
}

export function applyMerge(
  diff: DiffResult,
  choice: MergeChoice,
  remoteItems: Item[],
  remoteCategories: Category[]
): { items: Item[]; categories: Category[] } {
  const items: Item[] = [];

  if (choice.action === "keep-local") {
    const remoteMap = new Map(remoteItems.map((i) => [i.id, i]));
    for (const item of diff.localOnly) {
      items.push(item);
    }
    for (const { local, remote } of diff.both) {
      items.push(local);
    }
    for (const item of diff.remoteOnly) {
      items.push({ ...item, packed: false });
    }
  } else if (choice.action === "use-remote") {
    for (const item of remoteItems) {
      items.push(item);
    }
  } else {
    for (const item of diff.localOnly) {
      items.push(item);
    }
    for (const { local, remote, changes } of diff.both) {
      const merged = { ...local };
      if (changes.packed) merged.packed = remote.packed;
      if (changes.quantity) merged.quantity = remote.quantity;
      if (changes.note) merged.note = remote.note;
      if (changes.location) merged.location = remote.location;
      items.push(merged);
    }
    for (const item of diff.remoteOnly) {
      items.push(item);
    }
  }

  const catIdSet = new Set(items.map((i) => i.categoryId));
  const categories: Category[] = [];

  const localCatMap = new Map(diff.categoriesDiff.localOnly.map((c) => [c.id, c]));
  const bothCatMap = new Map(diff.categoriesDiff.both.map((b) => [b.local.id, b]));

  const allCatIds = new Set([
    ...diff.categoriesDiff.localOnly.map((c) => c.id),
    ...diff.categoriesDiff.remoteOnly.map((c) => c.id),
    ...diff.categoriesDiff.both.map((b) => b.local.id),
  ]);

  for (const cat of remoteCategories) {
    categories.push(cat);
  }
  for (const cat of diff.categoriesDiff.localOnly) {
    if (!categories.find((c) => c.id === cat.id)) {
      categories.push(cat);
    }
  }

  categories.sort((a, b) => a.order - b.order);

  return { items, categories };
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function reindexItems(items: Item[], categories: Category[]): Item[] {
  const catOrder = new Map(categories.map((c, i) => [c.id, i]));
  return items.map((item, idx) => ({
    ...item,
    order: idx,
  }));
}