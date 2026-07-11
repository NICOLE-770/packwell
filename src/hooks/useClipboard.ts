import { useCallback, useState } from "react";

interface UseClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

/** 复制到剪贴板，复制成功后短暂返回 copied=true 状态 */
export function useClipboard(resetMs = 1800): UseClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          // 回退方案
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta);
          if (!ok) return false;
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs]
  );

  return { copied, copy };
}
