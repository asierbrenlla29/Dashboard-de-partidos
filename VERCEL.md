# Guía de Despliegue en Vercel - Google Sheets Visualizer

Esta aplicación web utiliza una arquitectura full-stack de alto rendimiento con **Express** (backend proxy para evadir límites de CORS de Google Sheets) y **Vite + React + TypeScript** (frontend interactivo).

Para desplegar este proyecto con éxito en **Vercel**, tienes dos excelentes alternativas:

---

## Opción A: Despliegue Full-stack Completo (Sugerido)

Vercel permite correr backends de Express como Serverless Functions de Node.js de forma transparente configurando un archivo descriptivo `vercel.json` en la raíz del proyecto.

### Pasos para desplegar:

1. **Crea un archivo denominado `vercel.json` en la raíz de tu proyecto** con el siguiente contenido:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Sube tu código a GitHub** (público o privado).
3. **Importa tu repositorio en Vercel** (https://vercel.com/new).
4. El sistema detectará automáticamente las configuraciones y desplegará tanto tus rutas de API en `/api/data` como todo el compilado estático SPA en pocos segundos.

---

## Opción B: Despliegue Frontend Puro (SPA)

Si prefieres usar Vercel estrictamente como un servidor de estáticos (SPA) de coste cero y libre de funciones, puedes adaptar la capa de llamada en `src/services/googleSheets.ts` para que consulte el formato CSV público directamente.

### Ajuste de Código:
Cambia la llamada de datos en `/src/services/googleSheets.ts`:

* **De:** `const response = await fetch("/api/data");`
* **A:**
  ```typescript
  const sheetId = "1Bxl41qsmro3f8L-_AVtoeKi37_QzPNXevjBPO_E7LPY";
  const gid = "44644585";
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  const response = await fetch(csvUrl);
  ```

*(Nota: En navegadores modernos esta llamada directa de exportación CSV a veces puede rebotar por CORS corporativos, por lo que la opción Full-stack mediante proxy Server es siempre la solución recomendada).*

### Pasos para desplegar en Vercel:

1. Instala el CLI oficial de Vercel de manera global en tu terminal de desarrollo:
   ```bash
   npm install -g vercel
   ```
2. Ejecuta el comando de logueo inicial en tu área de workspace:
   ```bash
   vercel login
   ```
3. Dispara el despliegue del compilado Vite:
   ```bash
   vercel
   ```
4. Define los directorios iniciales por defecto y ¡listo! Tendrás tu enlace de producción funcionando.
