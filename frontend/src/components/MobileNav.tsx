export default function MobileNav({ active, setActive }: any) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/95 py-2 shadow-lg backdrop-blur lg:hidden">
      <button
        onClick={() => setActive("home")}
        className={`flex flex-col items-center text-xs ${
          active === "home" ? "text-slate-900 font-semibold" : "text-slate-500"
        }`}
      >
        <span className="material-icons text-xl mb-0.5">home</span>
        Home
      </button>

      <button
        onClick={() => setActive("results")}
        className={`flex flex-col items-center text-xs ${
          active === "results"
            ? "text-slate-900 font-semibold"
            : "text-slate-500"
        }`}
      >
        <span className="material-icons text-xl mb-0.5">insights</span>
        Results
      </button>
    </nav>
  );
}
