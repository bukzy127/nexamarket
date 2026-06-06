"use client";

import { signWalletMessage } from "@/lib/wallet";

export interface VerifiedDownloadResult {
  fileUrl: string;
  fileName?: string;
}

export async function requestVerifiedProjectDownload(
  projectId: number,
  wallet: string,
): Promise<VerifiedDownloadResult> {
  const message = `NexaMarket download\nWallet: ${wallet}\nProject: ${projectId}`;
  const signature = await signWalletMessage(message);
  const res = await fetch(`/api/projects/${projectId}/download`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, message, signature }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || "Download access could not be verified.");
  }

  const data = (await res.json()) as {
    fileUrl?: string;
    downloadUrl?: string;
    fileName?: string;
  };
  const fileUrl = data.fileUrl || data.downloadUrl;
  if (!fileUrl) {
    throw new Error("The verified download did not return a file URL.");
  }

  return { fileUrl, fileName: data.fileName };
}

export async function openVerifiedProjectDownload(
  projectId: number,
  wallet: string,
): Promise<VerifiedDownloadResult> {
  const download = await requestVerifiedProjectDownload(projectId, wallet);
  window.open(download.fileUrl, "_blank", "noopener,noreferrer");
  return download;
}
