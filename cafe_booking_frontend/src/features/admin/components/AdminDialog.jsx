import React, { useEffect, useRef } from "react";

/**
 * Native <dialog> wrapper. Parent controls visibility with `open`.
 */
export default function AdminDialog({ open, title, onClose, children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    }
    if (!open && el.open) {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="d-modal rounded-2xl border border-[#E8DFD0] p-0 shadow-xl sm:max-w-lg w-[calc(100%-2rem)] max-h-[90vh] overflow-hidden bg-white"
      onClose={() => onClose?.()}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
    >
      <div className="flex max-h-[90vh] flex-col">
        <div className="border-b border-[#E8DFD0] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#3D3935]">{title}</h2>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-[#E8DFD0] px-5 py-3">
          {footer}
          <button type="button" className="d-btn d-btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
      <form method="dialog" className="d-modal-backdrop">
        <button type="submit" aria-label="Close">
          close
        </button>
      </form>
    </dialog>
  );
}
