import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onlyUnpacked: boolean;
  onToggleOnlyUnpacked: (v: boolean) => void;
}

export function SearchBar({
  value,
  onChange,
  onlyUnpacked,
  onToggleOnlyUnpacked,
}: SearchBarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
        />
        <input
          className="field-input pl-9 pr-9"
          placeholder="搜索物品名称…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn h-7 w-7"
            aria-label="清空"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 rounded-tag border border-dashed border-sand-300 bg-sand-50 px-3 py-2 cursor-pointer select-none">
        <input
          type="checkbox"
          className="pw-check"
          checked={onlyUnpacked}
          onChange={(e) => onToggleOnlyUnpacked(e.target.checked)}
        />
        <span className="text-xs text-ink-soft whitespace-nowrap">仅看未打包</span>
      </label>
    </div>
  );
}
