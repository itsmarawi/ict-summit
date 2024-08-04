import Worker from 'src/workers/jsqr/jsqr.worker?worker';
import {
  JsqrMessageEvent,
  JsqrRequestEvent,
} from 'src/workers/jsqr/jsqr-message.event';
import { DeferredPromise } from 'src/resources/localbase';
import { RafflePrice } from 'src/entities';

export type TargetCamera = 'environment' | 'front' | string;
export type CanvasProperties = { width: number; height: number };
export type ResultType = RafflePrice | string | null;
export type QRReaderOptions = {
  elemSelect: string;
  guideFrameSize?: number;
  canvasProperties?: CanvasProperties;
  torch?: boolean;
  decodedCb?: (qrcode?: ResultType) => void;
  errorCb?: (error: string) => void;
};

export class QRReader {
  private decoder = new Worker();
  private active = false;
  private webcam?: HTMLVideoElement | HTMLImageElement | null;
  public canvas?: HTMLCanvasElement;
  private guideFrame?: HTMLDivElement;
  private ctx?: CanvasRenderingContext2D | null;
  private targetCamera: TargetCamera = 'environment';
  constructor(private options: QRReaderOptions) {}
  sendMessage(message: JsqrRequestEvent) {
    if (message.event == 'processImage') {
      this.active = true;
    }
    this.decoder.postMessage(message);
  }

  setImagingSource() {
    if (typeof window.MediaStream !== 'undefined') {
      this.webcam = document.querySelector(
        this.options.elemSelect + ' video'
      ) as HTMLVideoElement;
    } else {
      this.webcam = document.querySelector(
        this.options.elemSelect + ' img'
      ) as HTMLImageElement;
    }
    this.guideFrame = document.querySelector(
      this.options.elemSelect + ' .guide-frame'
    ) as HTMLDivElement;
    if (!this.webcam) {
      this.options.errorCb?.call(this, 'No Imaging Source Found(video or img)');
    }
  }
  async setCamera(targetCamera: TargetCamera) {
    const isPreActive = this.active;
    if (isPreActive) {
      this.stop();
    }
    this.targetCamera = targetCamera;
    await this.init();
    if (isPreActive && this.webcam instanceof HTMLVideoElement) {
      await this.scan();
    }
  }
  private startCapture(constraints: MediaStreamConstraints) {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (!this.webcam || !(this.webcam instanceof HTMLVideoElement)) return;
        this.webcam.srcObject = stream;
        this.webcam.setAttribute('playsinline', 'true');
        this.webcam.setAttribute('controls', 'true');
        this.webcam.autofocus = true;

        setTimeout(() => {
          if (!this.webcam) return;
          this.webcam.removeAttribute('controls');
        });
      })
      .catch((err) => {
        console.log('Error occurred ', err);
        this.options.errorCb?.call(this, err);
      });
  }
  isMediaSupported() {
    return (
      navigator &&
      navigator.mediaDevices &&
      'enumerateDevices' in navigator.mediaDevices
    );
  }
  isAniOS() {
    return (
      [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
      ].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }
  async init() {
    let streaming = false;
    // Init Webcam + Canvas
    this.setImagingSource();

    if (this.isMediaSupported() && this.webcam) {
      // Resize webcam according to input
      this.webcam.addEventListener(
        'play',
        () => {
          if (!streaming) {
            streaming = true;
          }
        },
        false
      );
    }
    if (this.isMediaSupported()) {
      return navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const cameras = devices.filter(
            (device) => device.kind == 'videoinput'
          );
          let constraints: MediaStreamConstraints;
          if (cameras.length > 0 && this.targetCamera == 'environment') {
            //select last camera
            const lastCamera = cameras[cameras.length - 1];
            constraints = {
              video: {
                deviceId: lastCamera.deviceId,
              },
              audio: false,
            };
            if (this.isAniOS() && typeof constraints.video === 'object') {
              constraints.video.facingMode = 'environment';
            }
            this.startCapture(constraints);
          } else if (cameras.length) {
            //select first camera
            const firstCamera = cameras[cameras.length - 1];
            constraints = {
              video: {
                deviceId: firstCamera.deviceId,
              },
              audio: false,
            };

            if (this.isAniOS() && typeof constraints.video === 'object') {
              constraints.video.facingMode = 'environment';
            }
            if (!constraints.video && !this.isAniOS()) {
              this.startCapture({ video: true });
            } else {
              this.startCapture(constraints);
            }
            return;
          }
          this.startCapture({ video: true });
        })
        .catch((error) => {
          this.options.errorCb?.call(this, error);
          console.error('Error occurred : ', error);
        });
    }
  }
  stop() {
    this.active = false;
    const camera = this.webcam as HTMLVideoElement;
    if (camera) {
      const srcObj = camera.srcObject as MediaStream;
      if (srcObj.getTracks()) {
        srcObj.getTracks().forEach((track) => track.stop());
      }
    }
    this.decoder.terminate();
  }

  setTorch(on?: boolean) {
    const camera = this.webcam as HTMLVideoElement;
    const srcObj = camera.srcObject as MediaStream;
    const tracks = srcObj.getVideoTracks();
    const capable =
      tracks?.length &&
      (tracks[0].getCapabilities() as { torch: boolean }).torch;
    if (typeof on == 'boolean' && this.options.torch === on) return capable;
    else on = typeof on == 'undefined' ? true : on;
    if (capable) {
      const [track] = tracks;
      track.applyConstraints({
        advanced: [
          {
            torch: on || false,
          } as MediaTrackConstraintSet,
        ],
      });
      this.options.torch = on;
    }
    return capable;
  }
  async setZoom(zoom: number) {
    const camera = this.webcam as HTMLVideoElement;
    const srcObj = camera.srcObject as MediaStream;
    const tracks = srcObj.getVideoTracks();
    const [videoTrack] = tracks;
    const settings = videoTrack.getSettings();
    if ('zoom' in settings) {
      await videoTrack.applyConstraints({
        advanced: [
          {
            zoom: Math.min(1, zoom),
          } as MediaTrackConstraintSet,
        ],
      });
      return true;
    }
    return false;
  }
  async scan(): Promise<void> {
    this.active = true;
    if (!this.webcam) return;
    const deferred = new DeferredPromise<void>();
    const start = () => {
      deferred.resolve();
      this.webcam?.removeEventListener('play', start);
    };
    this.webcam.addEventListener('play', start);
    await deferred.promise;
    this.setCanvas();

    if (!this.canvas || !this.ctx || !(this.webcam instanceof HTMLVideoElement))
      return;
    this.setGuideFrame();
    if (this.options.torch) this.setTorch();
    const newDecoderFrame = () => {
      if (
        !this.active ||
        !this.ctx ||
        !(this.webcam instanceof HTMLVideoElement) ||
        !this.canvas
      )
        return;
      const guideFrameSize = this.getGuideFrameSize();
      const ratio = this.computeFrameRatio();
      const r = Math.max(ratio.rx, ratio.ry);
      const qrFrameSize = Math.round(guideFrameSize * (1 / r));
      const qrTop = Math.round((this.webcam.videoHeight - qrFrameSize) / 2);
      const qrLeft = Math.round((this.webcam.videoWidth - qrFrameSize) / 2);
      this.canvas.width = qrFrameSize;
      this.canvas.height = qrFrameSize;
      try {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
          this.webcam,
          qrLeft,
          qrTop,
          guideFrameSize,
          guideFrameSize,
          0,
          0,
          qrFrameSize,
          qrFrameSize
        );
        const imgData = this.ctx.getImageData(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        if (imgData.data) {
          this.sendMessage({
            event: 'processImage',
            data: imgData,
          });
        }
      } catch (e) {
        // Try-Catch to circumvent Firefox Bug #879717
        if ((e as { name?: string }).name == 'NS_ERROR_NOT_AVAILABLE')
          setTimeout(newDecoderFrame, 0);
      }
    };
    this.listenToWorker(newDecoderFrame);
    // Start QR-decoder
    newDecoderFrame();

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.setImagingSource();
        resolve((this.webcam as HTMLVideoElement).play());
      });
    });
  }
  listenToWorker(newDecoderFrame?: () => void) {
    this.decoder.onmessage = (event: MessageEvent<JsqrMessageEvent>) => {
      const message = event.data;
      if (message.event == 'decoded') {
        const content = message.data.content as unknown as ResultType;
        if (content && this.active) {
          this.options.decodedCb?.call(this, content);
        } else {
          this.options.decodedCb?.call(this);
        }
        if (newDecoderFrame) {
          setTimeout(newDecoderFrame, 0);
        }
      } else if (message.event == 'invalid' && this.options.errorCb) {
        this.options.errorCb?.call(this, String(message.data.message));
      }
    };
  }

  setCanvas() {
    //used ONLY for generating payload to webworker
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    const previewDiv = document.querySelector(
      this.options.elemSelect + '-preview'
    ) as HTMLDivElement | undefined;
    if (previewDiv) {
      previewDiv.querySelector('canvas')?.remove();
      previewDiv.appendChild(this.canvas);
    }
  }
  getGuideFrameSize() {
    if (!(this.webcam instanceof HTMLVideoElement))
      return this.options.guideFrameSize || 300;
    return Math.min(
      this.options.guideFrameSize || 300,
      this.webcam.offsetWidth,
      this.webcam.offsetHeight
    );
  }
  computeFrameGuideDim() {
    if (!this.webcam) {
      return { min: 300, max: 400 };
    }
    const max = Math.min(this.webcam.offsetWidth, this.webcam.offsetHeight);
    return { max, min: Math.min(2 * Math.round(max / 3)) };
  }
  computeFrameRatio() {
    if (!this.webcam) {
      return { rx: 1, ry: 1 };
    }
    return {
      ry: this.webcam.offsetHeight / this.webcam.height,
      rx: this.webcam.offsetWidth / this.webcam.width,
    };
  }
  setGuideFrame(size?: number | null) {
    if (!this.canvas || !(this.webcam instanceof HTMLVideoElement)) return;
    if (typeof size == 'number') {
      if (this.options.guideFrameSize == size) return;
      this.options.guideFrameSize = size;
    }
    const guideFrameSize = this.getGuideFrameSize();
    if (this.guideFrame) {
      //draw the guide frame
      this.guideFrame.style.width = `${guideFrameSize}px`;
      this.guideFrame.style.height = `${guideFrameSize}px`;
      this.guideFrame.style.bottom = `${Math.round(
        (this.webcam.offsetHeight - guideFrameSize) / 2
      )}px`;
      this.guideFrame.style.left = `${Math.round(
        (this.webcam.offsetWidth - guideFrameSize) / 2
      )}px`;
    }
  }
}

export default QRReader;
