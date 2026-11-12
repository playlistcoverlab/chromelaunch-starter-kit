import React from "react";
import { Check, Sparkles, X, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useExtensionPay } from "../lib/extpay";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
  const { upgradeToPro } = useExtensionPay();

  if (!isOpen) return null;

  const features = [
    "Exportación ilimitada de métricas y datos a CSV / Markdown",
    "Generación y guardado de prompts asistidos por IA",
    "Sincronización instantánea entre Popup y Side Panel",
    "Respaldo completo e importación de configuración JSON",
    "Licencia perpetua con actualizaciones incluidas",
  ];

  const handleCheckout = () => {
    const simulated = upgradeToPro();
    onClose();
    if (simulated) {
      toast.success("🎉 ¡Licencia PRO activada! Todas las funciones están desbloqueadas.");
    } else {
      toast.info("Redirigiendo a la pasarela segura de Stripe...");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-zinc-900 dark:text-zinc-100">
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Desbloquea ChromeLaunch PRO</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Pago único para siempre. Sin cargos recurrentes.
            </p>
          </div>
        </div>

        <div className="my-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">$29</span>
            <span className="text-xs text-zinc-500 line-through">$59</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              50% OFF Lanzamiento
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Acceso comercial inmediato en todos tus navegadores.
          </p>
        </div>

        <ul className="space-y-2 mb-5">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="mt-0.5 rounded-full p-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleCheckout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          <span>Activar Licencia PRO ($29)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span>Pagos verificados por Stripe & ExtensionPay</span>
        </div>
      </div>
    </div>
  );
};
