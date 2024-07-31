export class ImageUtil {
  static cropImageToDataUrl(image: HTMLImageElement, dim: { width: number, height: number }) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = dim.width ?? image.width;
    canvas.height = dim.height ?? image.height;
    ctx?.drawImage(image, 0, 0);
    return (canvas.toDataURL());
  }
  static async cropImgDataUrl(url: string, dim: { width: number, height: number }) {
    return new Promise<string>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve(ImageUtil.cropImageToDataUrl(image, dim));
      };
      image.onerror = reject;
      image.src = url;
    })
  }
  static imageFromDataUrl(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        resolve(image);
      };
      image.onerror = reject;
      image.src = url;
    })
  }
  static async getDataUrlFromFile(file: Blob): Promise<string | undefined> {
    if (file) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener(
          'load',
          () => {
            resolve(reader.result as string);
          },
          false
        );
        reader.addEventListener('error', (e) => reject(e));
        reader.readAsDataURL(file);
      });
    }
  }
}
