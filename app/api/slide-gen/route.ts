import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../lib/ai-client";
import type { AIModel } from "../../components/ModelContext";

const SYSTEM_PROMPT = `Bạn là chuyên gia giáo dục Việt Nam. Tạo nội dung slide bài giảng dựa trên chủ đề/giáo án được cung cấp.

Trả về JSON theo schema sau:
{
  "title": "Tên bài giảng",
  "subject": "Môn học",
  "slides": [
    {
      "id": "unique-id",
      "type": "intro" | "concept" | "formula" | "quiz" | "simulation",
      "title": "Tiêu đề slide",
      "subtitle": "Phụ đề (optional)",
      "elements": [
        {
          "id": "unique-id",
          "type": "text" | "formula",
          "x": 80,
          "y": 150,
          "width": 800,
          "height": 60,
          "content": "Nội dung text hoặc LaTeX",
          "fontSize": 24,
          "fill": "#1e293b",
          "align": "left"
        }
      ],
      "bgColor": "#ffffff",
      "notes": "Ghi chú cho giáo viên"
    }
  ]
}

Quy tắc:
- Tạo 6-10 slides
- Slide đầu tiên luôn là type "intro"
- Dùng type "formula" cho slide có công thức toán/lý (content dùng LaTeX)
- Dùng type "quiz" cho câu hỏi trắc nghiệm (4 đáp án A/B/C/D trong elements)
- Mỗi slide có 2-5 elements
- Tọa độ x,y tính theo canvas 960x540
- fontSize: title 36-44, body 20-28, caption 16-18
- Màu text: title #0f172a, body #1e293b, accent #2563eb
- bgColor cho intro: "#1e3a5f", concept: "#ffffff", formula: "#f8fafc", quiz: "#fffbeb"`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { topic, content, model: reqModel } = body;
  const model: AIModel = reqModel || "gpt-4o";

  if (!topic && !content) {
    return NextResponse.json({ error: "Cần nhập chủ đề hoặc nội dung" }, { status: 400 });
  }

  const userMessage = content
    ? `Chủ đề: ${topic || "Không rõ"}\n\nNội dung giáo án:\n${content}`
    : `Chủ đề: ${topic}`;

  try {
    const raw = await callAI(model, SYSTEM_PROMPT, userMessage, 8192);
    const presentation = JSON.parse(raw);
    return NextResponse.json(presentation);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[SlideGen API] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
