import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, GripVertical, Plus, Trash2, Pencil } from "lucide-react";
import { Modal } from "./Modal";
import { usePackStore } from "@/store/usePackStore";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/lib/icons";
import type { Category, Trip } from "@/types";

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
}

export function CategoryDrawer({ open, onClose, trip }: CategoryDrawerProps) {
  const addCategory = usePackStore((s) => s.addCategory);
  const updateCategory = usePackStore((s) => s.updateCategory);
  const removeCategory = usePackStore((s) => s.removeCategory);
  const moveCategory = usePackStore((s) => s.moveCategory);

  const sorted = [...trip.categories].sort((a, b) => a.order - b.order);

  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("Package");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("Package");

  useEffect(() => {
    if (!open) {
      setNewName("");
      setNewIcon("Package");
      setEditingId(null);
    }
  }, [open]);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addCategory(trimmed, newIcon);
    setNewName("");
    setNewIcon("Package");
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    updateCategory(editingId, { name: trimmed, icon: editIcon });
    setEditingId(null);
  };

  const handleRemove = (cat: Category) => {
    const count = trip.items.filter((i) => i.categoryId === cat.id).length;
    const msg =
      count > 0
        ? `「${cat.name}」下有 ${count} 件物品，将一并删除。确认删除该分类？`
        : `确认删除分类「${cat.name}」？`;
    if (window.confirm(msg)) {
      removeCategory(cat.id);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="分类管理"
      subtitle="新增、重命名、排序或删除物品分类"
      variant="drawer"
    >
      <div className="space-y-4">
        {/* 新增分类 */}
        <div className="rounded-tag border border-dashed border-sand-300 bg-sand-100/60 p-3">
          <p className="mb-2 font-display text-sm text-ink">新增分类</p>
          <div className="flex flex-col gap-2">
            <input
              className="field-input"
              placeholder="分类名称，例如：摄影器材"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <IconPicker value={newIcon} onChange={setNewIcon} />
            <button
              className="btn-primary w-full"
              onClick={handleAdd}
              disabled={!newName.trim()}
            >
              <Plus size={15} /> 添加分类
            </button>
          </div>
        </div>

        {/* 分类列表 */}
        <div className="space-y-1.5">
          {sorted.length === 0 && (
            <p className="py-6 text-center text-sm text-ink-soft">
              还没有任何分类
            </p>
          )}
          {sorted.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.icon);
            const count = trip.items.filter((i) => i.categoryId === cat.id).length;
            const isEditing = editingId === cat.id;
            return (
              <div
                key={cat.id}
                className="group flex items-center gap-2 rounded-tag border border-dashed border-sand-300 bg-sand-50 px-2.5 py-2"
              >
                <span className="text-ink-soft/50" title="拖拽提示：使用上下按钮排序">
                  <GripVertical size={15} />
                </span>

                {isEditing ? (
                  <div className="flex flex-1 flex-col gap-2 py-1">
                    <input
                      className="field-input"
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <IconPicker value={editIcon} onChange={setEditIcon} compact />
                    <div className="flex gap-2">
                      <button className="btn-primary flex-1" onClick={saveEdit}>
                        保存
                      </button>
                      <button className="btn-ghost" onClick={() => setEditingId(null)}>
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-tag bg-moss/10 text-moss">
                      <Icon size={16} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-display text-sm text-ink">
                        {cat.name}
                      </p>
                      <p className="font-mono text-[11px] text-ink-soft">
                        {count} 件物品
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="icon-btn h-8 w-8"
                        onClick={() => moveCategory(cat.id, -1)}
                        disabled={idx === 0}
                        aria-label="上移"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        className="icon-btn h-8 w-8"
                        onClick={() => moveCategory(cat.id, 1)}
                        disabled={idx === sorted.length - 1}
                        aria-label="下移"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        className="icon-btn h-8 w-8"
                        onClick={() => startEdit(cat)}
                        aria-label="编辑"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="icon-btn h-8 w-8 hover:text-stamp"
                        onClick={() => handleRemove(cat)}
                        aria-label="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function IconPicker({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
        图标
      </p>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_ICON_OPTIONS.map((name) => {
          const Icon = getCategoryIcon(name);
          const active = name === value;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={
                "flex h-8 w-8 items-center justify-center rounded-tag border transition-colors " +
                (active
                  ? "border-moss bg-moss text-sand-50"
                  : "border-sand-300 bg-sand-50 text-ink-soft hover:bg-sand-200/70")
              }
              title={name}
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
