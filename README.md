# SonriApp

Aplicación de gestión odontológica (citas, pacientes, historia clínica, odontograma, presupuestos, pagos y reportes) construida con **Angular + Supabase**, empaquetable como **PWA** y como app nativa con **Capacitor**.

## Desarrollo

```bash
npm install
npm start        # servidor de desarrollo (http://localhost:4200)
npm run build    # build de producción en dist/SonriAppV2/browser
```

## Pruebas

```bash
npm test -- --no-watch    # ejecuta las pruebas unitarias (vitest) una vez
```
Cubren la lógica de negocio crítica: `WhatsappService` (placeholders + normalización +57),
`AuthService` (login exitoso/fallido, cuenta suspendida/vencida), `CopCurrencyPipe`
(formato COP) y la validación de solapamiento de citas (`CitaService.checkOverlap`).

## Variables de entorno y configuración

La configuración de Supabase se inyecta por **variables de entorno** (no hardcodeada).
`scripts/set-env.js` genera `src/environments/environment.prod.ts` a partir de:

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_ANON_KEY` | Clave pública `anon` (RLS protege los datos; nunca la `service_role`) |

Ver `.env.example`. La `SERVICE_ROLE_KEY` solo vive en las Edge Functions de Supabase.

## Despliegue en Vercel / Netlify

Build optimizado (lazy loading por feature, budgets 1MB/2MB, `outputHashing`).

- **Build command:** `npm run build:prod`  (ejecuta `set-env.js` y luego `ng build`)
- **Output directory:** `dist/SonriAppV2/browser`
- **Variables de entorno:** define `SUPABASE_URL` y `SUPABASE_ANON_KEY` en el panel del proveedor.
- **SPA rewrite (client-side routing):** redirige todas las rutas a `index.html`.
  - **Vercel** (`vercel.json`):
    ```json
    { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
    ```
  - **Netlify** (`public/_redirects` o `netlify.toml`):
    ```
    /*    /index.html   200
    ```

## PWA (Progressive Web App)

La app es instalable y funciona offline (al menos el app shell) mediante Angular Service Worker.

- `public/manifest.webmanifest`: nombre "SonriApp", color primario `#0E7C86`, íconos 192/512 (incluye `maskable`).
- `public/icons/`: íconos PNG temporales (regenerables con `node scripts/gen-icons.js`).
- `ngsw-config.json`: estrategia de cacheo del shell y assets.
- El service worker **solo se registra en producción** (`enabled: !isDevMode()`), así que para probar la instalabilidad:

```bash
npm run build
npx http-server -p 8080 dist/SonriAppV2/browser   # o cualquier servidor estático
```

Luego abre la URL en Chrome/Safari móvil → "Agregar a pantalla de inicio".

## Empaquetado móvil con Capacitor

Capacitor está integrado (sin Ionic) para generar builds nativas de Android/iOS reutilizando el mismo código web. Configuración en `capacitor.config.ts` (`appId: com.sonriapp.app`, `appName: SonriApp`, `webDir: dist/SonriAppV2/browser`).

### Agregar las plataformas (una sola vez)

```bash
npm run build
npx cap add android
npx cap add ios      # requiere macOS + Xcode
```

### Generar el APK de pruebas (Android)

```bash
ng build                 # genera dist/SonriAppV2/browser
npx cap sync             # copia el build web a las plataformas nativas
npx cap open android     # abre Android Studio
```

Desde Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**. El APK de depuración queda en
`android/app/build/outputs/apk/debug/app-debug.apk`.

### Requisitos
- **Android**: Android Studio + JDK 17 + Android SDK.
- **iOS**: macOS + Xcode + CocoaPods.

> Estado actual: la plataforma **Android ya está agregada** (`android/`, `applicationId: com.sonriapp.app`). Para **iOS** ejecuta `npx cap add ios` en macOS (Xcode + CocoaPods). Tras cada `ng build`, corre `npx cap sync` para actualizar el proyecto nativo.
