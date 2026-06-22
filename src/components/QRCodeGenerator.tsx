"use client";

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

interface QRCodeGeneratorProps {
  value: string;
  title?: string;
  size?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  title = "QR Code",
  size = 256,
  errorCorrectionLevel = "H",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          errorCorrectionLevel,
          margin: 1,
          width: size,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error: Error | null | undefined) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [value, size, errorCorrectionLevel]);

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "_")}_qrcode.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-cyan-500/20">
      {/* Title */}
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-cyan-400">{title}</h3>
          <p className="text-sm text-slate-400 mt-1">Scan with any QR code reader</p>
        </div>
      )}

      {/* QR Code Canvas */}
      <div className="p-4 bg-white rounded-lg shadow-lg">
        <canvas ref={canvasRef} />
      </div>

      {/* Value Display */}
      <div className="w-full">
        <p className="text-xs text-slate-500 mb-2">Encoded Value:</p>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 break-all font-mono max-h-24 overflow-y-auto">
          {value}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={downloadQRCode}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm text-black transition-all"
        style={{
          background: "linear-gradient(135deg, #00d4ff, #0050e6)",
          boxShadow: "0 0 16px rgba(0,212,255,0.25)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #00e5ff, #0070f3)";
          e.currentTarget.style.boxShadow = "0 0 32px rgba(0,212,255,0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(135deg, #00d4ff, #0050e6)";
          e.currentTarget.style.boxShadow = "0 0 16px rgba(0,212,255,0.25)";
        }}
      >
        <Download size={16} />
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeGenerator;
