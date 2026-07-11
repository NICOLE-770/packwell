import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Copy,
  Download,
  FolderPlus,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Modal } from "./Modal";
import { usePackStore } from "@/store/usePackStore";
import { downloadBackup, parseBackup } from "@/lib/backup";
import { computeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

interface TripSwitcherProps {
  open: boolean;
  onClose: () => void;
}

export function TripSwitcher({ open, onClose }: TripSwitcherProps) {
  const trips = usePackStore((s) => s.trips);
  const currentTripId = usePackStore((s) => s.currentTripId);
  const switchTrip = usePackStore((s) => s.switchTrip);
  const createTrip = usePackStore((s) => s.createTrip);
  const createExampleTrip = usePackStore((s) => s.createExampleTrip);
  const renameTrip = usePackStore((s) => s.renameTrip);
  const duplicateTrip = usePackStore((s) => s.duplicateTrip);
  const deleteTrip = usePackStore((s) => s.deleteTrip);
  const importFromBackup = usePackStore((s) => s.importFromBackup);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) setRenamingId(null);
  }, [open]);

  const handleSwitch = (id: string) => {
    switchTrip(id);
    onClose();
  };

  const handleCreate = () => {
    const title = window.prompt("新清单名称", "我的旅行清单");
    if (title?.trim()) {
      createTrip(title.trim());
      onClose();
    }
  };

  const handleExample = () => {
    createExampleTrip();
    onClose();
  };

  const startRename = (id: string, current: string) => {
    setRenamingId(id);
    setRenameDraft(current);
  };

  const commitRename = () => {
    if (renamingId && renameDraft.trim()) {
      renameTrip(renamingId, renameDraft.trim());
    }
    setRenamingId(null);
  };

  const handleDuplicate = (id: string, title: string) => {
    const newTitle = window.prompt("副本名称", `${title}（副本）`);
    if (newTitle?.trim()) {
      duplicateTrip(id, newTitle.trim());
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`确认删除清单「${title}」？此操作不可撤销。`)) {
      deleteTrip(id);
    }
  };

  const handleExport = (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (trip) downloadBackup(trip);
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
        onClose();
      } else {
        alert("文件格式不正确，请选择 Packwell 导出的 .json 备份文件。");
      }
    };
    reader.readAsText(file);
    // 重置 input 以便再次选同一文件
    e.target.value = "";
  };

  const sorted = [...trips].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="我的清单"
      subtitle={`共 ${trips.length} 份清单，点击切换`}
      variant="drawer"
    >
      <div className="space-y-4">
        {/* 操作按钮组 */}
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary text-xs" onClick={handleCreate}>
            <Plus size={14} /> 新建清单
          </button>
          <button className="btn-secondary text-xs" onClick={handleExample}>
            <Sparkles size={14} /> 示例清单
          </button>
          <button
            className="btn-ghost text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} /> 导入备份
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>

        {/* 清单列表 */}
        <div className="space-y-1.5">
          {sorted.map((trip) => {
            const active = trip.id === currentTripId;
            const progress = computeProgress(trip.items);
            const isRenaming = renamingId === trip.id;

            return (
              <div
                key={trip.id}
                className={cn(
                  "group rounded-tag border border-dashed px-3 py-2.5 transition-colors",
                  active
                    ? "border-moss bg-moss/5"
                    : "border-sand-300 bg-sand-50 hover:bg-sand-100/60"
                )}
              >
                {isRenaming ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="field-input flex-1"
                      value={renameDraft}
                      autoFocus
                      onChange={(e) => setRenameDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") setRenamingId(null);
                      }}
                    />
                    <button className="btn-primary text-xs px-2 py-1" onClick={commitRename}>
                      保存
                    </button>
                    <button
                      className="icon-btn h-7 w-7"
                      onClick={() => setRenamingId(null)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {/* 点击切换 */}
                    <button
                      className="flex-1 min-w-0 text-left"
                      onClick={() => handleSwitch(trip.id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <p
                          className={cn(
                            "font-display text-sm truncate",
                            active ? "text-moss" : "text-ink"
                          )}
                        >
                          {trip.title}
                        </p>
                        {active && (
                          <span className="stamp-tag text-[9px]">当前</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-sand-300/60">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              active ? "bg-moss" : "bg-ochre/70"
                            )}
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-ink-soft">
                          {progress.packed}/{progress.total}
                        </span>
                        <span className="font-mono text-[10px] text-ink-soft">
                          {new Date(trip.updatedAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </button>

                    {/* 操作菜单 */}
                    <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        className="icon-btn h-7 w-7"
                        onClick={() => handleExport(trip.id)}
                        title="导出备份"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        className="icon-btn h-7 w-7"
                        onClick={() => handleDuplicate(trip.id, trip.title)}
                        title="复制为模板"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        className="icon-btn h-7 w-7"
                        onClick={() => startRename(trip.id, trip.title)}
                        title="重命名"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="icon-btn h-7 w-7 hover:text-stamp"
                        onClick={() => handleDelete(trip.id, trip.title)}
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 提示 */}
        <div className="rounded-tag border border-dashed border-sand-300 bg-sand-100/40 p-3">
          <p className="text-[11px] leading-relaxed text-ink-soft">
            <strong>复制为模板</strong>：基于旧清单创建副本，打包状态自动重置，适合重复使用常用行李清单。
            <br />
            <strong>导出备份</strong>：下载 .json 文件到本地，换设备时可通过「导入备份」恢复。
          </p>
        </div>
      </div>
    </Modal>
  );
}
