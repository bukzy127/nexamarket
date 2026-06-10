"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, Share2, Copy, Check } from "lucide-react";
import { generateProjectUrl, generateQRCodeDataUrl, downloadQRCode } from "@/lib/qrcode";

interface ProjectQRCodeProps {
  projectId: string | number;
  projectTitle: string;
  baseUrl?: string;
  size?: number;
  showDetails?: boolean;
  allowDownload?: boolean;
  allowShare?: boolean;
}

export const ProjectQRCode: React.FC<ProjectQRCodeProps> = ({
  projectId,
  projectTitle,
  baseUrl,
  size = 256,
  showDetails = true,
  allowDownload = true,
  allowShare = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const projectUrl = generateProjectUrl(projectId, baseUrl);

  // Generate QR code on mount
  useEffect(() => {
    const generateQR = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dataUrl = await generateQRCodeDataUrl(projectUrl, size);
        setQrDataUrl(dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate QR code");
        console.error("QR code generation error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    generateQR();
  }, [projectUrl, size]);

  const handleDownload = () => {
    if (qrDataUrl) {
      downloadQRCode(qrDataUrl, `${projectTitle.replace(/\s+/g, "_")}_qrcode.png`);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: projectTitle,
          text: `Check out this project: ${projectTitle}`,
          url: projectUrl,
        });
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share error:", err);
        }
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400">Failed to generate QR code</p>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl border border-cyan-500/20">
      {/* Title */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-cyan-400">Project QR Code</h3>
        <p className="text-sm text-slate-400 mt-1">{projectTitle}</p>
      </div>

      {/* QR Code Container */}
      <div className="relative">
        {isLoading ? (
          <div className="w-[256px] h-[256px] bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="p-4 bg-white rounded-lg shadow-2xl shadow-cyan-500/20 border border-cyan-500/30">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt={`QR code for ${projectTitle}`}
                width={size}
                height={size}
                className="block"
              />
            )}
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}
      </div>

      {/* Project URL Display */}
      {showDetails && (
        <div className="w-full space-y-2">
          <p className="text-xs text-slate-500">Project URL:</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs text-slate-300 break-all font-mono truncate">
              {projectUrl}
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-slate-300" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 w-full justify-center">
        {allowDownload && !isLoading && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30"
          >
            <Download size={16} />
            Download QR Code
          </button>
        )}

        {allowShare && !isLoading && (
          <>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/30"
              >
                <Share2 size={16} />
                Share Project
              </button>
            )}
          </>
        )}
      </div>

      {/* Info Text */}
      <p className="text-xs text-slate-400 text-center max-w-sm">
        Share this QR code with potential buyers. They can scan it to instantly access your project listing.
      </p>
    </div>
  );
};

export default ProjectQRCode;
