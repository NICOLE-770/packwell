import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Modal } from "./Modal";
import type { Category, Item, Trip } from "@/types";
import { usePackStore } from "@/store/usePackStore";

interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  editing?: Item | null;
  defaultCategoryId?: string;
}

export function ItemFormModal({
  open,
  onClose,
  trip,
  editing = null,
  defaultCategoryId,
}: ItemFormModalProps) {
  const addItem = usePackStore((s) => s.addItem);
  const updateItem = usePackStore((s) => s.updateItem);

  const categories = [...trip.categories].sort((a, b) => a.order - b.order);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setCategoryId(editing.categoryId);
      setQuantity(editing.quantity);
      setNote(editing.note ?? "");
    } else {
      setName("");
      setCategoryId(defaultCategoryId ?? categories[0]?.id ?? "");
      setQuantity(1);
      setNote("");
    }
    setError("");
  }, [open, editing, defaultCategoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("请输入物品名称");
      return;
    }
    if (!categoryId) {
      setError("请选择分类");
      return;
    }
    if (editing) {
      updateItem(editing.id, {
        name: trimmed,
        categoryId,
        quantity: Math.max(1, Math.floor(quantity) || 1),
        note: note.trim(),
      });
    } else {
      addItem({
        name: trimmed,
        categoryId,
        quantity: Math.max(1, Math.floor(quantity) || 1),
        note: note.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "编辑物品" : "添加物品"}
      subtitle={editing ? "更新这件行李的详情" : "登记一件要带的行李"}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn-primary" onClick={handleSubmit}>
            {editing ? "保存" : "加入清单"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            物品名称
          </label>
          <input
            className="field-input"
            placeholder="例如：护照、充电宝、雨伞"
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
              分类
            </label>
            <select
              className="field-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.length === 0 && <option value="">暂无分类</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
              数量
            </label>
            <div className="flex items-stretch">
              <button
                type="button"
                className="flex h-[38px] w-10 items-center justify-center rounded-l-tag border border-r-0 border-sand-300 bg-sand-100 text-ink-soft hover:bg-sand-200"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="减少"
              >
                <Minus size={15} />
              </button>
              <input
                className="h-[38px] w-full border-y border-sand-300 bg-sand-50 text-center font-mono text-sm text-ink focus:outline-none"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputMode="numeric"
              />
              <button
                type="button"
                className="flex h-[38px] w-10 items-center justify-center rounded-r-tag border border-l-0 border-sand-300 bg-sand-100 text-ink-soft hover:bg-sand-200"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="增加"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            备注 <span className="text-ink-soft/60">（可选）</span>
          </label>
          <textarea
            className="field-input min-h-[72px] resize-none"
            placeholder="例如：分装≤100ml、放随身背包"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-tag border border-stamp/40 bg-stamp/5 px-3 py-2 text-xs text-stamp">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
