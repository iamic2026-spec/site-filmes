/**
 * Utility to process uploaded user images:
 * Reads a File, centers and crops to a square, resizes to a target dimension,
 * and returns an optimized data URL suitable for immediate display and localStorage.
 */
export function processImageFile(file: File, targetSize: number = 280): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        // Center square crop coordinates
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Draw cropped and scaled image onto canvas
        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          targetSize,
          targetSize
        );

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(optimizedDataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao carregar os dados da imagem.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Utility to process uploaded movie posters:
 * Reads a File, centers and crops to a 2:3 cinematic poster aspect ratio (400x600),
 * and returns an optimized data URL suitable for instant preview and persistence.
 */
export function processMoviePosterFile(
  file: File,
  targetWidth: number = 400,
  targetHeight: number = 600
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('O arquivo selecionado não é uma imagem válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const imgWidth = img.naturalWidth || img.width;
        const imgHeight = img.naturalHeight || img.height;

        // Target aspect ratio 2:3 (e.g., 400 / 600 = 0.6667)
        const targetAspect = targetWidth / targetHeight;
        const currentAspect = imgWidth / imgHeight;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = imgWidth;
        let sourceHeight = imgHeight;

        if (currentAspect > targetAspect) {
          // Source is wider than 2:3, crop sides
          sourceWidth = imgHeight * targetAspect;
          sourceX = (imgWidth - sourceWidth) / 2;
        } else {
          // Source is taller than 2:3, crop top and bottom
          sourceHeight = imgWidth / targetAspect;
          sourceY = (imgHeight - sourceHeight) / 2;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          targetWidth,
          targetHeight
        );

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(optimizedDataUrl);
      };
      img.onerror = () => reject(new Error('Erro ao processar imagem do pôster.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo do pôster.'));
    reader.readAsDataURL(file);
  });
}
