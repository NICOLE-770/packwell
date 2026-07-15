import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Compass, Download, Lock } from "lucide-react";
import { decodeShare } from "@/lib/share";
import { computeProgress } from "@/lib/progress";
import { getCategoryIcon } from "@/lib/icons";
import { usePackStore } from "@/store/usePackStore";
import { MergePreviewModal } from "@/components/MergePreviewModal";
import type { Item, Category } from "@/types";

export default function Share() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const payload = useMemo(() => decodeShare(params.get("d")), [params]);
  const importFromPayload = usePackStore((s) => s.importFromPayload);
  const currentTrip = usePackStore((s) => s.currentTrip());
  const [mergePreviewOpen, setMergePreviewOpen] = useState(false);

  const handleImport = () => {
    if (currentTrip && currentTrip.items.length > 0) {
      setMergePreviewOpen(true);
    } else {
      importFromPayload(payload);
      navigate("/");
    }
  };

  const handleMerge = (items: Item[], categories: Category[]) => {
    const store = usePackStore.getState();
    const tripId = store.currentTripId;
    const trips = store.trips.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        title: payload.title,
        categories,
        items: items.map((item, i) => ({ ...item, order: i })),
        updatedAt: Date.now(),
      };
    });
    usePackStore.setState({ trips });
    navigate("/");
  };

  const handleReplace = (items: Item[], categories: Category[]) => {
    const store = usePackStore.getState();
    const tripId = store.currentTripId;
    const trips = store.trips.map((t) => {
      if (t.id !== tripId) return t;
      return {
        ...t,
        title: payload.title,
        categories,
        items: items.map((item, i) => ({ ...item, order: i })),
        updatedAt: Date.now(),
      };
    });
    usePackStore.setState({ trips });
    navigate("/");
  };

  return (
    <>
      {payload && currentTrip && currentTrip.items.length > 0 && (
        <MergePreviewModal
          open={mergePreviewOpen}
          onClose={() => { setMergePreviewOpen(false); navigate("/"); }}
          localItems={currentTrip.items}
          remoteItems={payload.items}
          localCategories={currentTrip.categories}
          remoteCategories={payload.categories}
          remoteTitle={payload.title}
          onMerge={handleMerge}
          onReplace={handleReplace}
        />
      )}
      {!payload ? (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="paper-card max-w-md p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-stamp/40 text-stamp">
              <AlertTriangle size={26} />
            </div>
            <h1 className="font-display text-xl text-ink">链接无效</h1>
            <p className="mt-2 text-sm text-ink-soft">
              这份共享清单链接已损坏或缺失数据，请向分享者重新获取。
            </p>
            <Link to="/" className="btn-primary mt-5 inline-flex">
              <ArrowLeft size={15} /> 返回我的清单
            </Link>
          </div>
        </div>
      ) : (
    <div className="min-h-screen pb-16">
      {/* 顶栏 */}
      <div className="sticky top-0 z-30 border-b border-dashed border-sand-300/70 bg-sand-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
          >
            <ArrowLeft size={14} /> 返回我的清单
          </Link>
          <span className="stamp-tag">
            <Lock size={11} /> 只读视图
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* 标题卡 */}
        <header className="paper-card relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-6 -top-6 select-none opacity-60">
            <div className="rounded-full border-2 border-dashed border-ochre/30 px-3 py-3 text-center">
              <div className="font-mono text-[9px] uppercase tracking-widest text-ochre-deep">
                Shared
              </div>
              <div className="font-display text-base leading-none text-ochre-deep">
                ✈
              </div>
            </div>
          </div>
          <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            共享清单 · 来自伙伴
          </p>
          <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight">
            {payload.title}
          </h1>
          <div className="mt-4">
            <div className="flex items-end justify-between">
              <span className="font-mono text-3xl text-moss tabular-nums">
                {computeProgress(payload.items).percent}
              </span>
              <span className="font-mono text-sm text-ink-soft">%</span>
              <span className="ml-2 text-xs text-ink-soft">
                {computeProgress(payload.items).packed} / {computeProgress(payload.items).total} 件已打包
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-300/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-moss to-ochre transition-all duration-500"
                style={{ width: `${computeProgress(payload.items).percent}%` }}
              />
            </div>
          </div>
          <p className="mt-3 font-mono text-[10px] text-ink-soft">
            导出于 {new Date(payload.exportedAt).toLocaleString("zh-CN")}
          </p>
        </header>

        {/* 导入为我的清单按钮 */}
        <button className="btn-primary w-full" onClick={handleImport}>
          <Download size={16} /> 导入为我的清单（可编辑副本）
        </button>
        <p className="-mt-3 text-center text-[11px] text-ink-soft">
          导入后打包状态自动重置，你可以在自己的清单中自由编辑
        </p>

        {/* 分类列表（只读） */}
        <div className="space-y-3">
          {[...payload.categories].sort((a, b) => a.order - b.order).map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const items = payload.items
              .filter((i) => i.categoryId === cat.id)
              .sort((a, b) => a.order - b.order);
            if (items.length === 0) return null;
            const catProgress = computeProgress(items);
            return (
              <section
                key={cat.id}
                className="paper-card overflow-hidden animate-fade-in"
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-tag bg-moss/10 text-moss">
                    <Icon size={17} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base text-ink leading-tight">
                      {cat.name}
                    </h3>
                    <p className="font-mono text-[11px] text-ink-soft">
                      {catProgress.packed}/{catProgress.total} 已打包
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {catProgress.percent}%
                  </span>
                </div>
                <ul className="divide-y divide-dashed divide-sand-300/70 border-t border-dashed border-sand-300/70">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span
                        className={
                          "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md border " +
                          (item.packed
                            ? "border-moss bg-moss text-sand-50"
                            : "border-ink-soft/50 bg-sand-50 text-transparent")
                        }
                      >
                        {item.packed ? "✓" : ""}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={
                              "text-sm " +
                              (item.packed
                                ? "text-ink-soft line-through decoration-ochre/60"
                                : "text-ink")
                            }
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
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* 底部提示 */}
        <div className="paper-card flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-tag bg-moss/10 text-moss">
            <Compass size={16} />
          </span>
          <p className="text-xs text-ink-soft">
            这是一份共享的只读清单快照。点击上方「导入为我的清单」即可将其保存为你的可编辑副本，或前往
            <Link to="/" className="ml-1 font-medium text-moss underline-offset-2 hover:underline">
              行囊 Packwell
            </Link>
            创建全新清单。
          </p>
        </div>
      </main>
    </div>
      )}
    </>
  );
}
