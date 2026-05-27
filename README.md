# Frontend Hotel Kairos

Frontend de la aplicación Hotel Kairos construido con React, TypeScript y Vite.

## Instalación Local

```bash
npm install
npm run dev
```

## Build para Producción

```bash
npm run build
npm run preview
```

## Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```env
VITE_API_BASE=https://middlewarejd-cnbqcdhyccb2d5du.mexicocentral-01.azurewebsites.net
```

## Despliegue en Vercel

### Configuración en Vercel Dashboard:

1. Conecta tu repositorio de GitHub a Vercel
2. Ve a **Project Settings** → **Environment Variables**
3. Agrega la variable:
   - **Name**: `VITE_API_BASE`
   - **Value**: `https://middlewarejd-cnbqcdhyccb2d5du.mexicocentral-01.azurewebsites.net`
   - **Environments**: Selecciona los que necesites (Production, Preview, Development)

4. Vercel auto-detectará que es un proyecto Vite y usará la configuración de `vercel.json`

### Verificar que funciona:

- El build automático debería funcionar
- Los requests a la API irán directamente al backend sin necesidad de proxy

---

**Nota**: Vite compila TypeScript automáticamente durante el build, por eso no es necesario ejecutar `tsc` explícitamente.
