import { useMemo, useRef, useState, useCallback } from "react";
import {
  Backpack,
  Download,
  Plus,
  Trash2,
  Upload,
  ListTodo,
  Layers,
  Share2,
  Users,
  AlertTriangle,
  X,
  MapPin,
} from "lucide-react";
import { usePackStore } from "@/store/usePackStore";
import { cn } from "@/lib/utils";
import { ProgressHeader } from "@/components/ProgressHeader";
import { SearchBar } from "@/components/SearchBar";
import { CategoryBlock } from "@/components/CategoryBlock";
import { ItemFormModal } from "@/components/ItemFormModal";
import { CategoryDrawer } from "@/components/CategoryDrawer";
import { ShareModal } from "@/components/ShareModal";
import { TripSwitcher } from "@/components/TripSwitcher";
import { MergePreviewModal } from "@/components/MergePreviewModal";
import { downloadBackup, parseBackup, parseTextImport } from "@/lib/backup";
import { computeDiff, applyMerge, type DiffResult } from "@/lib/diff";
import type { Item, Category } from "@/types";

export default function Home() {
  const trips = usePackStore((s) => s.trips);
  const currentTripId = usePackStore((s) => s.currentTripId);
  const initialized = usePackStore((s) => s.initialized);
  const initIfEmpty = usePackStore((s) => s.initIfEmpty);
  const clearItems = usePackStore((s) => s.clearItems);
  const importFromBackup = usePackStore((s) => s.importFromBackup);
  const addItems = usePackStore((s) => s.addItems);

  const trip = useMemo(
    () => trips.find((t) => t.id === currentTripId) ?? null,
    [trips, currentTripId]
  );

  const [search, setSearch] = useState("");
  const [onlyUnpacked, setOnlyUnpacked] = useState(false);
  const [viewMode, setViewMode] = useState<"category" | "person" | "location">("category");
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>(undefined);
  const [defaultPerson, setDefaultPerson] = useState<string>("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [tripSwitcherOpen, setTripSwitcherOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearInput, setClearInput] = useState("");
  const [mergePreviewOpen, setMergePreviewOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{
    items: Item[];
    categories: Category[];
    title: string;
  } | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  useMemo(() => {
    if (!initialized) initIfEmpty();
  }, [initialized, initIfEmpty]);

  if (!trip) return null;

  const sortedCategories = [...trip.categories].sort((a, b) => a.order - b.order);

  const persons = useMemo(() => {
    const set = new Set<string>();
    trip.items.forEach((item) => {
      if (item.note && item.note.includes("：")) {
        const parts = item.note.split("：");
        if (parts.length >= 2) {
          set.add(parts[0]);
        }
      }
    });
    return Array.from(set).sort();
  }, [trip.items]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    trip.items.forEach((item) => {
      if (item.location && item.location.trim()) {
        set.add(item.location.trim());
      }
    });
    const result = Array.from(set).sort();
    if (result.length === 0) return [];
    return result;
  }, [trip.items]);

  const filteredItemsByCategory = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const map: Record<string, Item[]> = {};
    for (const cat of sortedCategories) {
      let list = trip.items.filter((i) => i.categoryId === cat.id);
      if (onlyUnpacked) list = list.filter((i) => !i.packed);
      if (selectedPerson) {
        list = list.filter((i) => i.note?.startsWith(selectedPerson + "：") ?? false);
      }
      if (kw) {
        list = list.filter((i) => i.name.toLowerCase().includes(kw) || (i.note ?? "").toLowerCase().includes(kw));
      }
      map[cat.id] = list;
    }
    return map;
  }, [trip.items, sortedCategories, search, onlyUnpacked, selectedPerson]);

  const filteredItemsByPerson = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const map: Record<string, Item[]> = {};
    const personsMap: Record<string, Item[]> = {};

    trip.items.forEach((item) => {
      let person = "未分配";
      if (item.note && item.note.includes("：")) {
        const parts = item.note.split("：");
        if (parts.length >= 2) {
          person = parts[0];
        }
      }
      if (!personsMap[person]) personsMap[person] = [];
      personsMap[person].push(item);
    });

    for (const [person, items] of Object.entries(personsMap)) {
      let list = [...items];
      if (onlyUnpacked) list = list.filter((i) => !i.packed);
      if (kw) {
        list = list.filter((i) => i.name.toLowerCase().includes(kw) || (i.note ?? "").toLowerCase().includes(kw));
      }
      map[person] = list;
    }
    return map;
  }, [trip.items, search, onlyUnpacked]);

  const filteredItemsByLocation = useMemo(() => {
    const kw = search.trim().toLowerCase();
    const map: Record<string, Item[]> = {};
    const locationsMap: Record<string, Item[]> = {};

    trip.items.forEach((item) => {
      const loc = item.location?.trim() || "未指定位置";
      if (!locationsMap[loc]) locationsMap[loc] = [];
      locationsMap[loc].push(item);
    });

    for (const [loc, items] of Object.entries(locationsMap)) {
      let list = [...items];
      if (onlyUnpacked) list = list.filter((i) => !i.packed);
      if (kw) {
        list = list.filter((i) => i.name.toLowerCase().includes(kw) || (i.note ?? "").toLowerCase().includes(kw));
      }
      map[loc] = list;
    }
    return map;
  }, [trip.items, search, onlyUnpacked]);

  const visiblePersons = useMemo(() => {
    const allKeys = Object.keys(filteredItemsByPerson);
    if (!selectedPerson) return allKeys;
    return allKeys.filter((p) => p === selectedPerson);
  }, [filteredItemsByPerson, selectedPerson]);

  const visibleLocations = useMemo(() => {
    const allKeys = Object.keys(filteredItemsByLocation);
    if (!selectedLocation) return allKeys;
    return allKeys.filter((l) => l === selectedLocation);
  }, [filteredItemsByLocation, selectedLocation]);

  const hasAnyItems = trip.items.length > 0;
  const isEmpty = !hasAnyItems && trip.categories.length === 0;

  const openAdd = useCallback((categoryId?: string, person?: string) => {
    setEditingItem(null);
    setDefaultCategoryId(categoryId);
    setDefaultPerson(person ?? "");
    setItemModalOpen(true);
  }, []);

  const openEdit = useCallback((item: Item) => {
    setEditingItem(item);
    setDefaultCategoryId(undefined);
    setDefaultPerson("");
    setItemModalOpen(true);
  }, []);

  const handleClearItems = useCallback(() => {
    setClearConfirmOpen(true);
    setClearInput("");
  }, []);

  const confirmClearItems = useCallback(() => {
    if (clearInput.trim() === "确认清空") {
      clearItems();
      setClearConfirmOpen(false);
      setClearInput("");
    }
  }, [clearInput, clearItems]);

  const handleImportFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const data = parseBackup(text);
      if (data) {
        if (trip.items.length > 0) {
          setPendingImport({
            items: data.items,
            categories: data.categories,
            title: data.title,
          });
          setMergePreviewOpen(true);
          setImportModalOpen(false);
        } else {
          importFromBackup(data);
          setImportModalOpen(false);
        }
      } else {
        const parsedItems = parseTextImport(text, trip.categories);
        if (parsedItems && parsedItems.length > 0) {
          addItems(parsedItems);
          setImportModalOpen(false);
          alert(`成功导入 ${parsedItems.length} 件物品！`);
        } else {
          alert("文件格式不正确，请选择 Packwell 导出的 .json 备份文件或文本文件。");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [trip.categories, trip.items.length, importFromBackup, addItems]);

  const handleTextImport = useCallback((text: string) => {
    const parsedItems = parseTextImport(text, trip.categories);
    if (parsedItems && parsedItems.length > 0) {
      addItems(parsedItems);
      setImportModalOpen(false);
      alert(`成功导入 ${parsedItems.length} 件物品！`);
    } else {
      alert("无法识别的格式，请按照模板格式输入。");
    }
  }, [trip.categories, addItems]);

  const handleMerge = useCallback((items: Item[], categories: Category[]) => {
    const idx = usePackStore.getState().trips.findIndex((t) => t.id === currentTripId);
    if (idx === -1) return;
    const trips = [...usePackStore.getState().trips];
    trips[idx] = {
      ...trips[idx],
      categories,
      items: items.map((item, i) => ({ ...item, order: i })),
      updatedAt: Date.now(),
    };
    usePackStore.setState({ trips });
    setPendingImport(null);
  }, [currentTripId]);

  const handleReplace = useCallback((items: Item[], categories: Category[]) => {
    const idx = usePackStore.getState().trips.findIndex((t) => t.id === currentTripId);
    if (idx === -1) return;
    const trips = [...usePackStore.getState().trips];
    trips[idx] = {
      ...trips[idx],
      categories,
      items: items.map((item, i) => ({ ...item, order: i })),
      updatedAt: Date.now(),
    };
    usePackStore.setState({ trips });
    setPendingImport(null);
  }, [currentTripId]);

  return (
    <div className="min-h-screen pb-24">
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 border-b border-dashed border-sand-300/70 bg-sand-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-tag bg-moss text-white">
              <Backpack size={20} />
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
              <ListTodo size={20} />
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
        <ProgressHeader trip={trip} />

        <SearchBar
          value={search}
          onChange={setSearch}
          onlyUnpacked={onlyUnpacked}
          onToggleOnlyUnpacked={setOnlyUnpacked}
        />

        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">
            物品清单 · {trip.items.length} 项
          </p>
          {hasAnyItems && (
            <div className="flex items-center gap-1 rounded-tag border border-dashed border-sand-300 bg-sand-50 p-1">
              <button
                className={`px-3 py-1 rounded-tag text-xs transition-colors ${viewMode === "category" ? "bg-moss text-white" : "text-ink-soft hover:text-ink"}`}
                onClick={() => { setViewMode("category"); setSelectedPerson(""); setSelectedLocation(""); }}
              >
                按分类
              </button>
              <button
                className={`px-3 py-1 rounded-tag text-xs transition-colors flex items-center gap-1 ${viewMode === "person" ? "bg-moss text-white" : "text-ink-soft hover:text-ink"}`}
                onClick={() => { setViewMode("person"); setSelectedLocation(""); }}
              >
                <Users size={12} /> 按人物
              </button>
              <button
                className={`px-3 py-1 rounded-tag text-xs transition-colors flex items-center gap-1 ${viewMode === "location" ? "bg-moss text-white" : "text-ink-soft hover:text-ink"}`}
                onClick={() => { setViewMode("location"); setSelectedPerson(""); }}
              >
                <MapPin size={12} /> 按位置
              </button>
            </div>
          )}
        </div>

        {viewMode === "person" && persons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-xs transition-colors ${!selectedPerson ? "bg-moss text-white" : "bg-sand-200 text-ink-soft hover:text-ink"}`}
              onClick={() => setSelectedPerson("")}
            >
              全部
            </button>
            {persons.map((person) => (
              <button
                key={person}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${selectedPerson === person ? "bg-moss text-white" : "bg-sand-200 text-ink-soft hover:text-ink"}`}
                onClick={() => setSelectedPerson(person)}
              >
                {person}
              </button>
            ))}
          </div>
        )}

        {viewMode === "location" && locations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 rounded-full text-xs transition-colors ${!selectedLocation ? "bg-moss text-white" : "bg-sand-200 text-ink-soft hover:text-ink"}`}
              onClick={() => setSelectedLocation("")}
            >
              全部
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${selectedLocation === loc ? "bg-moss text-white" : "bg-sand-200 text-ink-soft hover:text-ink"}`}
                onClick={() => setSelectedLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        )}

        {isEmpty ? (
          <EmptyState onAdd={() => openAdd()} />
        ) : viewMode === "person" ? (
          <div className="space-y-3">
            {Object.entries(filteredItemsByPerson)
              .filter(([person]) => !selectedPerson || person === selectedPerson)
              .map(([person, items]) => {
              if (items.length === 0 && search) return null;
              return (
                <div key={person} className="paper-card">
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-dashed border-sand-300/70">
                    <span className="flex h-10 w-10 items-center justify-center rounded-tag bg-lavender/15 text-lavender-deep">
                      <Users size={20} />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-base text-ink">{person}</h3>
                      <p className="font-mono text-[11px] text-ink-soft">
                        {items.filter(i => i.packed).length}/{items.length} 已打包
                      </p>
                    </div>
                  </div>
                  <ul className="divide-y divide-dashed divide-sand-300/70">
                    {items.map((item) => (
                      <li key={item.id} className="group px-4 py-3 transition-colors hover:bg-sand-100/50">
                        <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="pw-check mt-0.5"
                          checked={item.packed}
                          onChange={() => usePackStore.getState().togglePacked(item.id)}
                          aria-label={`${item.packed ? "取消勾选" : "勾选"} ${item.name}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className={cn("text-sm transition-colors break-words", item.packed ? "text-ink-soft line-through decoration-moss/60" : "text-ink")}>
                              {item.name}
                            </span>
                            {item.quantity > 1 && (
                              <span className="flex-shrink-0 font-mono text-[11px] text-ochre-deep">×{item.quantity}</span>
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
                            onClick={() => openEdit(item)}
                            aria-label="编辑"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-tag text-ink-soft transition-colors hover:bg-stamp/10 hover:text-stamp"
                            onClick={() => usePackStore.getState().removeItem(item.id)}
                            aria-label="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {search && Object.values(filteredItemsByPerson).every(items => items.length === 0) && (
              <div className="paper-card px-4 py-10 text-center">
                <p className="font-display text-base text-ink">没有匹配的物品</p>
                <p className="mt-1 text-xs text-ink-soft">试试换个关键词</p>
              </div>
            )}
          </div>
        ) : viewMode === "location" ? (
          <div className="space-y-3">
            {Object.entries(filteredItemsByLocation)
              .filter(([loc]) => !selectedLocation || loc === selectedLocation)
              .map(([loc, items]) => {
              if (items.length === 0 && search) return null;
              return (
                <div key={loc} className="paper-card">
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-dashed border-sand-300/70">
                    <span className="flex h-10 w-10 items-center justify-center rounded-tag bg-teal/15 text-teal-deep">
                      <MapPin size={20} />
                    </span>
                    <div className="flex-1">
                      <h3 className="font-display text-base text-ink">{loc}</h3>
                      <p className="font-mono text-[11px] text-ink-soft">
                        {items.filter(i => i.packed).length}/{items.length} 已打包
                      </p>
                    </div>
                  </div>
                  <ul className="divide-y divide-dashed divide-sand-300/70">
                    {items.map((item) => (
                      <li key={item.id} className="group px-4 py-3 transition-colors hover:bg-sand-100/50">
                        <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          className="pw-check mt-0.5"
                          checked={item.packed}
                          onChange={() => usePackStore.getState().togglePacked(item.id)}
                          aria-label={`${item.packed ? "取消勾选" : "勾选"} ${item.name}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className={cn("text-sm transition-colors break-words", item.packed ? "text-ink-soft line-through decoration-moss/60" : "text-ink")}>
                              {item.name}
                            </span>
                            {item.quantity > 1 && (
                              <span className="flex-shrink-0 font-mono text-[11px] text-ochre-deep">×{item.quantity}</span>
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
                            onClick={() => openEdit(item)}
                            aria-label="编辑"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button
                            className="flex h-9 w-9 items-center justify-center rounded-tag text-ink-soft transition-colors hover:bg-stamp/10 hover:text-stamp"
                            onClick={() => usePackStore.getState().removeItem(item.id)}
                            aria-label="删除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {search && Object.values(filteredItemsByLocation).every(items => items.length === 0) && (
              <div className="paper-card px-4 py-10 text-center">
                <p className="font-display text-base text-ink">没有匹配的物品</p>
                <p className="mt-1 text-xs text-ink-soft">试试换个关键词</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedCategories.length === 0 && (
              <div className="paper-card px-4 py-10 text-center">
                <p className="font-display text-base text-ink">暂无分类</p>
                <p className="mt-1 text-xs text-ink-soft">打开分类管理，添加你的第一个物品分类</p>
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
                <p className="mt-1 text-xs text-ink-soft">试试换个关键词，或关闭「仅看未打包」</p>
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
            onClick={() => setImportModalOpen(true)}
            title="导入清单"
          >
            <Upload size={22} />
            <span className="text-[10px]">导入</span>
          </button>
          <input
            ref={importFileRef}
            type="file"
            accept=".json,.txt,.md"
            className="hidden"
            onChange={handleImportFile}
          />
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

      <ItemFormModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        trip={trip}
        editing={editingItem}
        defaultCategoryId={defaultCategoryId}
        defaultPerson={defaultPerson}
      />
      <CategoryDrawer open={categoryOpen} onClose={() => setCategoryOpen(false)} trip={trip} />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} trip={trip} />
      <TripSwitcher open={tripSwitcherOpen} onClose={() => setTripSwitcherOpen(false)} />

      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onFileImport={() => importFileRef.current?.click()}
        onTextImport={handleTextImport}
      />

      <ClearConfirmModal
        open={clearConfirmOpen}
        inputValue={clearInput}
        onInputChange={setClearInput}
        onClose={() => { setClearConfirmOpen(false); setClearInput(""); }}
        onConfirm={confirmClearItems}
      />

      {pendingImport && (
        <MergePreviewModal
          open={mergePreviewOpen}
          onClose={() => { setMergePreviewOpen(false); setPendingImport(null); }}
          localItems={trip.items}
          remoteItems={pendingImport.items}
          localCategories={trip.categories}
          remoteCategories={pendingImport.categories}
          remoteTitle={pendingImport.title}
          onMerge={handleMerge}
          onReplace={handleReplace}
        />
      )}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="paper-card animate-fade-in px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-moss/40 text-moss">
        <Backpack size={28} />
      </div>
      <h2 className="font-display text-xl text-ink">准备出发了吗？</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">还没有任何物品。直接添加你的第一件行李吧。</p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <button className="btn-primary" onClick={onAdd}>
          <Plus size={18} /> 添加第一件
        </button>
      </div>
    </div>
  );
}

function ImportModal({
  open,
  onClose,
  onFileImport,
  onTextImport,
}: {
  open: boolean;
  onClose: () => void;
  onFileImport: () => void;
  onTextImport: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      onTextImport(text.trim());
      setText("");
    }
  };

  const template = `证件财物
- 护照 / 身份证
- 现金

衣物
- 内衣 ×7
- 袜子 ×7

电子设备
- 充电宝（备注：≤100Wh可登机）

洗漱护理
- 牙刷 / 牙膏
- 洗面奶（备注：分装≤100ml）`;

  const copyTemplate = () => {
    navigator.clipboard.writeText(template);
    alert("模板已复制到剪贴板！");
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className={`w-full max-w-md mx-4 bg-sand-50 rounded-tag shadow-paper animate-scale-in`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-sand-300/70">
          <div>
            <h2 className="font-display text-lg text-ink">导入清单</h2>
            <p className="text-xs text-ink-soft">从文件或文本导入物品</p>
          </div>
          <button className="icon-btn h-8 w-8" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="border border-dashed border-sand-300 rounded-tag p-4 text-center hover:bg-sand-100/50 cursor-pointer transition-colors" onClick={onFileImport}>
            <Upload size={24} className="mx-auto text-ink-soft mb-2" />
            <p className="text-sm text-ink">上传备份文件</p>
            <p className="text-xs text-ink-soft mt-1">支持 .json、.txt、.md 格式</p>
          </div>
          <div className="border-t border-dashed border-sand-300/70 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-soft">文本导入（按模板格式）</p>
              <button className="text-xs text-moss hover:text-moss-deep" onClick={copyTemplate}>复制模板</button>
            </div>
            <textarea
              className="field-input min-h-[120px] resize-none"
              placeholder="粘贴你的物品清单...&#10;&#10;分类名&#10;- 物品名 ×数量（备注）&#10;- 物品名"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-dashed border-sand-300/70">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>导入</button>
        </div>
      </div>
    </div>
  );
}

function ClearConfirmModal({
  open,
  inputValue,
  onInputChange,
  onClose,
  onConfirm,
}: {
  open: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isValid = inputValue.trim() === "确认清空";

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="w-full max-w-sm mx-4 bg-sand-50 rounded-tag shadow-paper animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dashed border-sand-300/70">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-tag bg-stamp/15 text-stamp">
              <AlertTriangle size={18} />
            </span>
            <h2 className="font-display text-lg text-ink">确认清空</h2>
          </div>
          <button className="icon-btn h-8 w-8" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-ink">
            此操作将删除当前清单中的<strong className="text-stamp">全部物品</strong>，分类将保留。
            <br />
            此操作<strong className="text-stamp">不可撤销</strong>。
          </p>
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
              请输入「确认清空」继续
            </p>
            <input
              className="field-input"
              placeholder="请输入：确认清空"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) onConfirm();
              }}
              autoFocus
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-dashed border-sand-300/70">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={!isValid}
            style={{ opacity: isValid ? 1 : 0.5, cursor: isValid ? "pointer" : "not-allowed" }}
          >
            确认清空
          </button>
        </div>
      </div>
    </div>
  );
}
