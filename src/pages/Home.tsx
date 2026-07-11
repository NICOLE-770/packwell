import { useMemo, useRef, useState } from "react";
import {
  Compass,
  Download,
  FolderTree,
  Layers,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  MapPin,
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
  const createExampleTrip = usePackStore((s) => s.createExampleTrip);
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
    <div className="min-h-screen pb-28 sm:pb-10">
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 border-b border-dashed border-sand-300/70 bg-sand-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-tag bg-moss text-sand-50">
              <Compass size={16} />
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
              className="btn-ghost hidden sm:inline-flex"
              onClick={() => setTripSwitcherOpen(true)}
            >
              <MapPin size={15} /> 我的清单
              <span className="ml-1 font-mono text-[10px] text-ink-soft">({trips.length})</span>
            </button>
            <button
              className="icon-btn sm:hidden"
              onClick={() => setTripSwitcherOpen(true)}
              aria-label="清单列表"
            >
              <MapPin size={18} />
            </button>
            <button
              className="btn-ghost hidden sm:inline-flex"
              onClick={() => setCategoryOpen(true)}
            >
              <Layers size={15} /> 分类管理
            </button>
            <button
              className="icon-btn sm:hidden"
              onClick={() => setCategoryOpen(true)}
              aria-label="分类管理"
            >
              <Layers size={18} />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        <ProgressHeader trip={trip} onOpenShare={() => setShareOpen(true)} />

        <SearchBar
          value={search}
          onChange={setSearch}
          onlyUnpacked={onlyUnpacked}
          onToggleOnlyUnpacked={setOnlyUnpacked}
        />

        {/* 操作行 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            物品清单 · {trip.items.length} 项
          </p>
          <div className="flex gap-1.5">
            <button
              className="btn-ghost text-xs"
              onClick={() => { createExampleTrip(); }}
              title="新建一份示例清单"
            >
              <Sparkles size={13} /> 示例
            </button>
            <button
              className="btn-ghost text-xs"
              onClick={() => setCategoryOpen(true)}
            >
              <FolderTree size={13} /> 分类
            </button>
            <button
              className="btn-ghost text-xs"
              onClick={() => downloadBackup(trip)}
              title="导出当前清单为 JSON 备份"
            >
              <Download size={13} /> 备份
            </button>
            <button
              className="btn-ghost text-xs"
              onClick={() => importFileRef.current?.click()}
              title="从 JSON 文件导入清单"
            >
              <Upload size={13} /> 导入
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
            {hasAnyItems && (
              <button
                className="btn-ghost text-xs hover:text-stamp"
                onClick={handleClearItems}
              >
                <Trash2 size={13} /> 清空
              </button>
            )}
          </div>
        </div>

        {/* 列表 / 空状态 */}
        {isEmpty ? (
          <EmptyState onLoadExample={() => createExampleTrip()} onAdd={() => openAdd()} />
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

      {/* 浮动添加按钮（移动端） */}
      <button
        onClick={() => openAdd()}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-moss text-sand-50 shadow-paper hover:bg-moss-light active:scale-95 transition-all sm:hidden"
        aria-label="添加物品"
      >
        <Plus size={24} />
      </button>

      {/* 桌面端添加按钮 */}
      <div className="fixed bottom-6 left-1/2 z-30 hidden -translate-x-1/2 sm:block">
        <button className="btn-primary shadow-paper" onClick={() => openAdd()}>
          <Plus size={16} /> 添加物品
        </button>
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
  onLoadExample,
  onAdd,
}: {
  onLoadExample: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="paper-card animate-fade-in px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-ochre/40 text-ochre-deep">
        <Compass size={28} />
      </div>
      <h2 className="font-display text-xl text-ink">准备出发了吗？</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
        还没有任何物品。可以从一份示例清单开始，或直接添加你的第一件行李。
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button className="btn-secondary" onClick={onLoadExample}>
          <Sparkles size={15} /> 载入示例清单
        </button>
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={15} /> 添加第一件
        </button>
      </div>
    </div>
  );
}
