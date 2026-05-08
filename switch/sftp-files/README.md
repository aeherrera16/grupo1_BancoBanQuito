# 📁 SFTP Files - Carpeta Organizada

## 🏗️ Estructura de Directorios

```
sftp-files/
├── 📄 README.md                 # Este archivo
├──  pagos/                   # 📥 Archivos entrantes para procesar
│   └── 📄 test_sftp.csv        # Archivo de prueba
├── 📂 procesados/              # ✅ Archivos procesados exitosamente
└── 📂 errores/                 # ❌ Archivos con errores de validación
```

## 🔄 Flujo de Trabajo

1. **📥 Entrada**: Los archivos CSV se colocan en `pagos/`
2. **⚡ Procesamiento**: LocalFileProcessor lee cada 30 segundos
3. **✅ Validación RF-02**: Aplica mismas reglas que upload manual
4. **📁 Salida**: 
   - `procesados/` si la validación es exitosa
   - `errores/` si hay rechazo RF-02

## 🎯 Configuración Actual

```properties
# application-local.properties
app.sftp.enabled=false                    # SFTP real deshabilitado
app.local-processor.enabled=true          # Procesador local activado
app.local-processor.input-dir=sftp-files/pagos
app.local-processor.processed-dir=sftp-files/procesados
app.local-processor.error-dir=sftp-files/errores
```

## 🧪 Cómo Probar

1. **Colocar archivo CSV** en `pagos/`
2. **Esperar 30 segundos** (ejecución automática)
3. **Observar logs** de la aplicación Spring Boot
4. **Verificar resultado** en `procesados/` o `errores/`

## 📋 Validación RF-02 Aplicada

- ✅ **Estructura**: Montos y conteo coinciden
- ✅ **Duplicados**: Solo rechaza si archivo anterior fue procesado con éxito
- ✅ **Cliente**: RUC con servicio de pagos masivos activo
- ✅ **Early Rejection**: Antes de guardar en base de datos

## 🔧 Para Producción

Cambiar configuración a:
```properties
app.sftp.enabled=true     # Habilitar SFTP real
app.local-processor.enabled=false  # Deshabilitar procesador local
```
