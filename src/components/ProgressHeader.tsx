import { useEffect, useRef, useState } from "react";
import { Check, Pencil } from "lucide-react";
import { usePackStore } from "@/store/usePackStore";
import { computeProgress } from "@/lib/progress";
import type { Trip } from "@/types";

interface ProgressHeaderProps {
  trip: Trip;
  onOpenShare: () => void;
}

export function ProgressHeader({ trip, onOpenShare }: ProgressHeaderProps) {
  const setTitle = usePackStore((s) => s.setTitle);
  const progress = computeProgress(trip.items);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(trip.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(trip.title);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing, trip.title]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== trip.title) {
      setTitle(trimmed);
    }
    setEditing(false);
  };

  const allDone = progress.total > 0 && progress.packed === progress.total;

  return (
    <header className="paper-card relative overflow-hidden p-5 sm:p-6">
      {/* 装饰：邮戳 */}
      <div className="pointer-events-none absolute -right-6 -top-6 select-none">
        <div className="rounded-full border-2 border-dashed border-ochre/30 px-3 py-3 text-center opacity-60">
          <div className="font-mono text-[9px] uppercase tracking-widest text-ochre-deep">
            Packwell
          </div>
          <div className="font-display text-base leading-none text-ochre-deep">
            ✈
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="mb-1 font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            旅行清单
          </p>
          {editing ? (
            <input
              ref={inputRef}
              className="font-display text-2xl sm:text-3xl text-ink bg-transparent border-b border-dashed border-moss/50 focus:outline-none w-full"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") setEditing(false);
              }}
            />
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight">
                {trip.title || "未命名旅行"}
              </h1>
              <button
                className="icon-btn h-7 w-7"
                onClick={() => setEditing(true)}
                aria-label="编辑标题"
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 进度 */}
      <div className="mt-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-3xl text-moss tabular-nums">
              {progress.percent}
            </span>
            <span className="font-mono text-sm text-ink-soft">%</span>
            <span className="ml-2 text-xs text-ink-soft">
              {progress.packed} / {progress.total} 件已打包
            </span>
          </div>
          {allDone && (
            <span className="stamp-tag animate-stamp-press">
              <Check size={11} /> 全部就绪
            </span>
          )}
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand-300/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-moss to-ochre transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* 行动按钮 */}
      <div className="mt-5 flex flex-wrap gap-2">
        <button className="btn-primary" onClick={onOpenShare}>
          共享给联系人
        </button>
      </div>
    </header>
  );
}
