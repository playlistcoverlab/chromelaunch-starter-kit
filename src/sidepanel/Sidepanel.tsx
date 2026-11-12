import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Header } from "../components/Header";
import { PaywallModal } from "../components/PaywallModal";
import { useExtensionPay } from "../lib/extpay";
import { storage } from "../lib/storage";
import { promptInputSchema } from "../lib/schemas";
import {
  Send,
  Trash2,
  Download,
  Bot,
  Copy,
  Check,
  Sparkles,
  BookmarkPlus,
  AlertCircle,
} from "lucide-react";

export const Sidepanel: React.FC = () => {
  const { isPaid } = useExtensionPay();
  const [showPaywall, setShowPaywall] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "user" | "assistant"; text: string; time: string }>
  >([
    {
      id: "intro",
      role: "assistant",
      text: "¡Hola! Soy tu asistente en el Side Panel. Puedes hacerme preguntas sobre la página activa, guardar notas en 1 clic o exportar tu sesión a Markdown.",
      time: "Ahora",
    },
  ]);
  const [quickPrompts, setQuickPrompts] = useState<string[]>([]);

  useEffect(() => {
    storage.get("quickPrompts").then((prompts) => {
      if (prompts) setQuickPrompts(prompts);
    });
  }, []);

  const handleSendMessage = (textToSend?: string) => {
    setInputError(null);
    const rawText = textToSend ?? inputPrompt;

    const validation = promptInputSchema.safeParse(rawText);
    if (!validation.success) {
      const msg = validation.error.issues[0]?.message || "Entrada inválida";
      setInputError(msg);
      return;
    }

    const text = validation.data;
    const userMsg = {
      id: String(Date.now()),
      role: "user" as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt("");

    setTimeout(() => {
      const aiReply = {
        id: String(Date.now() + 1),
        role: "assistant" as const,
        text: `Análisis completado para: "${text}". Los puntos clave han sido estructurados y están listos para guardarse en tus notas o exportarse en formato Markdown.`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 450);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveAsNote = async (text: string) => {
    const existing = (await storage.get("notes")) || [];
    const newNote = {
      id: String(Date.now()),
      title: `Copilot (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
      content: text.slice(0, 950),
      createdAt: new Date().toLocaleDateString(),
    };
    await storage.set("notes", [newNote, ...existing]);
    toast.success("Respuesta guardada en tus Notas");
  };

  const handleExportHistory = () => {
    if (!isPaid) {
      setShowPaywall(true);
      return;
    }
    const mdContent = messages
      .map((m) => `### ${m.role.toUpperCase()} (${m.time})\n${m.text}\n`)
      .join("\n---\n\n");
    const blob = new Blob([mdContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chromelaunch-session-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sesión exportada a Markdown (.MD)");
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-x-hidden">
      <Toaster richColors position="bottom-center" />
      <Header
        title="Side Panel Workspace"
        subtitle="Copilot Persistente"
        onOpenUpgrade={() => setShowPaywall(true)}
      />

      {/* Main Workspace Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Prompts Bar */}
        <div className="flex flex-wrap gap-1.5 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          {quickPrompts.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[92%] ${
                m.role === "user"
                  ? "ml-auto bg-indigo-600 text-white rounded-br-sm shadow-md shadow-indigo-600/20"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 rounded-bl-sm shadow-xs"
              }`}
            >
              <div
                className={`flex items-center justify-between gap-4 mb-1 text-[10px] ${
                  m.role === "user" ? "text-indigo-200" : "text-zinc-400"
                }`}
              >
                <span className="font-semibold flex items-center gap-1">
                  {m.role === "assistant" && <Bot className="w-3 h-3 text-indigo-500" />}
                  {m.role === "assistant" ? "ChromeLaunch AI" : "Tú"}
                </span>
                <span>{m.time}</span>
              </div>
              <p>{m.text}</p>

              {m.role === "assistant" && (
                <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => handleSaveAsNote(m.text)}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-indigo-500 transition-colors cursor-pointer"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>Guardar en Notas</span>
                  </button>
                  <button
                    onClick={() => handleCopy(m.id, m.text)}
                    className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer Bar */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md space-y-2">
        <div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => {
                setInputPrompt(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Escribe una instrucción (mín. 2 caracteres)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              aria-label="Enviar instrucción"
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          {inputError && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 px-1">
              <AlertCircle className="w-3 h-3" /> {inputError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 px-1 pt-0.5">
          <button
            onClick={handleExportHistory}
            className="flex items-center gap-1 hover:text-indigo-500 transition-colors cursor-pointer font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Sesión (.MD)</span>
          </button>

          <button
            onClick={() => {
              setMessages([]);
              toast.info("Historial limpiado");
            }}
            className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        </div>

        <p className="text-[9px] text-center text-zinc-400 dark:text-zinc-500 pt-1">
          Los resultados generados por IA son orientativos y pertenecen al usuario.
        </p>
      </div>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};
