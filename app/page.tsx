import PageShell from "./components/PageShell";
import Link from "next/link";
import {
  ArrowRight,
  Presentation,
  Brain,
  Activity,
  Sparkles,
  Clock,
  FileText,
  ClipboardList,
  Video,
} from "lucide-react";

const tools = [
  {
    title: "Smart Slide Builder",
    desc: "Tải lên giáo án và tự động tạo slide bài giảng chuyên nghiệp theo cấu trúc chuẩn.",
    icon: Presentation,
    gradient: "from-blue-500 to-indigo-500",
    href: "/slide-builder",
  },
  {
    title: "AI Generator",
    desc: "Soạn giáo án và tạo đề thi tự động bằng AI, tiết kiệm thời gian chuẩn bị.",
    icon: Brain,
    gradient: "from-purple-500 to-pink-500",
    href: "/ai-generator",
  },
  {
    title: "Physics Mapper",
    desc: "Phân tích video thực tế, trích xuất chuyển động và hiển thị đồ thị vật lý.",
    icon: Activity,
    gradient: "from-emerald-500 to-teal-500",
    href: "/physics-mapper",
  },
  {
    title: "SimuGen AI",
    desc: "Chuyển mô tả tiếng Việt thành mô phỏng vật lý tương tác chạy trực tiếp trên trình duyệt.",
    icon: Sparkles,
    gradient: "from-orange-500 to-amber-500",
    href: "/simu-gen",
  },
];

const recentActivities = [
  { title: "Đã tạo slide bài Quang học lớp 11", time: "2 giờ trước" },
  { title: "Đã soạn đề thi giữa kỳ Vật lý 10", time: "Hôm qua" },
  { title: "Đã phân tích video chuyển động ném xiên", time: "3 ngày trước" },
];

export default function Home() {
  return (
    <PageShell>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {/* Mini Dashboard */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Slide đã tạo", value: "12", icon: Presentation, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Giáo án", value: "8", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Đề thi", value: "5", icon: ClipboardList, color: "text-pink-600", bg: "bg-pink-50" },
                { label: "Video phân tích", value: "3", icon: Video, color: "text-emerald-600", bg: "bg-emerald-50" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4"
                >
                  <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 3 Tool Cards */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Công cụ chính
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4`}
                    >
                      <tool.icon size={26} className="text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                      {tool.title}
                      <ArrowRight
                        size={16}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500"
                      />
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {tool.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Hoạt động gần đây
              </h2>
              <div className="space-y-3">
                {recentActivities.map((a, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl px-5 py-4 border border-gray-100 flex items-center gap-4"
                  >
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
    </PageShell>
  );
}
