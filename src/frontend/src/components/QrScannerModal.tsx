import { AlertTriangle, Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QrScannerModalProps {
  onScan: (text: string) => void;
  onClose: () => void;
}

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const supported =
    typeof window !== "undefined" && "BarcodeDetector" in window;

  useEffect(() => {
    if (!supported) return;
    let detector: {
      detect: (
        source: HTMLCanvasElement,
      ) => Promise<Array<{ rawValue: string }>>;
    };
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      detector = new (
        window as unknown as {
          BarcodeDetector: new (opts: { formats: string[] }) => typeof detector;
        }
      ).BarcodeDetector({
        formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8"],
      });
    } catch {
      setError("QR scanning is not supported on this browser/device.");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setScanning(true);

        const scan = async () => {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (!video || !canvas || video.readyState < 2) {
            animFrameRef.current = requestAnimationFrame(scan);
            return;
          }
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const codes = await detector.detect(canvas);
            if (codes.length > 0) {
              cleanup();
              onScan(codes[0].rawValue);
              return;
            }
          } catch {
            // Ignore decode errors, keep scanning
          }
          animFrameRef.current = requestAnimationFrame(scan);
        };
        animFrameRef.current = requestAnimationFrame(scan);
      })
      .catch(() => {
        setError(
          "Camera access denied. Please allow camera permissions and try again.",
        );
      });

    function cleanup() {
      cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        for (const t of streamRef.current.getTracks()) t.stop();
      }
      streamRef.current = null;
    }

    return cleanup;
  }, [supported, onScan]);

  function handleClose() {
    cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
    }
    streamRef.current = null;
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
      data-ocid="qr-scanner.dialog"
    >
      <div className="w-full max-w-sm mx-4 border-2 border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="section-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={14} />
            <span className="font-display font-bold text-xs uppercase tracking-widest">
              Scan QR / Barcode
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:opacity-70 transition-smooth"
            aria-label="Close QR scanner"
            data-ocid="qr-scanner.close_button"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4">
          {!supported ? (
            <div
              className="flex items-start gap-3 p-4 border-2 border-border bg-muted/30"
              data-ocid="qr-scanner.error_state"
            >
              <AlertTriangle
                size={18}
                className="text-destructive mt-0.5 shrink-0"
              />
              <p className="font-body text-sm text-foreground">
                QR scanning is not supported on this browser/device. Please type
                the code manually.
              </p>
            </div>
          ) : error ? (
            <div
              className="flex items-start gap-3 p-4 border-2 border-border bg-muted/30"
              data-ocid="qr-scanner.error_state"
            >
              <AlertTriangle
                size={18}
                className="text-destructive mt-0.5 shrink-0"
              />
              <p className="font-body text-sm text-foreground">{error}</p>
            </div>
          ) : (
            <>
              <div className="relative border-2 border-accent overflow-hidden bg-black aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  aria-label="Camera viewfinder"
                />
                {/* Scanner overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-accent/80">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-accent" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent" />
                  </div>
                </div>
                {scanning && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <span className="bg-black/60 text-xs font-display text-primary-foreground px-2 py-1 uppercase tracking-widest">
                      Scanning…
                    </span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <p className="font-body text-xs text-muted-foreground mt-3 text-center">
                Point the camera at a QR code or barcode to auto-fill the field.
              </p>
            </>
          )}

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="btn-ghost text-sm"
              data-ocid="qr-scanner.cancel_button"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
