import type { BackupFile, Trip } from "@/types";

/** 将当前清单导出为 BackupFile JSON 对象 */
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

/** 触发浏览器下载 JSON 备份文件 */
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

/** 解析上传的 JSON 备份文件，返回其中的清单数据 */
export function parseBackup(text: string): { title: string; categories: BackupFile["trip"]["categories"]; items: BackupFile["trip"]["items"] } | null {
  try {
    const parsed = JSON.parse(text);
    // 兼容两种格式：BackupFile 或直接的 SharedPayload
    if (parsed.version === 1 && parsed.trip) {
      const t = parsed.trip;
      if (typeof t.title === "string" && Array.isArray(t.categories) && Array.isArray(t.items)) {
        return t;
      }
    }
    // 兼容 SharedPayload 格式
    if (typeof parsed.title === "string" && Array.isArray(parsed.categories) && Array.isArray(parsed.items)) {
      return { title: parsed.title, categories: parsed.categories, items: parsed.items };
    }
    return null;
  } catch {
    return null;
  }
}
