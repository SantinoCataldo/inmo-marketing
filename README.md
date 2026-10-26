# 🏢 InmoMarketing - Frontend Web Application

> **Plataforma SaaS B2B Multi-Tenant para Inmobiliarias con Generación Automatizada de Contenido y Campañas Asistidas por Inteligencia Artificial.**

---

## 🌟 Visión General del Proyecto

**InmoMarketing** es una solución integral diseñada para modernizar la operativa de corretaje inmobiliario, conectando la gestión comercial de propiedades con la potencia creativa de modelos de Inteligencia Artificial de vanguardia. La plataforma permite a inmobiliarias independientes y agencias gestionar su cartera de inmuebles y, con solo un clic, concebir anuncios publicitarios de alta conversión para las principales redes sociales.

### 🏛️ Los 3 Pilares del Sistema:
1. **Gestión de Propiedades & Almacenamiento Cloudflare R2:**  
   Catálogo digital completo de inmuebles (venta y alquiler) con administración de ambientes, metrajes, precios y una galería multimedia de alta velocidad respaldada en Cloudflare R2 mediante carga *drag & drop* multipart.
2. **Generador de Publicaciones con IA (Core de Valor):**  
   - **Groq (Llama 3 / GPT-OSS):** Redacción instantánea de copys persuasivos, llamadas a la acción (CTA) y selección estratégica de hashtags para Instagram y Facebook.
   - **Ganchos Comerciales (Hooks):** Sugerencia de títulos impactantes para encabezados de flyers publicitarios.
   - **OpenAI (DALL-E / GPT-Image):** Generación automatizada de piezas gráficas y flyers publicitarios en formato imagen integrando la estética de la marca y las fotos de la propiedad.
3. **Panel de Gobierno y Administración Multi-Tenant:**  
   Consola exclusiva para usuarios administradores (`ROLE_ADMIN`) destinada a la supervisión de inmobiliarias, control de agentes y bloqueo o reactivación preventiva de accesos.

---

## 🔗 Entornos y Conectividad

| Entorno / Recurso | URL | Descripción |
|---|---|---|
| **Backend en Producción (Render)** | [https://inmo-marketing-api.onrender.com](https://inmo-marketing-api.onrender.com) | API REST Spring Boot desplegada en la nube. |
| **Documentación OpenAPI / Swagger** | [https://inmo-marketing-api.onrender.com/swagger-ui.html](https://inmo-marketing-api.onrender.com/swagger-ui.html) | Catálogo interactivo de endpoints del backend. |
| **Repositorio del Backend (GitHub)** | [https://github.com/marianoqqq/Marketing-Gestor](https://github.com/marianoqqq/Marketing-Gestor) | Código fuente de la API REST en Spring Boot. |
| **Backend Local (Desarrollo)** | `http://localhost:8080` | Endpoint de trabajo para pruebas locales. |

> ⚠️ **Nota de Cold Start (Render Free Layer):**  
> Si el backend en Render ha permanecido inactivo por más de 15 minutos, la primera solicitud HTTP experimentará una latencia de arranque en frío de entre **30 y 45 segundos** mientras el contenedor despierta. El frontend cuenta con un interceptor que notifica al usuario con un banner informativo amigable.

---

## 🛠️ Stack Tecnológico Frontend

- **Framework:** [Angular 22 (v22.2+)](https://angular.dev/)
  - **Standalone Components:** Arquitectura 100% modular y limpia sin `NgModule`.
  - **Angular Signals:** Gestión del estado reactivo síncrono con `signal()`, `computed()` y `effect()`.
  - **Modern Control Flow:** Sintaxis declarativa moderna en plantillas (`@if`, `@for`, `@switch`).
  - **Inyección de Dependencias Moderna:** Uso exclusivo de `inject()`.
- **Formularios:** Angular `ReactiveFormsModule` con validación tipada estricta.
- **Transporte y Asincronía:** Angular `HttpClient` + RxJS 7.8+ (manejo concurrente de tokens e interceptores funcionales `HttpInterceptorFn`).
- **Diseño y Estilos:** [Tailwind CSS](https://tailwindcss.com/) para estilizado moderno y utilitario, altamente optimizado en el build de producción.
- **Tipografía:** [Inter](https://fonts.google.com/specimen/Inter) de Google Fonts con números tabulares (`tabular-nums`) para cifras monetarias y métricas.
- **Iconografía Oficial:** [Google Material Symbols](https://fonts.google.com/icons) (versión Rounded / Outlined) de Google Fonts, sin librerías externas de íconos de terceros.
- **Gestión de Sesión y Tokens:** [jwt-decode](https://github.com/auth0/jwt-decode) para decodificación tipada, segura y compatible con UTF-8 del payload JWT (roles `ROLE_USER` / `ROLE_ADMIN`, email y expiración).
- **Carga Multimedia Drag & Drop:** [FilePond](https://pqina.nl/filepond/) con plugins oficiales (`filepond-plugin-image-preview`, `filepond-plugin-file-validate-size`, `filepond-plugin-file-validate-type`) para carga fluida de fotos de propiedades con miniaturas animadas y validación estricta de 5MB y extensiones permitidas.
- **Microinteracciones Auditivas:** [Howler.js](https://howlerjs.com) para retroalimentación sonora sutil y accesible (clic táctil, aviso de IA completada, copiado al portapapeles).
- **Animaciones y Motion:** [GSAP](https://gsap.com/) para timelines avanzadas de carga/IA y contadores en Dashboard, combinado con [@formkit/auto-animate](https://auto-animate.formkit.com/) para transiciones automáticas en listas (`@for`) y pasos del wizard (`@if`), y [Canvas Confetti](https://github.com/catdad/canvas-confetti) para celebraciones de publicación.
- **Exportación de Flyers a Imagen:** [html-to-image](https://github.com/bubkoo/html-to-image) para convertir plantillas y flyers HTML generados directamente a archivos PNG/JPEG en el navegador sin costo de tokens.
- **Utilidades Nativas de Google:** [@angular/cdk](https://material.angular.dev/cdk) para copiado al portapapeles (`cdk/clipboard`), overlays flotantes y reordenamiento de fotos.
- **Desplazamiento Cinemático:** [Lenis](https://lenis.darkroom.engineering) para un *smooth scroll* suave y unificado en catálogo y landing.
- **Notificaciones (Toasts):** [Ngx-Sonner](https://github.com/tutkli/ngx-sonner) (puerto de Sonner de Emil Kowalski para Angular) con apilado 3D y diseño minimalista.
- **Gestor Oficial y Runtime:** [Bun](https://bun.sh/) (v1.1+) como estándar obligatorio del equipo para instalación ultrarrápida y ejecución de scripts.
- **Pruebas y Calidad:** [Vitest](https://vitest.dev/) para pruebas unitarias ultrarrápidas y [Prettier](https://prettier.io/) para formateo consistente.

---

## 📁 Estructura Proyectada del Proyecto

El código fuente sigue una arquitectura orientada a dominios (*Feature-based*) y principios de alta cohesión y bajo acoplamiento:

```
src/
├── app/
│   ├── core/                        # Núcleo singleton de la aplicación (cargado una sola vez)
│   │   ├── auth/                    # Servicios de autenticación y almacenamiento de tokens
│   │   │   ├── auth.service.ts      # Estado de usuario con Signals y llamadas a /auth
│   │   │   └── token-storage.service.ts
│   │   ├── guards/                  # Guards funcionales de rutas
│   │   │   ├── auth.guard.ts        # Protección de rutas privadas
│   │   │   ├── guest.guard.ts       # Redirección de usuarios autenticados
│   │   │   └── role.guard.ts        # Verificación estricta de ROLE_ADMIN
│   │   ├── http/                    # Interceptores funcionales
│   │   │   ├── auth.interceptor.ts  # Inyección de Bearer Token y refresco 401 con RxJS
│   │   │   ├── cold-start.interceptor.ts # Detección de arranque en frío (>4s)
│   │   │   └── error.interceptor.ts # Captura global de ErrorResponse
│   │   ├── models/                  # Interfaces y Enums globales de TypeScript
│   │   │   ├── auth.models.ts       # Modelos de sesión y tokens
│   │   │   ├── propiedad.models.ts  # Modelos de inmuebles y enums
│   │   │   ├── publicacion.models.ts# Modelos de campañas e IA
│   │   │   ├── inmobiliaria.models.ts# Perfil corporativo
│   │   │   ├── archivo.models.ts    # Metadatos Cloudflare R2
│   │   │   ├── user.models.ts       # Gestión de usuarios
│   │   │   └── index.ts             # Barrel export general
│   │   └── services/                # Servicios transversales (notificaciones, sistema, sonido)
│   │       ├── notification.service.ts
│   │       ├── sound.service.ts     # Control de audio con Howler.js
│   │       └── system-status.service.ts
│   │
│   ├── shared/                      # Componentes, directivas y pipes reutilizables
│   │   ├── components/              # UI compartida (botones, modales, toasts, skeletons)
│   │   │   ├── toast/
│   │   │   ├── cold-start-banner/
│   │   │   ├── confirm-modal/
│   │   │   └── drag-drop-uploader/  # Uploader FilePond multipart
│   │   ├── directives/              # Directivas auxiliares
│   │   └── pipes/                   # Pipes de transformación de datos
│   │       ├── auth-image.pipe.ts   # Descarga binaria segura de fotos R2 con Bearer
│   │       └── currency-ars.pipe.ts # Formateador monetario
│   │
│   ├── features/                    # Módulos de funcionalidad de negocio (vistas)
│   │   ├── auth/                    # Pantallas de acceso
│   │   │   └── pages/
│   │   │       ├── login/           # Inicio de sesión
│   │   │       └── register/        # Alta de agente e inmobiliaria
│   │   ├── dashboard/               # Resumen operativo y métricas principales
│   │   ├── properties/              # Módulo de Gestión Inmobiliaria
│   │   │   ├── pages/
│   │   │   │   ├── property-list/   # Catálogo con filtros y búsqueda
│   │   │   │   ├── property-detail/ # Ficha técnica y galería de fotos
│   │   │   │   └── property-form/   # Formulario reactivo de alta y edición
│   │   │   └── services/
│   │   │       ├── property.service.ts
│   │   │       └── property-files.service.ts
│   │   ├── publications/            # Módulo de Campañas e IA
│   │   │   ├── pages/
│   │   │   │   ├── publication-list/# Tablero de publicaciones por estado
│   │   │   │   ├── wizard-creator/  # Flujo interactivo de 5 pasos con Groq/OpenAI
│   │   │   │   └── publication-detail/ # Visualización de copy y flyer generado
│   │   │   └── services/
│   │   │       ├── publication.service.ts
│   │   └── admin/                   # Módulo Exclusivo para ROLE_ADMIN
│   │       ├── pages/
│   │       │   ├── agency-list/     # Auditoría de inmobiliarias registradas
│   │       │   └── user-management/ # Control y bloqueo/desbloqueo de usuarios
│   │       └── services/
│   │           └── admin.service.ts
│   │
│   ├── layout/                      # Estructura del cascarón de la aplicación
│   │   └── main-layout/             # Sidebar responsivo, Navbar y Router Outlet
│   │
│   ├── app.config.ts                # Proveedores globales (Router, HttpClient, Interceptors)
│   ├── app.routes.ts                # Configuración de rutas y Lazy Loading
│   └── app.component.ts             # Shell raíz
│
├── environments/                    # Variables de configuración por entorno
│   ├── environment.ts               # Desarrollo local (http://localhost:8080)
│   └── environment.prod.ts          # Producción (https://inmo-marketing-api.onrender.com)
└── styles.css                       # Estilos globales y utilidades de Tailwind
```

---

## 🌿 Convenciones de Trabajo con Git

Para asegurar un desarrollo armónico y libre de conflictos en el equipo, seguimos un flujo de trabajo basado en **GitFlow simplificado**:

```
main       ───────────────────────────────────● (Deploy Producción)
                        ▲
                        │ Pull Request Aprobado
develop    ─────────●───┴─────────●─────────── (Integración Continua)
                     ▲             ▲
      Feature Branch │             │ Feature Branch
feature/*  ──────────┘             └──────────
```

### Reglas de Ramificación:
- **`main`**: Rama protegida. Solo recibe código probado proveniente de `develop`.
- **`develop`**: Rama integradora de desarrollo activo.
- **`feature/<modulo>-<funcionalidad>`**: Ramas efímeras de trabajo individual.  
  *Ejemplos:* `feature/auth-jwt-flow`, `feature/property-drag-drop`, `feature/wizard-ia-step2`.
- **`fix/<descripcion-del-bug>`**: Correcciones puntuales sobre funcionalidades integradas.

### Estándar de Commits (Conventional Commits):
- `feat(modulo): nueva funcionalidad incorporada`
- `fix(modulo): corrección de un error o bug`
- `docs(modulo): adición o actualización de documentación`
- `refactor(modulo): mejora interna de código sin cambio de comportamiento`
- `style(modulo): ajustes estéticos o de maquetación CSS/Tailwind`

---

## 🚀 Comandos de Desarrollo (Exclusivo Bun)

En este repositorio **se trabaja obligatoriamente con [Bun](https://bun.sh/)** como gestor de paquetes y ejecutor:

```bash
# Instalar dependencias del proyecto a máxima velocidad
bun install

# Iniciar servidor de desarrollo local (http://localhost:4200)
bun start

# Ejecutar suite de pruebas unitarias con Vitest
bun test

# Compilar proyecto optimizado para producción (dist/)
bun run build

# Agregar una nueva dependencia
bun add <paquete>
bun add -d <paquete-dev>
```

---

## 📚 Documentación Técnica Completa

Para profundizar en la ingeniería del proyecto y el plan de trabajo del equipo, consultá los manuales ubicados en el directorio `/docs`:

1. **[Manual Técnico de Especificación y Arquitectura](docs/ESPECIFICACION_Y_ARQUITECTURA.md):**  
   Requisitos funcionales y no funcionales detallados, catálogo exhaustivo de los 15 endpoints del backend, modelos TypeScript íntegros, solución técnica a los 5 desafíos críticos (concurrencia JWT en interceptor, cold start en Render, `AuthImagePipe` para Cloudflare R2, drag & drop multipart y query params en PATCH) y diseño completo del Wizard de IA.

2. **[Roadmap y División de Tareas del Equipo](docs/ROADMAP_Y_DIVISION_TAREAS.md):**  
   Cronograma de desarrollo dividido en 4 fases, estrategia para evitar conflictos de merge en Git, asignación de roles entre los integrantes y checklist maestro granular con todas las tareas a construir.

---

## 👥 Equipo de Desarrollo

- **Santi (Santino Cataldo)** - Frontend Lead & Arquitectura
- **Seba** - Frontend Developer (Propiedades & Multimedia Cloudflare R2)
- **Marian (Mariano)** - Backend & Frontend Developer (Publicaciones & Modelos IA)
