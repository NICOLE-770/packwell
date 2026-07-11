import LZString from "lz-string";
import type { SharedPayload, Trip } from "@/types";

/** 将清单数据编码为 URL 压缩字符串 */
export function encodeShare(trip: Trip): string {
  const payload: SharedPayload = {
    title: trip.title,
    categories: trip.categories,
    items: trip.items,
    exportedAt: Date.now(),
  };
  return LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

/** 从 URL 压缩字符串解码清单数据 */
export function decodeShare(d: string | null): SharedPayload | null {
  if (!d) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(d);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharedPayload;
    if (!parsed.title || !Array.isArray(parsed.categories) || !Array.isArray(parsed.items)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** 生成完整共享链接 */
export function buildShareUrl(trip: Trip): string {
  const d = encodeShare(trip);
  const base = `${window.location.origin}${window.location.pathname}`;
  const sharePath = `${base}#/share?d=${d}`;
  return sharePath;
}

/** 将清单导出为纯文本，便于粘贴到聊天/邮件 */
export function exportPlainText(trip: Trip): string {
  const lines: string[] = [];
  lines.push(`# ${trip.title}`);
  lines.push("");

  const packedCount = trip.items.filter((i) => i.packed).length;
  lines.push(`打包进度：${packedCount} / ${trip.items.length}`);
  lines.push("");

  const sortedCats = [...trip.categories].sort((a, b) => a.order - b.order);
  for (const cat of sortedCats) {
    const catItems = trip.items
      .filter((i) => i.categoryId === cat.id)
      .sort((a, b) => a.order - b.order);
    if (catItems.length === 0) continue;
    lines.push(`【${cat.name}】`);
    for (const it of catItems) {
      const mark = it.packed ? "[x]" : "[ ]";
      const qty = it.quantity > 1 ? ` ×${it.quantity}` : "";
      const note = it.note ? `  — ${it.note}` : "";
      lines.push(`  ${mark} ${it.name}${qty}${note}`);
    }
    lines.push("");
  }
  lines.push(`—— 由「行囊 Packwell」生成`);
  return lines.join("\n");
}
