import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** 底部操作区 */
  footer?: React.ReactNode;
  /** 宽度：默认居中弹窗；drawer=右侧抽屉；sheet=底部抽屉 */
  variant?: "center" | "drawer" | "sheet";
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  variant = "center",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const containerCls = cn(
    "fixed inset-0 z-50 flex",
    variant === "center" && "items-center justify-center p-4",
    variant === "drawer" && "justify-end",
    variant === "sheet" && "items-end"
  );

  const panelCls = cn(
    "relative bg-sand-50 shadow-paper flex flex-col max-h-full",
    variant === "center" &&
      "w-full max-w-lg rounded-tag border border-dashed border-sand-300 animate-scale-in",
    variant === "drawer" &&
      "h-full w-full max-w-md rounded-l-tag border-l border-y border-dashed border-sand-300 animate-slide-in",
    variant === "sheet" &&
      "w-full max-h-[88vh] rounded-t-tag border-t border-x border-dashed border-sand-300 animate-slide-up"
  );

  return (
    <div className={containerCls} role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div ref={dialogRef} className={panelCls}>
        {(title || subtitle) && (
          <header className="flex items-start justify-between gap-3 border-b border-dashed border-sand-300 px-5 py-4">
            <div>
              {title && (
                <h2 className="font-display text-xl text-ink leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-0.5 text-xs text-ink-soft">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="icon-btn -mr-1.5 -mt-1"
              aria-label="关闭"
            >
              <X size={18} />
            </button>
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="border-t border-dashed border-sand-300 px-5 py-3.5 flex items-center justify-end gap-2">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
