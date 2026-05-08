# Frontend Validador de Archivos

Este proyecto permite cargar y validar archivos planos estructurados para pagos masivos.

## Uso

1. Configura la URL del backend en el archivo `.env`:

```
VITE_BACKEND_URL=http://localhost:8080/api/validar-archivo
```

2. Inicia la aplicación:

```
npm run dev
```

3. Sube un archivo `.txt` o `.csv` y visualiza el resultado de la validación.

## Variables de entorno
- `VITE_BACKEND_URL`: URL del endpoint backend para validar archivos.

## Requisitos
- Node.js 18+
- Backend Java con endpoint de validación disponible
