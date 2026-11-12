import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Header } from "../components/Header";
import { PaywallModal } from "../components/PaywallModal";
import { Skeleton } from "../components/Skeleton";
import { useExtensionPay } from "../lib/extpay";
import { sendToActiveTab, sendToBackground } from "../lib/messaging";
import { storage } from "../lib/storage";
import { noteSchema, type ValidatedNote } from "../lib/schemas";
import {
  FileText,
  Download,
  Settings,
  SidebarOpen,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";

export const Popup: React.FC = () => {
  const { isPaid } = useExtensionPay();
  const [activeTab, setActiveTab] = useState<"tools" | "notes" | "settings">("tools");
  const [pageInfo, setPageInfo] = useState<{ title: string; url: string; wordCount: number } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Notes state & Zod form validation
  const [notes, setNotes] = useState<ValidatedNote[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteErrors, setNoteErrors] = useState<{ title?: string; content?: string }>({});

  useEffect(() => {
    storage
      .get("notes")
      .then((data) => setNotes(data || []))
      .finally(() => setIsLoadingNotes(false));
  }, []);

  const handleScanPage = async () => {
    setIsScanning(true);
    try {
      const response = await sendToActiveTab({ type: "GET_CURRENT_PAGE_INFO" });
      if (response?.type === "PAGE_INFO_RESPONSE") {
        setPageInfo({
          title: response.title,
          url: response.url,
          wordCount: response.wordCount,
        });
        toast.success("Página escaneada correctamente");
      } else {
        throw new Error("Modo previsualización");
      }
    } catch {
      setPageInfo({
        title: document.title || "Pestaña Activa (Modo Simulación)",
        url: window.location.href || "https://chromelaunch.dev",
        wordCount: 1480,
      });
      toast.info("Métricas cargadas en modo simulación local");
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportData = () => {
    if (!isPaid) {
      setShowPaywall(true);
      return;
    }

    const row = pageInfo || {
      title: "Reporte ChromeLaunch",
      url: "https://chromelaunch.dev",
      wordCount: 1480,
    };

    const csv = `Titulo,URL,Palabras,Fecha\n"${row.title.replace(/"/g, '""')}","${row.url}",${row.wordCount},"${new Date().toISOString()}"\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chromelaunch-metrics-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Archivo CSV exportado con éxito");
  };

  const handleOpenSidePanel = async () => {
    try {
      const res = await sendToBackground({ type: "OPEN_SIDEPANEL" });
      if (res?.success) {
        toast.success("Side Panel abierto");
      } else {
        toast.info("Abre el Side Panel desde el icono superior en Chrome 114+");
      }
    } catch {
      toast.error("No se pudo abrir el Side Panel en este entorno");
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoteErrors({});

    const candidate = {
      id: String(Date.now()),
      title: noteTitle,
      content: noteContent,
      createdAt: new Date().toLocaleDateString(),
    };

    const parsed = noteSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: { title?: string; content?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "title" || key === "content") {
          fieldErrors[key] = issue.message;
        }
      }
      setNoteErrors(fieldErrors);
      toast.error("Revisa los campos de la nota");
      return;
    }

    const updated = [parsed.data, ...notes];
    setNotes(updated);
    await storage.set("notes", updated);
    setNoteTitle("");
    setNoteContent("");
    toast.success("Nota guardada");
  };

  const handleDeleteNote = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await storage.set("notes", updated);
    toast.info("Nota eliminada");
  };

  return (
    <div className="flex flex-col h-[540px] bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500/30 overflow-x-hidden">
      <Toaster richColors position="bottom-center" />
      <Header onOpenUpgrade={() => setShowPaywall(true)} />

      {/* Surface Navigation Tabs */}
      <div className="flex items-center px-4 pt-2.5 pb-1.5 border-b border-zinc-200 dark:border-zinc-800/80 gap-1 bg-zinc-100/60 dark:bg-zinc-900/30">
        <button
          onClick={() => setActiveTab("tools")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "tools"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Herramientas</span>
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "notes"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          <span>Notas ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          aria-label="Ajustes"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ml-auto ${
            activeTab === "settings"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200/80 dark:border-zinc-700"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {activeTab === "tools" && (
          <>
            {/* Quick action card: Inspector */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold">Inspector de Pestaña Activa</span>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-500" /> Tiempo real
                </span>
              </div>

              {isScanning ? (
                <div className="space-y-2 mb-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ) : pageInfo ? (
                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1 mb-2.5">
                  <p className="font-semibold truncate">{pageInfo.title}</p>
                  <p className="text-zinc-500 truncate">{pageInfo.url}</p>
                  <div className="flex items-center gap-1.5 pt-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{pageInfo.wordCount.toLocaleString()} palabras detectadas</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 leading-relaxed">
                  Escanea la pestaña activa para analizar su estructura, conteo de palabras y metadatos.
                </p>
              )}

              <button
                onClick={handleScanPage}
                disabled={isScanning}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white border border-zinc-700/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {isScanning ? "Escaneando DOM..." : "Escanear Pestaña Ahora"}
              </button>
            </div>

            {/* Premium feature card: Gated Export */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">Exportador de Datos CSV</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Descarga métricas limpias para Excel o Sheets
                    </p>
                  </div>
                </div>
                {!isPaid && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Lock className="w-2.5 h-2.5" /> PRO
                  </span>
                )}
              </div>

              <button
                onClick={handleExportData}
                className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isPaid
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                    : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {!isPaid && <Lock className="w-3.5 h-3.5 text-amber-500" />}
                <span>{isPaid ? "Descargar Reporte (.CSV)" : "Desbloquear Exportador con PRO"}</span>
              </button>
            </div>

            {/* Launch Sidepanel button */}
            <button
              onClick={handleOpenSidePanel}
              className="w-full py-2.5 px-3 rounded-2xl text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <SidebarOpen className="w-4 h-4 text-indigo-500" />
              <span>Abrir Workspace en Side Panel</span>
            </button>
          </>
        )}

        {activeTab === "notes" && (
          <div className="space-y-3">
            {/* Zod-validated Note Form */}
            <form
              onSubmit={handleAddNote}
              className="p-3 rounded-2xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 space-y-2"
            >
              <div>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Título de la nota..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-indigo-500"
                />
                {noteErrors.title && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {noteErrors.title}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Escribe una nota rápida..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-indigo-500 resize-none"
                />
                {noteErrors.content && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {noteErrors.content}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Guardar Nota</span>
              </button>
            </form>

            {isLoadingNotes ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : notes.length === 0 ? (
              <p className="text-center text-xs text-zinc-500 py-4">No hay notas guardadas todavía.</p>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{note.title}</h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        aria-label="Eliminar nota"
                        className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs">
            <h3 className="font-bold">Panel de Configuración Avanzada</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Gestiona claves de API (OpenAI / Gemini), respaldos JSON validados con Zod y el estado de tu licencia Stripe.
            </p>
            <button
              onClick={() => {
                if (typeof chrome !== "undefined" && chrome.runtime?.openOptionsPage) {
                  chrome.runtime.openOptionsPage();
                } else {
                  toast.info("Abriendo opciones avanzadas...");
                }
              }}
              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all cursor-pointer"
            >
              Abrir Dashboard de Opciones
            </button>
          </div>
        )}
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};
