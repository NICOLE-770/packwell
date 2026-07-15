import { useEffect, useState } from "react";
import { Minus, Plus, Users, MapPin, X, PlusCircle } from "lucide-react";
import { Modal } from "./Modal";
import type { Category, Item, Trip } from "@/types";
import { usePackStore } from "@/store/usePackStore";

interface ItemFormModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
  editing?: Item | null;
  defaultCategoryId?: string;
  defaultPerson?: string;
}

export function ItemFormModal({
  open,
  onClose,
  trip,
  editing = null,
  defaultCategoryId,
  defaultPerson = "",
}: ItemFormModalProps) {
  const addItem = usePackStore((s) => s.addItem);
  const updateItem = usePackStore((s) => s.updateItem);
  const personPresets = usePackStore((s) => s.personPresets);
  const locationPresets = usePackStore((s) => s.locationPresets);
  const addPersonPreset = usePackStore((s) => s.addPersonPreset);
  const removePersonPreset = usePackStore((s) => s.removePersonPreset);
  const addLocationPreset = usePackStore((s) => s.addLocationPreset);
  const removeLocationPreset = usePackStore((s) => s.removeLocationPreset);

  const categories = [...trip.categories].sort((a, b) => a.order - b.order);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [person, setPerson] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [showPersonInput, setShowPersonInput] = useState(false);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [newPerson, setNewPerson] = useState("");
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setName(editing.name);
      setCategoryId(editing.categoryId);
      setQuantity(editing.quantity);
      setLocation(editing.location ?? "");
      const existingPerson = editing.note?.split("：")[0];
      setPerson(existingPerson && editing.note?.includes("：") ? existingPerson : "");
      setNote(editing.note?.includes("：") ? editing.note.split("：").slice(1).join("：") : editing.note ?? "");
    } else {
      setName("");
      setCategoryId(defaultCategoryId ?? categories[0]?.id ?? "");
      setQuantity(1);
      setPerson(defaultPerson);
      setLocation("");
      setNote("");
    }
    setError("");
    setShowPersonInput(false);
    setShowLocationInput(false);
    setNewPerson("");
    setNewLocation("");
  }, [open, editing, defaultCategoryId, defaultPerson]);

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
    const fullNote = person ? `${person}：${note.trim()}` : note.trim();
    if (editing) {
      updateItem(editing.id, {
        name: trimmed,
        categoryId,
        quantity: Math.max(1, Math.floor(quantity) || 1),
        note: fullNote,
        location: location.trim(),
      });
    } else {
      addItem({
        name: trimmed,
        categoryId,
        quantity: Math.max(1, Math.floor(quantity) || 1),
        note: fullNote,
        location: location.trim(),
      });
      if (!editing) {
        setName("");
        setQuantity(1);
        setNote("");
        return;
      }
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAddPersonPreset = () => {
    const trimmed = newPerson.trim();
    if (trimmed) {
      addPersonPreset(trimmed);
      setPerson(trimmed);
      setNewPerson("");
      setShowPersonInput(false);
    }
  };

  const handleAddLocationPreset = () => {
    const trimmed = newLocation.trim();
    if (trimmed) {
      addLocationPreset(trimmed);
      setLocation(trimmed);
      setNewLocation("");
      setShowLocationInput(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "编辑物品" : "添加物品"}
      subtitle={editing ? "更新这件行李的详情" : "登记一件要带的行李"}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={handleSubmit}>
            {editing ? "保存" : "加入清单"}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            物品名称
          </label>
          <input
            className="field-input"
            placeholder="例如：护照、充电宝、雨伞"
            value={name}
            autoFocus
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-soft flex items-center gap-1">
              <Users size={12} /> 所属人
            </label>
            <button
              type="button"
              className="text-[11px] text-moss hover:text-moss-deep flex items-center gap-0.5"
              onClick={() => { setShowPersonInput(!showPersonInput); setNewPerson(""); }}
            >
              <PlusCircle size={12} /> 管理
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {personPresets.length === 0 && !showPersonInput && (
              <span className="text-xs text-ink-soft/60">暂无预设，点击「管理」添加</span>
            )}
            {personPresets.map((p) => (
              <button
                key={p}
                type="button"
                className={`px-2.5 py-1 rounded-tag text-xs transition-colors flex items-center gap-1 ${person === p ? "bg-moss text-white" : "bg-sand-100 text-ink-soft hover:bg-sand-200"}`}
                onClick={() => setPerson(person === p ? "" : p)}
              >
                {p}
                {person === p && <X size={10} />}
              </button>
            ))}
          </div>
          {showPersonInput && (
            <div className="flex gap-2 mb-2">
              <input
                className="field-input flex-1 text-xs"
                placeholder="输入新的所属人"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPersonPreset();
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary text-xs px-3 py-1.5"
                onClick={handleAddPersonPreset}
              >
                添加
              </button>
            </div>
          )}
          {showPersonInput && personPresets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <p className="w-full text-[10px] text-ink-soft mb-1">点击 × 删除预设</p>
              {personPresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="px-2 py-0.5 rounded-tag text-[11px] bg-sand-100 text-ink-soft flex items-center gap-1 hover:bg-stamp/10 hover:text-stamp transition-colors"
                  onClick={() => removePersonPreset(p)}
                >
                  {p} <X size={10} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-ink-soft flex items-center gap-1">
              <MapPin size={12} /> 存放位置
            </label>
            <button
              type="button"
              className="text-[11px] text-moss hover:text-moss-deep flex items-center gap-0.5"
              onClick={() => { setShowLocationInput(!showLocationInput); setNewLocation(""); }}
            >
              <PlusCircle size={12} /> 管理
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {locationPresets.length === 0 && !showLocationInput && (
              <span className="text-xs text-ink-soft/60">暂无预设，点击「管理」添加</span>
            )}
            {locationPresets.map((l) => (
              <button
                key={l}
                type="button"
                className={`px-2.5 py-1 rounded-tag text-xs transition-colors flex items-center gap-1 ${location === l ? "bg-moss text-white" : "bg-sand-100 text-ink-soft hover:bg-sand-200"}`}
                onClick={() => setLocation(location === l ? "" : l)}
              >
                {l}
                {location === l && <X size={10} />}
              </button>
            ))}
          </div>
          {showLocationInput && (
            <div className="flex gap-2 mb-2">
              <input
                className="field-input flex-1 text-xs"
                placeholder="输入新的存放位置"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddLocationPreset();
                  }
                }}
              />
              <button
                type="button"
                className="btn-primary text-xs px-3 py-1.5"
                onClick={handleAddLocationPreset}
              >
                添加
              </button>
            </div>
          )}
          {showLocationInput && locationPresets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <p className="w-full text-[10px] text-ink-soft mb-1">点击 × 删除预设</p>
              {locationPresets.map((l) => (
                <button
                  key={l}
                  type="button"
                  className="px-2 py-0.5 rounded-tag text-[11px] bg-sand-100 text-ink-soft flex items-center gap-1 hover:bg-stamp/10 hover:text-stamp transition-colors"
                  onClick={() => removeLocationPreset(l)}
                >
                  {l} <X size={10} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-soft">
            备注 <span className="text-ink-soft/60">（可选）</span>
          </label>
          <textarea
            className="field-input min-h-[80px] resize-none"
            placeholder="例如：分装≤100ml、放随身背包&#10;支持多行输入"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={3}
          />
        </div>

        {!editing && (
          <p className="text-[11px] text-ink-soft text-center">
            按 Enter 快速添加并继续输入
          </p>
        )}

        {error && (
          <p className="rounded-tag border border-stamp/40 bg-stamp/5 px-3 py-2 text-xs text-stamp">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
