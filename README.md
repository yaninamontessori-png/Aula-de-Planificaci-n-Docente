# Aula de Planificación Docente

Aplicación web para docentes de Educación Primaria (Santa Fe, Argentina) que
transforma una **pregunta motivadora** y una **selección de contenidos
curriculares oficiales** en una **planificación interdisciplinaria editable**.

Reescritura del prototipo de Google Apps Script sobre una base moderna:
**Next.js + TypeScript + Supabase**, pensada para funcionar bien en celulares,
tablets y computadoras.

> Esta es la **primera entrega**: base del proyecto, diseño responsive,
> autenticación con Google, navegación protegida y esquema de base de datos con
> seguridad a nivel de fila (RLS). La generación con IA y las descargas
> Word/PDF llegan en la siguiente etapa (ver [Estado y próximos pasos](#estado-y-próximos-pasos)).

---

## Tecnologías

| Área            | Herramienta                                   |
| --------------- | --------------------------------------------- |
| Framework       | Next.js 16 (App Router) + React 19            |
| Lenguaje        | TypeScript (modo estricto)                    |
| Estilos         | Tailwind CSS v4                               |
| Backend / Auth  | Supabase (PostgreSQL, Auth, Edge Functions)   |
| Validación      | Zod                                           |
| Tests           | Vitest                                        |
| Formato / Lint  | Prettier + ESLint (`eslint-config-next`)      |

---

## Requisitos

- **Node.js 20.11+** (probado con Node 22).
- Una cuenta de **Supabase** (plan gratuito alcanza para empezar).
- Un proyecto de **Google Cloud** con OAuth para "Continuar con Google".
- Opcional (para la próxima etapa): la **CLI de Supabase** y una clave de
  **Gemini**.

---

## Puesta en marcha local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env.local     # en Windows PowerShell: Copy-Item .env.example .env.local

# 3. Completar .env.local con los valores de tu proyecto Supabase (ver abajo)

# 4. Levantar el entorno de desarrollo
npm run dev
```

La app queda disponible en http://localhost:3000.

Sin `.env.local` la app **compila** (`npm run build`) pero las páginas que usan
Supabase mostrarán un error claro pidiendo completar las variables.

### Scripts disponibles

| Script                     | Qué hace                                          |
| -------------------------- | ------------------------------------------------- |
| `npm run dev`              | Servidor de desarrollo                            |
| `npm run build`            | Build de producción                               |
| `npm run start`            | Sirve el build de producción                      |
| `npm run lint`             | ESLint                                            |
| `npm run typecheck`        | TypeScript sin emitir archivos                    |
| `npm run test`             | Tests con Vitest                                  |
| `npm run format`           | Formatea con Prettier                             |
| `npm run import:curriculum`| Importa el CSV curricular a Supabase (ver abajo)  |

---

### Solución de problemas

**`fetch failed` / `UNABLE_TO_VERIFY_LEAF_SIGNATURE` al iniciar sesión.**
Algún antivirus o proxy (AVG, Avast, ESET, Kaspersky…) inspecciona el tráfico
HTTPS y re-firma los certificados con una CA propia que Node no reconoce. El
servidor no puede validar el certificado de Supabase. Soluciones:

- Ejecutá el dev server en una terminal donde esté definida la variable
  `NODE_EXTRA_CA_CERTS` apuntando al certificado del antivirus (muchos la
  configuran solas, p. ej. `C:\ProgramData\AVG\Antivirus\wscert.pem`), **o**
- Usá el almacén de certificados del sistema:

  ```bash
  # PowerShell
  $env:NODE_OPTIONS="--use-system-ca"; npm run dev
  ```

No afecta a producción (Vercel no intercepta HTTPS).

## Configurar Supabase

### 1. Crear el proyecto y aplicar el esquema

Creá un proyecto en [supabase.com](https://supabase.com). Después, aplicá la
migración inicial de una de estas dos formas:

- **Con la CLI (recomendado):**

  ```bash
  supabase link --project-ref <TU_PROJECT_REF>
  supabase db push
  ```

- **A mano:** copiá el contenido de
  [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql)
  en el **SQL Editor** del panel de Supabase y ejecutalo.

Esto crea las tablas (`profiles`, `curriculum_contents`, `plans`,
`plan_contents`, `generation_events`, `usage_limits`), los triggers y **todas
las políticas de RLS**.

### 2. Activar el ingreso con Google

En el panel de Supabase: **Authentication → Providers → Google** y cargá el
Client ID y Client Secret de tu proyecto de Google Cloud. En Google Cloud,
agregá como **redirect URI** autorizado:

```
https://<TU_PROJECT_REF>.supabase.co/auth/v1/callback
```

En **Authentication → URL Configuration** configurá el *Site URL*
(`http://localhost:3000` en local) y las *Redirect URLs* permitidas
(`http://localhost:3000/**`).

### 3. Obtener las claves

En **Project Settings → API** vas a encontrar:

- La **URL** del proyecto → `NEXT_PUBLIC_SUPABASE_URL`
- La clave **publishable** (segura para el navegador) →
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- La clave **secret / service role** (solo servidor) →
  `SUPABASE_SERVICE_ROLE_KEY`

---

## Variables de entorno

Ver [`.env.example`](.env.example). Resumen:

| Variable                               | Ámbito     | Descripción                                   |
| -------------------------------------- | ---------- | --------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Público    | URL del proyecto Supabase                     |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Público    | Clave publishable (RLS protege los datos)     |
| `NEXT_PUBLIC_SITE_URL`                 | Público    | URL del sitio (`http://localhost:3000`)       |
| `SUPABASE_SERVICE_ROLE_KEY`            | **Secreto**| Solo backend/scripts. Omite RLS.              |
| `GEMINI_API_KEY`                       | **Secreto**| Secret de la Edge Function. Nunca en el front.|

> **Seguridad:** los secretos **nunca** llevan el prefijo `NEXT_PUBLIC_` ni se
> usan en el navegador. `.env.local` está ignorado por git.

---

## Importar el Diseño Curricular

Los ~1.308 contenidos (1.º a 7.º grado) se cargan desde un CSV, no se escriben a
mano en el código. El CSV debe tener el encabezado:

```
grade,area,axis,content_number,content_text,source_year
```

El repositorio ya incluye el dataset completo del Diseño Curricular de Santa Fe
en [`scripts/curriculum_santa_fe.csv`](scripts/curriculum_santa_fe.csv):
**1.308 contenidos**, 5 áreas, grados 1.º a 7.º, con sus ejes reales y **sin
datos de estudiantes** (se extrajo solo N.º, Eje y Contenido de las planillas de
origen). Hay además un mini ejemplo de formato en
[`scripts/curriculum.sample.csv`](scripts/curriculum.sample.csv).

Para importar (requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`):

```bash
npm run import:curriculum -- scripts/curriculum_santa_fe.csv
```

El proceso es **idempotente**: calcula un hash por contenido y hace *upsert*, así
que se puede volver a ejecutar sin duplicar filas.

---

## Estructura del proyecto

```
src/
  app/
    (app)/                # Área privada (protegida por sesión)
      layout.tsx          #   verifica sesión + navegación
      nueva/              #   asistente de nueva planificación
      planificaciones/    #   listado y detalle
      perfil/             #   perfil de la docente
    auth/callback/        # Callback OAuth
    login/                # Ingreso con Google
    privacidad/ terminos/ # Páginas legales
    page.tsx              # Portada pública
    not-found.tsx error.tsx
  components/             # UI reutilizable (Button, nav, auth)
  features/               # Lógica por dominio
    plans/schema.ts       #   validación (interdisciplinariedad, secciones IA)
    profile/              #   perfil (form + server action)
  lib/
    env.ts               # Variables públicas validadas
    supabase/            # Clientes: navegador, servidor y proxy
  proxy.ts               # Refresco de sesión + protección de rutas (Next 16)
supabase/
  migrations/            # Esquema versionado con RLS
  functions/generate-plan/  # Edge Function de IA (esqueleto, próxima etapa)
scripts/
  import-curriculum.mjs  # Importación reproducible del currículo
```

---

## Seguridad

- **RLS activada** en todas las tablas. Cada docente ve y modifica solo sus
  propios datos; las políticas comparan `auth.uid()` con `user_id`.
- `plan_contents` valida la propiedad del plan asociado.
- `curriculum_contents` es de **solo lectura** para usuarios autenticados.
- La generación con IA se ejecutará en una **Edge Function** que valida el JWT;
  la clave de Gemini vive como secret del backend.
- No se almacenan nombres de estudiantes.

Antes de dar por terminada cada etapa, corré los **Security Advisors** del panel
de Supabase (Database → Advisors) y revisá las advertencias.

---

## Estado y próximos pasos

**Incluido en esta entrega**

- [x] Proyecto Next.js + TypeScript + Tailwind inicializado.
- [x] Diseño base responsive (identidad Montessori) y navegación móvil.
- [x] Supabase conectado por variables de entorno (clientes navegador/servidor).
- [x] Migración inicial con RLS para todas las entidades.
- [x] Autenticación "Continuar con Google" y sesión persistente.
- [x] Navegación protegida (portada pública, resto detrás de login).
- [x] Perfil editable, listado de planificaciones y páginas legales.
- [x] Validación tipada del dominio + tests.
- [x] Lint, TypeScript y build en verde.

- [x] Asistente de 4 pasos: datos, selección de contenidos (área→eje, buscador,
      contador, exige ≥2 áreas), pregunta motivadora y recurso.
- [x] Generación con IA (Gemini) con salida JSON estructurada y validada.
- [x] Guardado de planificaciones y contenidos, con detalle de secciones.

**Sobre la generación con IA**

- Modelo: `gemini-flash-latest`, con respaldo automático a
  `gemini-flash-lite-latest` cuando el principal está sobrecargado (503).
  Configurable con la variable `GEMINI_MODEL`.
- Por ahora corre en una **Server Action** de Next.js (la clave queda solo en el
  servidor, nunca en el navegador). El esqueleto de **Edge Function** en
  `supabase/functions/generate-plan/` es el paso de endurecimiento siguiente.
- Los contenidos curriculares son de **muestra** (`scripts/curriculum.sample.csv`).
  Reemplazalos por los ~1.308 reales con `npm run import:curriculum`.

**Pendiente (próximas etapas)**

- Edición por secciones desde el detalle, duplicar y eliminar (con confirmación).
- Descargas Word (.docx) y PDF.
- Migrar la generación a la Edge Function de Supabase.
- Despliegue en Vercel.
```
