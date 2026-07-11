import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
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
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-sand-100/60"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-tag bg-moss/10 text-moss">
          <Icon size={17} />
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
              className="h-full rounded-full bg-ochre transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-ink-soft w-8 text-right">
            {progress.percent}%
          </span>
        </div>
        {collapsed ? (
          <ChevronRight size={16} className="text-ink-soft" />
        ) : (
          <ChevronDown size={16} className="text-ink-soft" />
        )}
      </button>

      {!collapsed && (
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
    <li className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-sand-100/50">
      <input
        type="checkbox"
        className="pw-check"
        checked={item.packed}
        onChange={onToggle}
        aria-label={`${item.packed ? "取消勾选" : "勾选"} ${item.name}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-sm transition-colors",
              item.packed
                ? "text-ink-soft line-through decoration-ochre/60"
                : "text-ink"
            )}
          >
            {item.name}
          </span>
          {item.quantity > 1 && (
            <span className="font-mono text-[11px] text-ochre-deep">
              ×{item.quantity}
            </span>
          )}
        </div>
        {item.note && (
          <p className="truncate text-[11px] italic text-ink-soft">
            {item.note}
          </p>
        )}
      </div>
      <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          className="icon-btn h-8 w-8"
          onClick={onEdit}
          aria-label="编辑"
        >
          <Pencil size={13} />
        </button>
        <button
          className="icon-btn h-8 w-8 hover:text-stamp"
          onClick={onRemove}
          aria-label="删除"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </li>
  );
}
