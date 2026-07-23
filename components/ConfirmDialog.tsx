"use client";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Yes, Do It",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
        <p className="mt-2 text-base text-zinc-600 leading-relaxed">{message}</p>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className={`w-full rounded-xl py-4 text-lg font-semibold text-white transition-colors ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-zinc-900 hover:bg-zinc-800"
            }`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-xl border border-zinc-300 py-4 text-lg font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
