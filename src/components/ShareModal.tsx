import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download, FileText, Link2, Loader2, QrCode } from "lucide-react";
import { Modal } from "./Modal";
import { buildShareUrl, exportPlainText } from "@/lib/share";
import { downloadBackup } from "@/lib/backup";
import { useClipboard } from "@/hooks/useClipboard";
import { computeProgress } from "@/lib/progress";
import type { Trip } from "@/types";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  trip: Trip;
}

export function ShareModal({ open, onClose, trip }: ShareModalProps) {
  const { copied, copy } = useClipboard();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loadingQr, setLoadingQr] = useState(false);
  const [tab, setTab] = useState<"link" | "qr" | "text">("link");
  const [shareUrl, setShareUrl] = useState("");
  const [plainText, setPlainText] = useState("");
  const cacheRef = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    const url = buildShareUrl(trip);
    const text = exportPlainText(trip);
    setShareUrl(url);
    setPlainText(text);
    setTab("link");
    if (cacheRef.current !== url) {
      cacheRef.current = url;
      setLoadingQr(true);
      setQrDataUrl("");
      QRCode.toDataURL(url, {
        width: 240,
        margin: 1,
        color: { dark: "#2F4A3C", light: "#FBF6EE" },
      })
        .then((d) => setQrDataUrl(d))
        .catch(() => setQrDataUrl(""))
        .finally(() => setLoadingQr(false));
    }
  }, [open, trip]);

  const progress = computeProgress(trip.items);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="共享清单"
      subtitle="把这份清单发给同行伙伴，对方打开即可只读查看"
      footer={
        <>
          <button className="btn-ghost" onClick={() => downloadBackup(trip)}>
            <Download size={14} /> 导出备份文件
          </button>
          <button className="btn-ghost" onClick={onClose}>
            完成
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 进度概览 */}
        <div className="rounded-tag border border-dashed border-sand-300 bg-sand-100/60 p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm text-ink">{trip.title}</span>
            <span className="stamp-tag">
              {progress.packed}/{progress.total} · {progress.percent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-300/60">
            <div
              className="h-full rounded-full bg-moss transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex gap-1.5 rounded-tag border border-dashed border-sand-300 bg-sand-100/50 p-1">
          <TabButton
            active={tab === "link"}
            onClick={() => setTab("link")}
            icon={<Link2 size={14} />}
            label="分享链接"
          />
          <TabButton
            active={tab === "qr"}
            onClick={() => setTab("qr")}
            icon={<QrCode size={14} />}
            label="二维码"
          />
          <TabButton
            active={tab === "text"}
            onClick={() => setTab("text")}
            icon={<FileText size={14} />}
            label="纯文本"
          />
        </div>

        {/* 内容区 */}
        {tab === "link" && (
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
              链接
            </label>
            <div className="flex gap-2">
              <input
                className="field-input flex-1 font-mono text-xs"
                value={shareUrl}
                readOnly
                onFocus={(e) => e.target.select()}
              />
              <button className="btn-primary" onClick={() => copy(shareUrl)}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-ink-soft">
              链接包含完整清单快照，对方打开后为只读视图，不会修改你的本地数据。
            </p>
          </div>
        )}

        {tab === "qr" && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="rounded-tag border border-dashed border-sand-300 bg-sand-50 p-3">
              {loadingQr ? (
                <div className="flex h-[240px] w-[240px] items-center justify-center text-ink-soft">
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : qrDataUrl ? (
                <img src={qrDataUrl} alt="清单二维码" width={240} height={240} className="block" />
              ) : (
                <div className="flex h-[240px] w-[240px] items-center justify-center text-xs text-stamp">
                  二维码生成失败
                </div>
              )}
            </div>
            <p className="text-center text-[11px] leading-relaxed text-ink-soft">
              扫码即可打开只读清单，方便发到微信群或面对面分享。
            </p>
            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`packwell-${trip.title}.png`}
                className="btn-secondary"
              >
                下载二维码
              </a>
            )}
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-ink-soft">
              清单纯文本
            </label>
            <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-tag border border-dashed border-sand-300 bg-sand-100/60 p-3 font-mono text-[11px] leading-relaxed text-ink">
              {plainText}
            </pre>
            <button className="btn-primary w-full" onClick={() => copy(plainText)}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? "已复制到剪贴板" : "复制全部文本"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-1 items-center justify-center gap-1.5 rounded-tag px-2 py-1.5 text-xs font-medium transition-colors " +
        (active ? "bg-sand-50 text-moss shadow-paper" : "text-ink-soft hover:text-ink")
      }
    >
      {icon}
      {label}
    </button>
  );
}
