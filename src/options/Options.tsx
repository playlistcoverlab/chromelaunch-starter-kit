import React, { useState, useEffect, useRef } from "react";
import { Toaster, toast } from "sonner";
import { Header } from "../components/Header";
import { PaywallModal } from "../components/PaywallModal";
import { useExtensionPay, EXTENSION_ID } from "../lib/extpay";
import { storage } from "../lib/storage";
import { apiKeySchema, storageBackupSchema } from "../lib/schemas";
import {
  Key,
  CreditCard,
  Sliders,
  Database,
  Save,
  ExternalLink,
  Code,
  Upload,
  Download,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const Options: React.FC = () => {
  const { isPaid, user, refreshUser, openLoginPage, toggleDevPlan } = useExtensionPay();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    storage.get("apiKey").then((k) => k && setApiKey(k));
    storage.get("autoAnalyze").then((val) => setAutoAnalyze(Boolean(val)));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiKeyError(null);

    const parsedKey = apiKeySchema.safeParse(apiKey);
    if (!parsedKey.success) {
      const msg = parsedKey.error.issues[0]?.message || "Formato de API Key inválido";
      setApiKeyError(msg);
      toast.error("Error de validación en la configuración");
      return;
    }

    setIsSaving(true);
    try {
      await storage.set("apiKey", parsedKey.data);
      await storage.set("autoAnalyze", autoAnalyze);
      toast.success("Configuración validada y guardada correctamente");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportBackup = async () => {
    const all = await storage.getAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chromelaunch-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Respaldo JSON descargado");
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rawJson = JSON.parse(text);
      const validated = storageBackupSchema.safeParse(rawJson);

      if (!validated.success) {
        toast.error("El archivo JSON no cumple con el esquema de seguridad de ChromeLaunch");
        return;
      }

      const data = validated.data;
      await storage.set("theme", data.theme);
      if (data.apiKey !== undefined) {
        await storage.set("apiKey", data.apiKey);
        setApiKey(data.apiKey);
      }
      await storage.set("notes", data.notes);
      await storage.set("quickPrompts", data.quickPrompts);
      await storage.set("autoAnalyze", data.autoAnalyze);
      setAutoAnalyze(data.autoAnalyze);

      toast.success("Respaldo restaurado y validado con éxito");
    } catch {
      toast.error("Archivo JSON inválido o corrupto");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col overflow-x-hidden">
      <Toaster richColors position="bottom-right" />
      <Header
        title="ChromeLaunch Dashboard"
        subtitle="Configuración, Seguridad & Monetización"
        onOpenUpgrade={() => setShowPaywall(true)}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 pt-8 pb-16 space-y-6">
        {/* Developer Banner */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 mt-0.5">
            <Code className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-indigo-700 dark:text-indigo-300">
              Arquitectura Lista para Producción (Manifest V3 + Zod + Stripe)
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Este panel valida todas las entradas con esquemas tipados de{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">Zod</strong>. El ID de
              ExtensionPay activo en{" "}
              <code className="text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">
                src/lib/extpay.ts
              </code>{" "}
              es <strong className="text-zinc-900 dark:text-zinc-200">"{EXTENSION_ID}"</strong>.
            </p>
          </div>
        </div>

        {/* Section 1: Monetization & Account Status */}
        <section className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold">Estado de Licencia y Monetización</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Plan Activo
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-base font-extrabold ${
                    isPaid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isPaid ? "PRO (Licencia Comercial Activa)" : "FREE (Versión Básica)"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {isPaid
                  ? "Exportaciones CSV/Markdown y funciones avanzadas desbloqueadas."
                  : "Actualiza a PRO para desbloquear exportaciones ilimitadas."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <span className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
                Gestión de Suscripción
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    refreshUser();
                    toast.success("Estado de licencia sincronizado");
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                  Sincronizar
                </button>
                <button
                  type="button"
                  onClick={() => openLoginPage()}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-200/80 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Portal Stripe</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </button>
                {user?.isMock && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = toggleDevPlan();
                      toast.info(`Simulador cambiado a ${next ? "PRO" : "FREE"}`);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500/20 transition-colors cursor-pointer"
                  >
                    Alternar Plan (Dev)
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Form: API Keys & Preferences with Zod Validation */}
        <form onSubmit={handleSave} className="space-y-6">
          <section className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <Key className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold">Claves de API (Validación con Zod)</h2>
            </div>

            <div className="space-y-2">
              <label htmlFor="apiKeyInput" className="block text-xs font-semibold">
                API Key de Proveedor IA (OpenAI / Gemini / Anthropic)
              </label>
              <input
                id="apiKeyInput"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (apiKeyError) setApiKeyError(null);
                }}
                placeholder="sk-proj-..."
                className={`w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border text-xs font-mono focus:outline-none transition-colors ${
                  apiKeyError
                    ? "border-red-500 focus:border-red-500"
                    : "border-zinc-200 dark:border-zinc-800 focus:border-indigo-500"
                }`}
              />
              {apiKeyError ? (
                <p className="text-xs text-red-500 flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{apiKeyError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    Almacenada exclusivamente en <code>chrome.storage.local</code> dentro de tu navegador.
                  </span>
                </p>
              )}
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
            <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <h2 className="text-sm font-bold">Preferencias de Automatización</h2>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="text-xs font-semibold">Auto-análisis de pestaña activa</p>
                <p className="text-[11px] text-zinc-500">
                  Inspeccionar metadatos automáticamente al abrir la extensión.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoAnalyze}
                onChange={(e) => setAutoAnalyze(e.target.checked)}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Guardando..." : "Guardar Configuración"}</span>
              </button>
            </div>
          </section>
        </form>

        {/* Section 4: Data Backup & Restore */}
        <section className="p-6 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <Database className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-bold">Portabilidad y Respaldo de Datos (JSON)</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-500" />
              <span>Exportar Respaldo (.JSON)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportBackup}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
              <span>Importar Respaldo (.JSON)</span>
            </button>
          </div>
        </section>
      </main>

      {/* Legal & Compliance Footer (Vibecoding Studio Standard) */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 py-6 px-6 text-center text-[11px] text-zinc-500 dark:text-zinc-400 space-y-2 bg-white/50 dark:bg-zinc-900/30">
        <div className="flex items-center justify-center gap-4 font-medium">
          <span>© {new Date().getFullYear()} ChromeLaunch. Todos los derechos reservados.</span>
          <span>•</span>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); toast.info("Política de Privacidad: Cero recolección de datos en servidores externos."); }} className="hover:text-indigo-500 underline">
            Privacidad
          </a>
          <span>•</span>
          <a href="#terms" onClick={(e) => { e.preventDefault(); toast.info("Términos de Uso: Licencia comercial perpetua incluida en LICENSE."); }} className="hover:text-indigo-500 underline">
            Términos
          </a>
          <span>•</span>
          <a href="#refunds" onClick={(e) => { e.preventDefault(); toast.info("Política de Reembolsos gestionada vía Merchant of Record."); }} className="hover:text-indigo-500 underline">
            Reembolsos
          </a>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
          Aviso de IA: Las sugerencias asistidas por IA son generadas de forma automatizada y la titularidad de los datos pertenece íntegramente al usuario.
        </p>
      </footer>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};
