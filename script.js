// ===============================
// |         Dark mode           |
// ===============================
const darkModeToggle = document.getElementById("dark-mode-toggle");

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  darkModeToggle.textContent = isDarkMode ? "☀️" : "🌙";
  
  // Guardar preferencia en localStorage.
  localStorage.setItem("darkMode", isDarkMode);
});

// Aplicar modo oscuro si estaba activo.
window.addEventListener("DOMContentLoaded", () => {
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  if (savedDarkMode) {
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = "☀️";
  }
  
  // Inicializar el generador QR.
  initQRGenerator();
});

// ===============================
// |      Generador de QR        |
// ===============================
function initQRGenerator() {
  const qrText = document.getElementById("qr-text");
  const qrColor = document.getElementById("qr-color");
  const qrSize = document.getElementById("qr-size");
  const sizeValue = document.getElementById("size-value");
  const qrDesign = document.getElementById("qr-design");
  const qrBackground = document.getElementById("qr-background");
  const qrFrame = document.getElementById("qr-frame");
  const generateBtn = document.getElementById("generate-btn");
  const downloadBtn = document.getElementById("download-btn");
  const qrCodeContainer = document.getElementById("qr-code");
  
  let currentQRCode = null;
  
  // Actualizar valor del tamaño.
  qrSize.addEventListener("input", () => {
    sizeValue.textContent = `${qrSize.value}px`;
  });
  
  // Generar código QR.
  generateBtn.addEventListener("click", generateQRCode);
  
  // Descargar código QR.
  downloadBtn.addEventListener("click", downloadQRCode);
  
  // Generar QR al presionar "Enter" en el campo de texto.
  qrText.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      generateQRCode();
    }
  });
  
  function generateQRCode() {
    const text = qrText.value.trim();
    
    if (!text) {
      alert("Por favor, ingresa un texto o URL para generar el código QR.");
      return;
    }
    
    // Verificar si la biblioteca QRCode está disponible.
    if (typeof QRCode === "undefined") {
      alert("Error: La biblioteca QRCode no se cargó correctamente. Verifica tu conexión a Internet.");
      return;
    }
    
    try {
      // Limpiar contenedor.
      qrCodeContainer.innerHTML = "";
      
      // Aplicar fondo primero.
      applyBackground();
      
      // Configuración del QR.
      const options = {
        text: text,
        width: parseInt(qrSize.value),
        height: parseInt(qrSize.value),
        colorDark: qrColor.value,
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      };
      
      // Generar QR.
      currentQRCode = new QRCode(qrCodeContainer, options);
      
      // Aplicar cuadro y diseño después de un breve delay.
      setTimeout(() => {
        applyFrame();
        applyDesign();
      }, 300);
      
      // Mostrar botón de descarga.
      downloadBtn.classList.remove("hidden");
      
    } catch (error) {
      console.error("Error generando QR.", error);
      alert("Error al generar el código QR. Intenta nuevamente.");
    }
  }
  
  function applyBackground() {
    // Remover clases de fondo anteriores.
    qrCodeContainer.classList.remove(
      "gradient1", "gradient2", "pattern1", "pattern2"
    );
    
    // Aplicar nuevo fondo si no es "none".
    const background = qrBackground.value;
    if (background !== "none") {
      qrCodeContainer.classList.add(background);
    }
  }
  
  function applyFrame() {
    // Remover cuadro anterior.
    const existingFrame = qrCodeContainer.querySelector(".qr-frame");
    if (existingFrame) {
      existingFrame.remove();
    }
    
    // Aplicar nuevo cuadro si no es "none".
    const frame = qrFrame.value;
    if (frame !== "none") {
      const frameElement = document.createElement("div");
      frameElement.className = `qr-frame frame-${frame}`;
      qrCodeContainer.appendChild(frameElement);
    }
  }
  
  function applyDesign() {
    const canvas = qrCodeContainer.querySelector("canvas");
    if (!canvas) return;
    
    const design = qrDesign.value;
    
    if (design === "default") {
      return; // No hacer cambios.
    }
    
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Aplicar diseños.
    if (design === "dots") {
      applyDotsDesign(data, canvas.width, canvas.height);
    } else if (design === "rounded") {
      applyRoundedDesign(data, canvas.width, canvas.height);
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
  
  function applyDotsDesign(data, width, height) {
    // Crear efecto de puntos.
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);
      
      // Solo procesar píxeles oscuros (parte del QR).
      if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
        // Mantener solo puntos en posiciones específicos.
        if (x % 3 === 1 && y % 3 === 1) {
          // Hacer el punto más grande.
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              const newIndex = ((y + dy) * width + (x + dx)) * 4;
              if (newIndex >= 0 && newIndex < data.length) {
                // Crear punto circular.
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= 1) {
                  data[newIndex] = 0;
                  data[newIndex + 1] = 0;
                  data[newIndex + 2] = 0;
                  data[newIndex + 3] = 255;
                }
              }
            }
          }
        } else {
          // Hacer transparente los píxeles que no son del punto central.
          data[i + 3] = 0;
        }
      }
    }
  }
  
  function applyRoundedDesign(data, width, height) {
    // Efecto redondeado en las esquinas de los módulos.
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % width;
      const y = Math.floor((i / 4) / width);
      
      if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
        // Encontrar el módulo más cercano (simulación).
        const moduleSize = 3;
        const moduleX = x % moduleSize;
        const moduleY = y % moduleSize;
        
        // Redondear esquinas.
        if ((moduleX === 0 || moduleX === moduleSize - 1) && 
            (moduleY === 0 || moduleY === moduleSize - 1)) {
          const distance = Math.sqrt(
            Math.pow(moduleX - (moduleSize - 1) / 2, 2) + 
            Math.pow(moduleY - (moduleSize - 1) / 2, 2)
          );
          
          if (distance > 1.2) {
            data[i + 3] = 0; // Hacer transparente las esquinas.
          }
        }
      }
    }
  }
  
  function downloadQRCode() {
    const canvas = qrCodeContainer.querySelector("canvas");
    
    if (!canvas) {
      alert("Primero debes generar un código QR.");
      return;
    }
    
    try {
      // Crear un canvas temporal.
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // Dibujar fondo blanco por defecto.
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Dibujar fondos personalizados.
      const background = qrBackground.value;
      if (background !== "none") {
        if (background === "gradient1") {
          const gradient = tempCtx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
          gradient.addColorStop(0, '#1565c0');
          gradient.addColorStop(1, '#42a5f5');
          tempCtx.fillStyle = gradient;
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        } else if (background === "gradient2") {
          const gradient = tempCtx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
          gradient.addColorStop(0, '#2e7d32');
          gradient.addColorStop(1, '#66bb6a');
          tempCtx.fillStyle = gradient;
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        } else {
          // Para patrones, usar fondo blanco simple.
          tempCtx.fillStyle = '#ffffff';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        }
      }
      
      // Dibujar el QR.
      tempCtx.drawImage(canvas, 0, 0);
      
      // Dibujar el cuadro si existe.
      const frame = qrFrame.value;
      if (frame !== "none") {
        tempCtx.strokeStyle = '#333';
        tempCtx.lineWidth = 3;
        
        switch (frame) {
          case "simple":
            tempCtx.strokeRect(0, 0, tempCanvas.width, tempCanvas.height);
            break;
          case "double":
            tempCtx.strokeRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.lineWidth = 1;
            tempCtx.strokeRect(6, 6, tempCanvas.width - 12, tempCanvas.height - 12);
            break;
          case "rounded":
            roundRect(tempCtx, 0, 0, tempCanvas.width, tempCanvas.height, 20);
            tempCtx.stroke();
            break;
          case "ornate":
            tempCtx.lineWidth = 2;
            tempCtx.strokeRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            tempCtx.lineWidth = 6;
            tempCtx.strokeStyle = '#fff';
            tempCtx.strokeRect(3, 3, tempCanvas.width - 6, tempCanvas.height - 6);
            
            tempCtx.lineWidth = 3;
            tempCtx.strokeStyle = '#333';
            tempCtx.strokeRect(6, 6, tempCanvas.width - 12, tempCanvas.height - 12);
            break;
        }
      }
      
      // Crear enlace de descarga.
      const link = document.createElement("a");
      link.download = "codigo-qr.png";
      link.href = tempCanvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error("Error descargando QR.", error);
      alert("Error al descargar el código QR.");
    }
  }
  
  // Función auxiliar para dibujar rectángulos redondeados.
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}