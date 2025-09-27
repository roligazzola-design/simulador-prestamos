# 🚀 Simulador de Préstamos - Implementación Web

## 📋 Instrucciones de Deployment

### PASO 1: Crear Proyecto React
```bash
# Crear carpeta del proyecto
mkdir simulador-prestamos
cd simulador-prestamos

# Crear estructura de carpetas
mkdir public src
```

### PASO 2: Copiar Archivos
Copiar los siguientes archivos en su ubicación correspondiente:

```
simulador-prestamos/
├── public/
│   └── index.html          (copiar desde artefacto)
├── src/
│   ├── App.js             (copiar desde artefacto)
│   ├── index.js           (copiar desde artefacto)
│   └── index.css          (copiar desde artefacto)
├── package.json           (copiar desde artefacto)
└── README.md              (este archivo)
```

### PASO 3: Subir a GitHub
1. Ir a **github.com** y crear cuenta si no tienes
2. Crear nuevo repositorio: "simulador-prestamos"
3. Marcar como **público**
4. No inicializar con README (ya tienes uno)
5. Subir todos los archivos al repositorio

### PASO 4: Deploy en Vercel
1. Ir a **vercel.com**
2. Registrarse con GitHub
3. Hacer clic en "New Project"
4. Seleccionar tu repositorio "simulador-prestamos"
5. **Framework Preset**: React
6. Hacer clic en "Deploy"

### PASO 5: Configuración Automática
Vercel detectará automáticamente:
- ✅ Framework: React
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `build`
- ✅ Install Command: `npm install`

### 🎯 URL Final
Tu aplicación estará disponible en:
`https://simulador-prestamos-[tu-usuario].vercel.app`

---

## 🔧 Alternativas de Hosting

### OPCIÓN 2: Netlify
1. Ir a **netlify.com**
2. "New site from Git"
3. Conectar GitHub
4. Seleccionar repositorio
5. Deploy automático

### OPCIÓN 3: GitHub Pages
1. En tu repositorio GitHub
2. Settings → Pages
3. Source: GitHub Actions
4. Seleccionar workflow de React

---

## 🛠️ Desarrollo Local (Opcional)

Si quieres probar localmente antes del deploy:

```bash
# Instalar Node.js desde nodejs.org
# Luego en la carpeta del proyecto:

npm install
npm start
```

La aplicación se abrirá en `http://localhost:3000`

---

## ✅ Funcionalidades

- 🔐 Sistema de autenticación
- 🧮 Cálculos financieros (Francés, Alemán, Americano)
- 📅 Fechas y períodos de gracia
- 💰 Cronogramas completos
- 📊 Exportación CSV
- 💾 Guardado de simulaciones
- 📱 Responsive design

---

## 🆘 Solución de Problemas

### Error de Build
Si hay errores durante el build:
1. Verificar que todos los archivos estén en las carpetas correctas
2. Revisar que package.json esté en la raíz
3. Verificar que no falten dependencias

### CSS no funciona
- Asegurarse de que index.css esté importado en index.js
- Verificar que el CDN de Tailwind esté en index.css

### Deploy falla
- Verificar que el repositorio sea público
- Revisar los logs de build en Vercel/Netlify
- Confirmar que package.json esté correcto

---

## 📞 Soporte

Si tienes problemas:
1. Revisar logs de build en la plataforma
2. Verificar estructura de archivos
3. Probar deployment en otra plataforma

¡Tu simulador estará online en pocos minutos! 🎉