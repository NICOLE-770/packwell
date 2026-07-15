import type { BackupFile, Category, Trip } from "@/types";

export function createBackup(trip: Trip): BackupFile {
  return {
    version: 1,
    exportedAt: Date.now(),
    trip: {
      title: trip.title,
      categories: trip.categories,
      items: trip.items,
    },
  };
}

export function downloadBackup(trip: Trip): void {
  const backup = createBackup(trip);
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `packwell-${trip.title.replace(/[/\\?%*:|"<>]/g, "_")}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackup(text: string): { title: string; categories: BackupFile["trip"]["categories"]; items: BackupFile["trip"]["items"] } | null {
  try {
    const parsed = JSON.parse(text);
    if (parsed.version === 1 && parsed.trip) {
      const t = parsed.trip;
      if (typeof t.title === "string" && Array.isArray(t.categories) && Array.isArray(t.items)) {
        return t;
      }
    }
    if (typeof parsed.title === "string" && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
      return { title: parsed.title, categories: parsed.categories, items: parsed.items };
    }
    return null;
  } catch {
    return null;
  }
}

export function parseTextImport(text: string, categories: Category[]): { name: string; categoryId: string; quantity: number; note: string }[] | null {
  try {
    const lines = text.split(/\r?\n/);
    const items: { name: string; categoryId: string; quantity: number; note: string }[] = [];
    let currentCategory = categories[0]?.id || "";
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith("- ")) {
        let itemLine = trimmed.substring(2);
        let quantity = 1;
        let note = "";
        
        const noteMatch = itemLine.match(/（(.+?)）/);
        if (noteMatch) {
          note = noteMatch[1];
          itemLine = itemLine.replace(/（.+?）/, "").trim();
        }
        
        const quantityMatch = itemLine.match(/×(\d+)/);
        if (quantityMatch) {
          quantity = parseInt(quantityMatch[1], 10);
          itemLine = itemLine.replace(/×\d+/, "").trim();
        }
        
        if (itemLine) {
          items.push({
            name: itemLine,
            categoryId: currentCategory,
            quantity,
            note,
          });
        }
      } else {
        const cat = categories.find(c => c.name === trimmed || c.name.includes(trimmed) || trimmed.includes(c.name));
        if (cat) {
          currentCategory = cat.id;
        }
      }
    }
    
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}
