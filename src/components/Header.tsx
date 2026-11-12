import React from "react";
import { Sparkles, ShieldCheck, Zap, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useExtensionPay } from "../lib/extpay";
import { useTheme } from "../lib/theme";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onOpenUpgrade?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "ChromeLaunch",
  subtitle = "Pro Toolkit",
  onOpenUpgrade,
}) => {
  const { isPaid, toggleDevPlan, user } = useExtensionPay();
  const { theme, toggleTheme } = useTheme();

  const handleDevToggle = () => {
    const nextState = toggleDevPlan();
    if (nextState) {
      toast.success("Modo PRO activado (Simulador Dev)");
    } else {
      toast.info("Modo FREE activado (Simulador Dev)");
    }
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 leading-none">
            {title}
            {isPaid ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> PRO
              </span>
            ) : (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                FREE
              </span>
            )}
          </h1>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {user?.isMock && (
          <button
            onClick={handleDevToggle}
            title="Alternar entre modo FREE y PRO para pruebas locales"
            className="text-[10px] px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-700/60 transition-colors cursor-pointer font-medium"
          >
            {isPaid ? "Dev: PRO" : "Dev: FREE"}
          </button>
        )}

        <button
          onClick={toggleTheme}
          aria-label="Cambiar tema claro/oscuro"
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {!isPaid && onOpenUpgrade && (
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upgrade</span>
          </button>
        )}
      </div>
    </header>
  );
};
