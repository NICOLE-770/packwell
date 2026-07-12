import { useMemo, useRef, useState } from "react";
import {
  Compass,
  Download,
  Plus,
  Trash2,
  Upload,
  MapPin,
  Layers,
  Share2,
} from "lucide-react";
import { usePackStore } from "@/store/usePackStore";
import { ProgressHeader } from "@/components/ProgressHeader";
import { SearchBar } from "@/components/SearchBar";
import { CategoryBlock } from "@/components/CategoryBlock";
import { ItemFormModal } from "@/components/ItemFormModal";
import { CategoryDrawer } from "@/components/CategoryDrawer";
import { ShareModal } from "@/components/ShareModal";
import { TripSwitcher } from "@/components/TripSwitcher";
import { downloadBackup, parseBackup } from "@/lib/backup";
import type { Item } from "@/types";

export default function Home() {
  const trips = usePackStore((s) => s.trips);
  const currentTripId = usePackStore((s) => s.currentTripId);
  const initialized = usePackStore((s) => s.initialized);
  const initIfEmpty = usePackStore((s) => s.initIfEmpty);
  const clearItems = usePackStore((s) => s.clearItems);
  const importFromBackup = usePackStore((s) => s.importFromBackup);

  const trip = useMemo(
    () => trips.find((t) => t.id === currentTripId) ?? null,
    [trips, currentTripId]
  );

  const [search, setSearch] = useState("");
  const [onlyUnpacked, setOnlyUnpacked] = useState(false);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>(undefined);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tripSwitcherOpen, setTripSwitcherOpen] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // 初始化
  useMemo(() => {
    if (!initialized) initIfEmpty();
  }, [initialized, initIfEmpty]);

  if (!trip) return null;

  const sortedCategories = [...trip.categories].sort((a, b) => a.order - b.order);

  const filteredItemsByCategory = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const map: Record<string, Item[]> = {};
    for (const cat of sortedCategories) {
      let list = trip.items.filter((i) => i.categoryId === cat.id);
      if (onlyUnpacked) list = list.filter((i) => !i.packed);
      if (kw) list = list.filter((i) => i.name.toLowerCase().includes(kw) || (i.note ?? "").toLowerCase().includes(kw));
      map[cat.id] = list;
    }
    return map;
  }, [trip.items, sortedCategories, search, onlyUnpacked]);

  const hasAnyItems = trip.items.length > 0;
  const isEmpty = !hasAnyItems && trip.categories.length === 0;

  const openAdd = (categoryId?: string) => {
    setEditingItem(null);
    setDefaultCategoryId(categoryId);
    setItemModalOpen(true);
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setDefaultCategoryId(undefined);
    setItemModalOpen(true);
  };

  const handleClearItems = () => {
    if (window.confirm("确认清空当前清单的全部物品？分类将保留。")) {
      clearItems();
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const data = parseBackup(text);
      if (data) {
        importFromBackup(data);
      } else {
        alert("文件格式不正确，请选择 Packwell 导出的 .json 备份文件。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen pb-24">
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 border-b border-dashed border-sand-300/70 bg-sand-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-tag bg-moss text-white">
              <Compass size={20} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base text-ink">行囊 Packwell</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                Travel Checklist
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="icon-btn"
              onClick={() => setTripSwitcherOpen(true)}
              aria-label="清单列表"
            >
              <MapPin size={20} />
            </button>
            <button
              className="icon-btn"
              onClick={() => setCategoryOpen(true)}
              aria-label="分类管理"
            >
              <Layers size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-5 space-y-4">
        <ProgressHeader trip={trip} onOpenShare={() => setShareOpen(true)} />

        <SearchBar
          value={search}
          onChange={setSearch}
          onlyUnpacked={onlyUnpacked}
          onToggleOnlyUnpacked={setOnlyUnpacked}
        />

        {/* 物品计数 */}
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
          物品清单 · {trip.items.length} 项
        </p>

        {/* 列表 / 空状态 */}
        {isEmpty ? (
          <EmptyState onAdd={() => openAdd()} />
        ) : (
          <div className="space-y-3">
            {sortedCategories.length === 0 && (
              <div className="paper-card px-4 py-10 text-center">
                <p className="font-display text-base text-ink">暂无分类</p>
                <p className="mt-1 text-xs text-ink-soft">
                  打开分类管理，添加你的第一个物品分类
                </p>
              </div>
            )}
            {sortedCategories.map((cat) => {
              const items = filteredItemsByCategory[cat.id] ?? [];
              if (items.length === 0 && (search || onlyUnpacked)) return null;
              return (
                <CategoryBlock
                  key={cat.id}
                  category={cat}
                  items={items}
                  onEditItem={openEdit}
                />
              );
            })}
            {search && sortedCategories.every((cat) => (filteredItemsByCategory[cat.id]?.length ?? 0) === 0) && (
              <div className="paper-card px-4 py-10 text-center">
                <p className="font-display text-base text-ink">没有匹配的物品</p>
                <p className="mt-1 text-xs text-ink-soft">
                  试试换个关键词，或关闭「仅看未打包」
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-dashed border-sand-300/70 bg-sand-100/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-around px-2 py-2">
          <button
            className="flex flex-col items-center gap-0.5 rounded-tag px-3 py-1.5 text-ink-soft transition-colors hover:bg-sand-200/60 hover:text-moss"
            onClick={() => downloadBackup(trip)}
            title="导出当前清单为 JSON 备份"
          >
            <Download size={22} />
            <span className="text-[10px]">备份</span>
          </button>
          <button
            className="flex flex-col items-center gap-0.5 rounded-tag px-3 py-1.5 text-ink-soft transition-colors hover:bg-sand-200/60 hover:text-teal-deep"
            onClick={() => importFileRef.current?.click()}
            title="从 JSON 文件导入清单"
          >
            <Upload size={22} />
            <span className="text-[10px]">导入</span>
          </button>
          <input
            ref={importFileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />
          {/* 中间添加按钮 */}
          <button
            onClick={() => openAdd()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-moss text-white shadow-paper hover:bg-moss-light active:scale-95 transition-all"
            aria-label="添加物品"
          >
            <Plus size={26} />
          </button>
          <button
            className="flex flex-col items-center gap-0.5 rounded-tag px-3 py-1.5 text-ink-soft transition-colors hover:bg-sand-200/60 hover:text-lavender-deep"
            onClick={() => setShareOpen(true)}
            title="分享清单"
          >
            <Share2 size={22} />
            <span className="text-[10px]">分享</span>
          </button>
          {hasAnyItems && (
            <button
              className="flex flex-col items-center gap-0.5 rounded-tag px-3 py-1.5 text-ink-soft transition-colors hover:bg-sand-200/60 hover:text-stamp"
              onClick={handleClearItems}
              title="清空当前清单"
            >
              <Trash2 size={22} />
              <span className="text-[10px]">清空</span>
            </button>
          )}
        </div>
      </div>

      {/* 弹层 */}
      <ItemFormModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        trip={trip}
        editing={editingItem}
        defaultCategoryId={defaultCategoryId}
      />
      <CategoryDrawer open={categoryOpen} onClose={() => setCategoryOpen(false)} trip={trip} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} trip={trip} />
      <TripSwitcher open={tripSwitcherOpen} onClose={() => setTripSwitcherOpen(false)} />
    </div>
  );
}

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="paper-card animate-fade-in px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-moss/40 text-moss">
        <Compass size={28} />
      </div>
      <h2 className="font-display text-xl text-ink">准备出发了吗？</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
        还没有任何物品。直接添加你的第一件行李吧。
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={18} /> 添加第一件
        </button>
      </div>
    </div>
  );
}
