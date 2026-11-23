import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full sm:max-w-3xl max-h-[95dvh] sm:max-h-[90vh] flex-col overflow-hidden bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-5">
          <h2 className="text-lg font-semibold text-gray-900 pr-4">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-gray-100 px-4 py-4 sm:px-5 flex justify-end gap-2 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
