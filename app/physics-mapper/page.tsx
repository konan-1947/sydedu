"use client";

import { useState } from "react";
import PageShell from "../components/PageShell";
import FileUpload from "../components/FileUpload";
import { Download, Play, LinkIcon } from "lucide-react";

export default function PhysicsMapperPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");

  return (
    <PageShell>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Real-world Physics Mapper
            </h1>
            <p className="text-gray-500 mb-8">
              Phân tích video thực tế và trích xuất đồ thị chuyển động vật lý
            </p>

            {/* Upload section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <FileUpload
                accept="video/*"
                label="Kéo thả video vào đây"
                description="MP4, MOV, AVI"
              />
              <div className="flex flex-col justify-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Hoặc dán link YouTube
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-white">
                    <LinkIcon size={16} className="text-gray-400" />
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1 text-sm focus:outline-none"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors">
                    <Play size={16} />
                    Phân tích
                  </button>
                </div>
              </div>
            </div>

            {/* Video + Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Video player mockup */}
              <div className="lg:col-span-2 bg-gray-900 rounded-2xl aspect-video flex items-center justify-center relative overflow-hidden">
                <p className="text-gray-500 text-sm">Video preview</p>
                {/* Overlay vectors mockup */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 450">
                  <line x1="200" y1="350" x2="400" y2="200" stroke="#10b981" strokeWidth="2" strokeDasharray="6" />
                  <line x1="400" y1="200" x2="600" y2="300" stroke="#10b981" strokeWidth="2" strokeDasharray="6" />
                  <circle cx="200" cy="350" r="5" fill="#10b981" />
                  <circle cx="400" cy="200" r="5" fill="#10b981" />
                  <circle cx="600" cy="300" r="5" fill="#10b981" />
                  {/* velocity vector */}
                  <line x1="400" y1="200" x2="450" y2="170" stroke="#f59e0b" strokeWidth="2" markerEnd="url(#arrow)" />
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
                    </marker>
                  </defs>
                </svg>
              </div>

              {/* Charts panel */}
              <div className="space-y-4">
                <ChartPlaceholder title="Đồ thị x - t" color="blue" />
                <ChartPlaceholder title="Đồ thị v - t" color="emerald" />
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  <Download size={18} />
                  Xuất Excel
                </button>
              </div>
            </div>
          </div>
        </main>
    </PageShell>
  );
}

function ChartPlaceholder({ title, color }: { title: string; color: string }) {
  const barColor = color === "blue" ? "bg-blue-400" : "bg-emerald-400";
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <div className="h-28 flex items-end gap-1.5 px-2">
        {[40, 55, 35, 70, 60, 80, 65, 75, 50, 85].map((h, i) => (
          <div
            key={i}
            className={`flex-1 ${barColor} rounded-t opacity-70`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-gray-400">0s</span>
        <span className="text-[10px] text-gray-400">t</span>
      </div>
    </div>
  );
}
