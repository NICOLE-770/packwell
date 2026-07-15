import { useMemo } from "react";
import { AlertTriangle, Plus, Minus, RefreshCw, Check, X } from "lucide-react";
import { Modal } from "./Modal";
import { computeDiff, applyMerge, type DiffResult, type MergeChoice } from "@/lib/diff";
import type { Category, Item } from "@/types";

interface MergePreviewModalProps {
  open: boolean;
  onClose: () => void;
  localItems: Item[];
  remoteItems: Item[];
  localCategories: Category[];
  remoteCategories: Category[];
  remoteTitle: string;
  onMerge: (items: Item[], categories: Category[]) => void;
  onReplace: (items: Item[], categories: Category[]) => void;
}

export function MergePreviewModal({
  open,
  onClose,
  localItems,
  remoteItems,
  localCategories,
  remoteCategories,
  remoteTitle,
  onMerge,
  onReplace,
}: MergePreviewModalProps) {
  const diff = useMemo(
    () => computeDiff(localItems, remoteItems, localCategories, remoteCategories),
    [localItems, remoteItems, localCategories, remoteCategories]
  );

  const hasChanges =
    diff.remoteOnly.length > 0 ||
    diff.both.some((b) => b.different) ||
    diff.categoriesDiff.remoteOnly.length > 0;

  const handleSmartMerge = () => {
    const result = applyMerge(diff, { action: "smart" }, remoteItems, remoteCategories);
    onMerge(result.items, result.categories);
    onClose();
  };

  const handleUseRemote = () => {
    onReplace(remoteItems, remoteCategories);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="检测到数据差异"
      subtitle={`来自「${remoteTitle}」的数据与本地不同`}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn-secondary" onClick={handleSmartMerge}>
            智能合并
          </button>
          <button className="btn-primary" onClick={handleUseRemote}>
            使用新版本
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {!hasChanges && (
          <div className="text-center py-4">
            <Check size={32} className="mx-auto text-moss mb-2" />
            <p className="text-ink">数据完全一致，无需合并</p>
          </div>
        )}

        {hasChanges && (
          <>
            {diff.remoteOnly.length > 0 && (
              <div className="rounded-tag border border-dashed border-moss/40 bg-moss/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Plus size={16} className="text-moss" />
                  <span className="text-sm font-medium text-ink">
                    新增物品 ({diff.remoteOnly.length})
                  </span>
                </div>
                <ul className="text-xs text-ink-soft space-y-1 max-h-32 overflow-y-auto">
                  {diff.remoteOnly.slice(0, 10).map((item) => (
                    <li key={item.id} className="flex items-center gap-2">
                      <span>{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-ochre-deep">×{item.quantity}</span>
                      )}
                    </li>
                  ))}
                  {diff.remoteOnly.length > 10 && (
                    <li className="text-ink-soft/60">
                      ...还有 {diff.remoteOnly.length - 10} 项
                    </li>
                  )}
                </ul>
              </div>
            )}

            {diff.both.filter((b) => b.different).length > 0 && (
              <div className="rounded-tag border border-dashed border-ochre/40 bg-ochre/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw size={16} className="text-ochre-deep" />
                  <span className="text-sm font-medium text-ink">
                    已修改物品 ({diff.both.filter((b) => b.different).length})
                  </span>
                </div>
                <ul className="text-xs text-ink-soft space-y-1 max-h-32 overflow-y-auto">
                  {diff.both
                    .filter((b) => b.different)
                    .slice(0, 10)
                    .map(({ local, remote, changes }) => (
                      <li key={local.id} className="flex items-center gap-2 flex-wrap">
                        <span>{local.name}</span>
                        <div className="flex gap-1">
                          {changes.packed && (
                            <span className="px-1 rounded bg-sand-200 text-[10px]">
                              {remote.packed ? "已打包" : "未打包"}
                            </span>
                          )}
                          {changes.quantity && (
                            <span className="px-1 rounded bg-sand-200 text-[10px]">
                              ×{remote.quantity}
                            </span>
                          )}
                          {changes.note && (
                            <span className="px-1 rounded bg-sand-200 text-[10px]">
                              备注更新
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {diff.categoriesDiff.remoteOnly.length > 0 && (
              <div className="rounded-tag border border-dashed border-lavender/40 bg-lavender/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Plus size={16} className="text-lavender-deep" />
                  <span className="text-sm font-medium text-ink">
                    新增分类 ({diff.categoriesDiff.remoteOnly.length})
                  </span>
                </div>
                <ul className="text-xs text-ink-soft space-y-1">
                  {diff.categoriesDiff.remoteOnly.map((cat) => (
                    <li key={cat.id}>{cat.name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-tag border border-dashed border-sand-300 bg-sand-100/50 p-3">
              <p className="text-[11px] text-ink-soft leading-relaxed">
                <strong className="text-ink">智能合并</strong>：保留双方新增的物品，打包状态取最新值
                <br />
                <strong className="text-ink">使用新版本</strong>：完全用对方的数据覆盖本地
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}