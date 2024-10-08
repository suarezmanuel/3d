export class png_sampler {

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public width: number = 0;
  public height: number = 0;
  public bytesPerPixel: number = 4; // Always RGBA in canvas
  public bytesPerLine: number = 0;
  public pixels: Uint8ClampedArray | null = null;
  private initialized: boolean = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  public async init_sampler(src: string): Promise<void> {

    return new Promise((resolve, reject) => {

      const img = new Image();
      img.onload = () => {

        this.width = img.width;
        this.height = img.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        this.pixels = imageData.data;
        this.bytesPerLine = this.width * this.bytesPerPixel;
        this.initialized = true;
        resolve();
      };

      img.onerror = reject;
      img.src = src;
    });
  }

  public print_info() {

    if (!this.initialized) {
      console.warn("PNG not initialized. Call init_sampler first.");
      return;
    }

    console.log("\n-----------PNG info-----------");
    console.log("img width", this.width);
    console.log("img height", this.height);
    console.log("bytes per pixel", this.bytesPerPixel);
    console.log("bytes per line", this.bytesPerLine);
    console.log("pixel bytes", this.pixels ? this.pixels.length : 0);
    console.log("------------------------------\n");
  }

  public sample_pixel(x: number, y: number, off: number, size: number): [number, number, number, number] {

    x = off + Math.floor(x*size);
    y = off + Math.floor(y*size);

    if (!this.initialized || !this.pixels) {
      throw new Error('PNG not initialized. Call init_sampler first');
    }
    if (x >= this.width || y >= this.height || x < 0 || y < 0) {
      throw new Error("coordinate values out of range");
    }

    const index = (y * this.width + x) * this.bytesPerPixel;
    return [
      this.pixels[index],
      this.pixels[index + 1],
      this.pixels[index + 2],
      this.pixels[index + 3]
    ];
  }

  public is_initialized(): boolean {
    return this.initialized;
  }
}

export async function sample_rectangle(x: number, y: number, canvasWidth: number, canvasHeight: number, imgWidth: number, imgHeight: number, imgSrc: string): Promise<HTMLCanvasElement> {
  let sampler = new png_sampler();
  await sampler.init_sampler(imgSrc);

  if (!sampler.is_initialized()) {
    throw new Error('Failed to initialize PNG sampler');
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(canvasWidth, canvasHeight);

  console.time("sampling pixels");
  for (let j = 0; j < canvasHeight; j++) {
    for (let i = 0; i < canvasWidth; i++) {
      // Calculate the corresponding position in the original image
      const imgX = x + (i / canvasWidth) * imgWidth;
      const imgY = y + (j / canvasHeight) * imgHeight;
      
      // Sample the pixel from the original image
      const pixel = sampler.sample_pixel(imgX, imgY, 0, 1);
      
      // Set the pixel in the canvas image data
      const offset = (j * canvasWidth + i) * 4;
      imageData.data.set(pixel, offset);
    }
  }
  console.timeEnd("sampling pixels");

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}