import imageCompression from 'browser-image-compression';

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Giới hạn kích thước tối đa 1MB
    maxWidthOrHeight: 1920, // Giới hạn kích thước ảnh
    useWebWorker: true,
    fileType: 'image/jpeg', // Convert sang JPEG để giảm kích thước
    quality: 0.8, // Chất lượng 80%
  };

  try {
    console.log('Compressing image...', {
      originalSize: file.size,
      originalType: file.type
    });
    
    const compressedFile = await imageCompression(file, options);
    
    console.log('Image compressed successfully:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      compressionRatio: ((file.size - compressedFile.size) / file.size * 100).toFixed(1) + '%'
    });
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Không thể nén ảnh. Vui lòng thử ảnh khác.');
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể đọc kích thước ảnh'));
    };
    
    img.src = url;
  });
}