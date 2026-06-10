"use client";

import { useState } from "react";
import { TOKENS } from "@/lib/tokens";
import ProjectQRCode from "@/components/ProjectQRCode";
import Card from "@/components/ui/Card";
import Btn from "@/components/ui/Btn";
import Icon from "@/components/ui/Icon";

export default function QRCodeDemoPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>(1);
  const [showQRCode, setShowQRCode] = useState(false);

  // Sample projects for demo
  const sampleProjects = [
    { id: 1, title: "High-Rise Residential Tower" },
    { id: 2, title: "Commercial Office Complex" },
    { id: 3, title: "Hospital MEP Design" },
    { id: 4, title: "Foundation Design Study" },
    { id: 5, title: "Steel Details Package" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${TOKENS.bg0} 0%, ${TOKENS.bg1} 100%)`,
        paddingTop: 80,
        paddingBottom: 60,
      }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Project QR Code System</h1>
        <p className="text-lg text-slate-400">
          Share your projects instantly with buyers using unique QR codes
        </p>
      </div>

      {/* Demo Container */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Selection */}
          <div className="lg:col-span-1">
            <Card style={{ borderColor: TOKENS.border, background: `${TOKENS.bg1}dd` }}>
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                  <Icon name="blueprint" />
                  Select Project
                </h2>

                <div className="space-y-2">
                  {sampleProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowQRCode(true);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedProjectId === project.id
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                          : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50"
                      }`}
                    >
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-slate-400 mt-1">ID: {project.id}</div>
                    </button>
                  ))}
                </div>

                {showQRCode && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-3">
                      Selected: <strong>{selectedProjectId}</strong>
                    </p>
                    <Btn
                      onClick={() => {
                        const url = `/project/${selectedProjectId}`;
                        window.open(url, "_blank");
                      }}
                      style={{ width: "100%" }}
                    >
                      <Icon name="arrow" size={14} /> Open Project
                    </Btn>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* QR Code Display */}
          <div className="lg:col-span-2">
            {showQRCode && (
              <div className="animate-fadeIn">
                <ProjectQRCode
                  projectId={selectedProjectId}
                  projectTitle={
                    sampleProjects.find((p) => p.id === selectedProjectId)?.title ||
                    `Project ${selectedProjectId}`
                  }
                  size={280}
                  showDetails={true}
                  allowDownload={true}
                  allowShare={true}
                />
              </div>
            )}

            {!showQRCode && (
              <Card
                style={{
                  borderColor: TOKENS.border,
                  background: `${TOKENS.bg1}dd`,
                  textAlign: "center",
                  padding: "60px 40px",
                }}
              >
                <Icon
                  name="code"
                  size={48}
                  color={TOKENS.cyan}
                  style={{ margin: "0 auto 16px" }}
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a Project
                </h3>
                <p className="text-slate-400">
                  Choose a project from the list to generate and download its QR code
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Feature Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "Generate QR Codes",
              description: "Automatically generate unique QR codes for each project upload",
              icon: "zap" as const,
            },
            {
              title: "Easy Sharing",
              description: "Download or share QR codes with potential buyers instantly",
              icon: "download" as const,
            },
            {
              title: "Direct Access",
              description: "Buyers scan the QR code to instantly view your project details",
              icon: "arrow" as const,
            },
          ].map((feature, idx) => (
            <Card
              key={idx}
              style={{
                borderColor: TOKENS.border,
                background: `${TOKENS.bg1}dd`,
                textAlign: "center",
              }}
            >
              <div className="p-6">
                <Icon name={feature.icon} size={32} color={TOKENS.cyan} />
                <h3 className="text-lg font-semibold text-white mt-4 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
