import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { usePackStore } from "@/store/usePackStore";
import { getCategoryIcon } from "@/lib/icons";
import { computeProgress } from "@/lib/progress";
import type { Category, Item } from "@/types";
import { cn } from "@/lib/utils";

interface CategoryBlockProps {
  category: Category;
  items: Item[];
  onEditItem: (item: Item) => void;
}

export function CategoryBlock({ category, items, onEditItem }: CategoryBlockProps) {
  const togglePacked = usePackStore((s) => s.togglePacked);
  const removeItem = usePackStore((s) => s.removeItem);
  const [collapsed, setCollapsed] = useState(true);

  const progress = useMemo(
    () => computeProgress(items),
    [items]
  );

  const Icon = getCategoryIcon(category.icon);
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <section className="paper-card overflow-hidden animate-fade-in">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-sand-100/60"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-tag bg-teal/15 text-teal-deep">
          <Icon size={24} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base text-ink leading-tight">
            {category.name}
          </h3>
          <p className="font-mono text-[11px] text-ink-soft">
            {progress.packed}/{progress.total} 已打包
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-sand-300/60">
            <div
              className="h-full rounded-full bg-moss transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-soft w-8 text-right">
            {progress.percent}%
          </span>
        </div>
        {collapsed ? (
          <ChevronRight size={20} className="text-ink-soft" />
        ) : (
          <ChevronDown size={20} className="text-ink-soft" />
        )}
      </button>

      {!collapsed && (
        <div>
          <ul className="divide-y divide-dashed divide-sand-300/70 border-t border-dashed border-sand-300/70">
            {sortedItems.length === 0 ? (
              <li className="px-4 py-5 text-center text-xs text-ink-soft">
                该分类下暂无物品
              </li>
            ) : (
              sortedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => togglePacked(item.id)}
                  onEdit={() => onEditItem(item)}
                  onRemove={() => removeItem(item.id)}
                />
              ))
            )}
          </ul>
        </div>
      )}
    </section>
  );
}

interface ItemRowProps {
  item: Item;
  onToggle: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function ItemRow({ item, onToggle, onEdit, onRemove }: ItemRowProps) {
  return (
    <li className="group px-4 py-3 transition-colors hover:bg-sand-100/50">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          className="pw-check mt-0.5"
          checked={item.packed}
          onChange={onToggle}
          aria-label={`${item.packed ? "取消勾选" : "勾选"} ${item.name}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span
              className={cn(
                "text-sm transition-colors break-words",
                item.packed
                  ? "text-ink-soft line-through decoration-moss/60"
                  : "text-ink"
              )}
            >
              {item.name}
            </span>
            {item.quantity > 1 && (
              <span className="flex-shrink-0 font-mono text-[11px] text-ochre-deep">
                ×{item.quantity}
              </span>
            )}
            {item.location && (
              <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-tag bg-sand-200 text-[10px] text-ink-soft">
                <MapPin size={10} />{item.location}
              </span>
            )}
          </div>
          {item.note && (
            <p className="text-[12px] italic text-ink-soft whitespace-pre-wrap break-words mt-0.5">
              {item.note}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 justify-end">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-tag text-ink-soft transition-colors hover:bg-teal/15 hover:text-teal-deep"
          onClick={onEdit}
          aria-label="编辑"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-tag text-ink-soft transition-colors hover:bg-stamp/10 hover:text-stamp"
          onClick={onRemove}
          aria-label="删除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
      </div>
    </li>
  );
}
