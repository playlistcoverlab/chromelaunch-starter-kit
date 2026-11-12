# 🚀 Product Launch & Sales Kit: ChromeLaunch

> Utiliza este kit para publicar y vender el Starter Kit en **Gumroad**, **LemonSqueezy**, **Twitter/X** y **Reddit** sin perder tiempo redactando textos desde cero.

---

## 1. Ficha de Venta para Gumroad / LemonSqueezy

### Título del Producto
`ChromeLaunch: The Ultimate Chrome Extension Starter Kit (Manifest V3 + React 19 + Stripe)`

### Subtítulo (One-Liner)
*Lanza tu extensión de Chrome monetizada en 1 hora en lugar de perder 40 horas configurando Manifest V3, Side Panel y Stripe.*

### Estructura de Precios Recomendada
* **Tier 1: Licencia Personal / Solo Dev ($49 USD)**
  * Código fuente completo de ChromeLaunch.
  * Manifest V3 + React 19 + Tailwind CSS v4.
  * Side Panel nativo + Popup + Options Dashboard.
  * Integración lista con ExtensionPay / Stripe.
  * Proyectos comerciales ilimitados para ti.
* **Tier 2: Licencia Pro / Agency ($89 USD)**
  * Todo lo del Tier 1.
  * Plantilla de Landing Page de alta conversión para promocionar la extensión.
  * Checklist de aprobación en 24h para la Chrome Web Store.
  * Soporte prioritario por email / Discord.

### Descripción Completa (Copiar y pegar en LemonSqueezy / Gumroad)

```markdown
### 🛑 Deja de perder días configurando extensiones de Chrome desde cero

Crear una extensión de Chrome moderna en 2026 es un dolor de cabeza:
- Los Service Workers de **Manifest V3** se apagan inesperadamente.
- El nuevo **Chrome Side Panel API** requiere configuraciones confusas de permisos.
- Integrar pasarelas de pago y autenticación en popups suele romper los CSP de Google.
- Empaquetar y configurar Tailwind con Vite requiere malabares de Rollup.

**ChromeLaunch resuelve todo eso por ti antes de que escribas la primera línea de lógica de tu app.**

---

### ⚡ ¿Qué incluye exactamente?

- 🛡️ **100% Manifest V3 Compliant:** Configurado según las directrices más estrictas de Google.
- 📱 **3 Superficies Listas para Usar:**
  1. **Popup (380px):** Widget compacto con tabs, inspector en tiempo real y diseño dark mode.
  2. **Chrome Side Panel (Chrome 114+):** Panel lateral persistente ideal para herramientas de IA, notas o copilot.
  3. **Options Dashboard:** Panel completo para gestión de API Keys, temas y respaldos de datos.
- 💳 **Monetización con Stripe Integrada:** Pre-configurado con ExtensionPay. Incluye modal de paywall de alta conversión, hook `useExtensionPay()` y un simulador local de pagos para probar el modo PRO sin crear cuentas previas.
- 🎨 **Stack Moderno:** React 19, TypeScript estricto, Tailwind CSS v4 y Lucide Icons.
- ⚡ **Compilación en <1 segundo:** Desarrollado sobre Bun y Vite. `bun run build` genera la carpeta `dist/` lista para cargar en `chrome://extensions`.
- 📄 **Licencia Comercial Completa:** Construye y vende tantas extensiones como quieras. El 100% de los ingresos de tus extensiones es tuyo.

---

### ⏱️ De 0 a Producción en 3 Pasos
1. Clona el repositorio y corre `bun install`.
2. Pon tu ID de Stripe en `src/lib/extpay.ts`.
3. Ejecuta `bun run build` y cárgalo en tu navegador. ¡Listo para publicar en la Chrome Web Store!
```

---

## 2. Hilo de Lanzamiento para Twitter / X

```text
Construir extensiones de Chrome en 2026 sigue siendo una pesadilla por culpa de Manifest V3 y las pasarelas de pago.

Me cansé de perder 40 horas en cada proyecto configurando lo mismo, así que construí la plantilla definitiva:

Presento ChromeLaunch ⚡
Un Starter Kit listo para producción con React 19, Tailwind v4, Side Panel y Stripe ya integrado.

🧵 Esto es todo lo que incluye (y cómo puedes lanzar tu extensión en 1 hora):

1/5 🛡️ Manifest V3 Nativo:
Cero errores de permisos o workers que se duermen. Configuración limpia de Service Worker y Content Script con Shadow DOM para no colisionar con los estilos de ninguna web.

2/5 📱 3 Superficies Completas:
No solo el popup tradicional: incluye el nuevo Chrome Side Panel (que no se cierra al hacer clic en la web) y un Options Dashboard completo para API Keys y ajustes.

3/5 💳 Pagos con Stripe en 3 líneas de código:
Viene con ExtensionPay pre-cableado, modal de Paywall de alta conversión y un simulador local para probar el modo PRO sin configurar Stripe antes de tiempo.

4/5 ⚡ Stack de Ultrarrápido:
Bun + Vite + React 19 + TypeScript + Tailwind v4. Compila el paquete listo para la Chrome Web Store en menos de 1 segundo.

5/5 🚀 Disponible hoy con 50% de descuento por lanzamiento:
[ENLACE_A_TU_GUMROAD_O_LEMONSQUEEZY]
```

---

## 3. Post para Reddit (r/SideProject & r/reactjs)

**Título:** *I got tired of wrestling with Manifest V3 and Stripe for Chrome extensions, so I built an open-architecture starter kit (React 19 + Tailwind v4 + Side Panel)*

**Contenido:**
> Hey everyone!
> Whenever I had an idea for a Chrome extension, I always dreaded the setup: configuring Manifest V3 service workers, getting Tailwind to build nicely without bundle bloat, and especially wiring up Stripe payments inside Chrome's restricted CSP environment.
>
> I finally packaged my personal production boilerplate: **ChromeLaunch**.
>
> **Tech stack & features:**
> - Vite + Bun (sub-second builds).
> - React 19 + TypeScript.
> - Full support for Chrome's native Side Panel API (Chrome 114+).
> - ExtensionPay / Stripe wrapper with a local development paywall simulator.
> - Isolated Shadow DOM content script.
>
> You can check it out here: [ENLACE]
> Feedback and questions on Manifest V3 quirks are very welcome!
