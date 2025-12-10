interface PanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function SlideUpPanel({ open, onClose, children }: PanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity lg:hidden"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform rounded-t-2xl bg-white shadow-xl transition-transform duration-300 lg:hidden
        ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto w-full max-w-md p-4">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-slate-300" />
          {children}
        </div>
      </div>
    </>
  );
}
