/**
 * QR Code utility functions for project sharing
 * Generates unique QR codes that redirect to project detail pages
 */

import QRCode from "qrcode";

export interface QRCodeConfig {
  projectId: string | number;
  projectTitle: string;
  baseUrl?: string;
}

/**
 * Generate a project URL for QR code encoding
 * @param projectId - The unique project identifier
 * @param baseUrl - Optional base URL (defaults to current origin)
 * @returns The full URL for the project detail page
 */
export function generateProjectUrl(
  projectId: string | number,
  baseUrl?: string
): string {
  const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "https://nexamarket.com");
  return `${base}/project/${projectId}`;
}

/**
 * Generate a QR code as a data URL
 * @param value - The value to encode (usually a URL)
 * @param size - QR code size in pixels
 * @param errorCorrectionLevel - Error correction level (L, M, Q, H)
 * @returns Promise resolving to data URL
 */
export async function generateQRCodeDataUrl(
  value: string,
  size: number = 256,
  errorCorrectionLevel: "L" | "M" | "Q" | "H" = "H"
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(value, {
      errorCorrectionLevel,
      margin: 1,
      width: size,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Generate a QR code as a canvas blob
 * @param value - The value to encode
 * @param size - QR code size in pixels
 * @returns Promise resolving to Blob
 */
export async function generateQRCodeBlob(
  value: string,
  size: number = 256
): Promise<Blob> {
  try {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, value, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: size,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      }, "image/png");
    });
  } catch (error) {
    console.error("Failed to generate QR code blob:", error);
    throw error;
  }
}

/**
 * Download a QR code image
 * @param dataUrl - The data URL of the QR code
 * @param filename - The filename for the downloaded image
 */
export function downloadQRCode(dataUrl: string, filename: string = "qrcode.png"): void {
  try {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download QR code:", error);
    throw new Error("Failed to download QR code");
  }
}

/**
 * Get the current project URL from route params
 * Used in API routes and server functions
 */
export function getProjectIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/\/project\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Generate a unique QR code identifier
 * Could be used to track QR codes in the database
 */
export function generateQRCodeId(): string {
  return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate if a QR code URL is still valid
 * Checks if the project still exists
 */
export async function validateQRCodeUrl(projectId: string | number): Promise<boolean> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: "GET",
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to validate QR code URL:", error);
    return false;
  }
}

export default {
  generateProjectUrl,
  generateQRCodeDataUrl,
  generateQRCodeBlob,
  downloadQRCode,
  getProjectIdFromUrl,
  generateQRCodeId,
  validateQRCodeUrl,
};
