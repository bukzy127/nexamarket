import { useCallback, useState } from "react";
import { generateProjectUrl, generateQRCodeDataUrl } from "@/lib/qrcode";

interface UseProjectQRCodeReturn {
  isGenerating: boolean;
  isStoring: boolean;
  error: string | null;
  generateAndStoreQRCode: (projectId: string | number, projectTitle: string, baseUrl?: string) => Promise<string>;
  retrieveQRCode: (projectId: string | number) => Promise<{ dataUrl: string; projectTitle: string; createdAt: string } | null>;
  deleteQRCode: (projectId: string | number) => Promise<boolean>;
}

/**
 * Hook for managing project QR codes
 * Handles generation, storage, and retrieval
 */
export function useProjectQRCode(): UseProjectQRCodeReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAndStoreQRCode = useCallback(
    async (projectId: string | number, projectTitle: string, baseUrl?: string): Promise<string> => {
      try {
        setIsGenerating(true);
        setError(null);

        // Generate QR code
        const projectUrl = generateProjectUrl(projectId, baseUrl);
        const dataUrl = await generateQRCodeDataUrl(projectUrl, 256);

        // Store QR code
        setIsStoring(true);
        const response = await fetch("/api/qrcode", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: String(projectId),
            projectTitle,
            dataUrl,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to store QR code");
        }

        return dataUrl;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        throw err;
      } finally {
        setIsGenerating(false);
        setIsStoring(false);
      }
    },
    []
  );

  const retrieveQRCode = useCallback(
    async (projectId: string | number): Promise<{ dataUrl: string; projectTitle: string; createdAt: string } | null> => {
      try {
        setError(null);
        const response = await fetch(`/api/qrcode?projectId=${projectId}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error("Failed to retrieve QR code");
        }

        const data = await response.json();
        return {
          dataUrl: data.dataUrl,
          projectTitle: data.projectTitle,
          createdAt: data.createdAt,
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errorMsg);
        return null;
      }
    },
    []
  );

  const deleteQRCode = useCallback(async (projectId: string | number): Promise<boolean> => {
    try {
      setError(null);
      const response = await fetch(`/api/qrcode?projectId=${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete QR code");
      }

      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return false;
    }
  }, []);

  return {
    isGenerating,
    isStoring,
    error,
    generateAndStoreQRCode,
    retrieveQRCode,
    deleteQRCode,
  };
}

export default useProjectQRCode;
