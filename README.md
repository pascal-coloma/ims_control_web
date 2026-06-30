# IMS Control Web

Panel de control web para IMS Ambulancias. Permite al personal de control gestionar despachos, pacientes, atenciones, personal, flota, inventario, grupos y auditoría.

## Stack

- React 19 + TypeScript + Vite
- [Mantine](https://mantine.dev) (UI, forms, dates, notifications)
- React Router para el ruteo
- TanStack Query para estado de servidor
- Zustand para estado de auth
- Firebase (mensajería push / FCM)

## Requisitos

- Node 20+
- Variables de entorno (archivo `.env.local`):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_WEB_APP_ID`
  - `VITE_FIREBASE_VAPID_KEY`

## Desarrollo

```bash
npm install
npm run dev
```

`predev`/`prebuild` generan `public/firebase-messaging-sw.js` a partir del template, inyectando las claves de Firebase.

En desarrollo, Vite proxea `/ims` hacia `https://api.imsambulancias.cl` (ver [vite.config.ts](vite.config.ts)).

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — type-check (`tsc -b`) + build de producción
- `npm run preview` — sirve el build localmente
- `npm run lint` — ESLint

## Estructura

```
src/
  api/        # cliente fetch + funciones por recurso (despachos, pacientes, personal, ...)
  components/ # componentes compartidos
  hooks/      # hooks compartidos
  layout/     # shell de la app
  lib/        # firebase, etc.
  pages/      # una carpeta por sección (atenciones, despachos, flota, grupos, inventario, pacientes, personal, auditoria, auth)
  routes/     # guards de auth/rol (AuthGuard, RoleGuard, GuestGuard)
  stores/     # estado global (zustand)
  types/      # tipos compartidos
  utils/      # utilidades
```

El acceso está restringido a usuarios con rol `control`; el resto es redirigido a una pantalla de bloqueo (ver [src/routes](src/routes)).

## Despliegue

`main` se despliega automáticamente a EC2 vía rsync al hacer push (ver [.github/workflows/deploy.yml](.github/workflows/deploy.yml)).
