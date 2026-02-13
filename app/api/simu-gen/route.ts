import { NextRequest, NextResponse } from "next/server";

const ANALYZE_PROMPT = `Bạn là chuyên gia vật lý giáo dục. Phân tích yêu cầu mô phỏng của giáo viên và lập kế hoạch.

Trả về JSON:
{
  "plan": "Mô tả chi tiết kế hoạch mô phỏng: hiện tượng vật lý, công thức, tham số, UI controls",
  "questions": ["câu hỏi 1", "câu hỏi 2"] hoặc null nếu yêu cầu đã đủ rõ
}

Chỉ hỏi khi thực sự thiếu thông tin quan trọng (vd: thiếu thông số, mơ hồ về loại chuyển động). Nếu prompt đã rõ ràng, questions = null.`;

const GENERATE_PROMPT = `Bạn là chuyên gia vật lý và lập trình mô phỏng đồ họa cao cấp. Dựa trên kế hoạch đã được giáo viên xác nhận, tạo code HTML5/JS mô phỏng vật lý tương tác với đồ họa đẹp, hiện đại.

## Thư viện CDN bắt buộc
- LUÔN load GSAP: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
- Nếu mô phỏng cần va chạm hoặc nhiều vật thể tương tác: load thêm Matter.js <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>

## Layout & Responsive
- Dùng flexbox: controls panel bên trái (width: 280px, shrink-0), canvas bên phải (flex-grow)
- Toàn bộ trang height: 100vh, không scroll
- Canvas tự co giãn theo container bằng ResizeObserver
- Font-family: 'Segoe UI', system-ui, sans-serif

## UI Controls (KHÔNG dùng default browser styles)
- Buttons: background gradient (ví dụ #4F46E5 → #6366F1), border-radius: 12px, padding: 10px 20px, color white, font-weight 600, box-shadow, hover brightness(1.1), transition 0.2s, cursor pointer
- Range sliders: custom CSS — track height 6px, border-radius, background #E5E7EB, thumb 20px circle với shadow, accent color
- Labels: font-size 13px, color #6B7280, font-weight 500
- Controls panel: background #F9FAFB, border-right 1px solid #E5E7EB, padding 24px, gap 16px giữa các nhóm
- Nhóm control: background white, border-radius 12px, padding 16px, box-shadow 0 1px 3px rgba(0,0,0,0.1)

## Canvas Rendering (vẽ đẹp)
- Nền: grid nhẹ (đường kẻ #F3F4F6 cách nhau 50px) trên nền trắng hoặc gradient rất nhẹ
- Vật thể: dùng gradient fill (createRadialGradient hoặc createLinearGradient), có shadow (shadowColor, shadowBlur 10-15px)
- Trail effects: vẽ lịch sử vị trí dưới dạng các chấm/đường mờ dần (globalAlpha giảm dần)
- Labels trên canvas: font 13px, nền bán trong suốt rounded rect, text đậm cho giá trị
- Vectors (lực, vận tốc): mũi tên đẹp với đầu tam giác, màu khác nhau, có legend
- Anti-aliasing: context.imageSmoothingEnabled = true

## Panel thông số realtime
- Hiển thị trong controls panel hoặc overlay trên canvas
- Font monospace (font-family: 'Courier New', monospace)
- Giá trị số: màu accent (#4F46E5), font-weight bold
- Cập nhật mỗi frame, format số với toFixed(2)

## Animation
- Physics loop: requestAnimationFrame với delta time chính xác (performance.now())
- GSAP cho UI transitions: gsap.from() khi controls panel xuất hiện, gsap.to() cho highlight effects
- Chuyển động mượt, dt capped ở 1/30s để tránh jump khi tab inactive

## Yêu cầu vật lý
- Đơn vị SI, tính toán vật lý chính xác với công thức chuẩn
- Scale pixel/meter rõ ràng, hiển thị thước đo trên canvas
- UI điều khiển dùng tiếng Việt

## Code structure
- Code phải tự khởi chạy khi load (window.onload hoặc DOMContentLoaded)
- Tất cả trong 1 file HTML duy nhất, inline CSS và JS
- Play/Pause/Reset buttons luôn có
- Code sạch, có comment giải thích physics

Trả về JSON: { "html": "<!DOCTYPE html>..." }`;

const REVIEW_PROMPT = `Bạn là reviewer chuyên kiểm tra mô phỏng vật lý với tiêu chuẩn cao về cả độ chính xác và chất lượng đồ họa. Kiểm tra code HTML sau:

## Kiểm tra vật lý
1. Công thức vật lý có đúng không?
2. Đơn vị có nhất quán không?
3. Animation có mượt không? (requestAnimationFrame, delta time handling, dt capped)

## Kiểm tra đồ họa & UI
4. GSAP có được load từ CDN không? Nếu thiếu, thêm: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
5. UI controls có được custom style không? (KHÔNG chấp nhận default browser buttons/sliders — phải có border-radius, gradient, shadow, hover effects)
6. Canvas có hiệu ứng visual đủ không? (grid background, gradient fills cho vật thể, shadow, trail effects)
7. Layout có dùng flexbox với controls panel tách biệt không?
8. Panel thông số realtime có font monospace và màu accent không?

## Kiểm tra kỹ thuật
9. Controls có hoạt động đúng không?
10. Có lỗi JS nào không?
11. Code có responsive không? (ResizeObserver hoặc window resize)

Nếu có lỗi hoặc thiếu yếu tố đồ họa, SỬA và trả về code đã sửa. Nếu không có lỗi, trả về code gốc.

Trả về JSON:
{
  "html": "<!DOCTYPE html>...",
  "fixes": "Mô tả các lỗi đã sửa" hoặc null nếu không có lỗi
}`;

type Step = "analyze" | "generate" | "review";

async function callOpenAI(apiKey: string, systemPrompt: string, userContent: string, maxTokens = 4096) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[SimuGen API] OpenAI lỗi:", response.status, err);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Không nhận được phản hồi từ AI");
  return JSON.parse(content);
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY chưa được cấu hình" }, { status: 500 });
  }

  const body = await req.json();
  const step: Step = body.step || "analyze";
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt không hợp lệ" }, { status: 400 });
  }

  try {
    if (step === "analyze") {
      console.log("[SimuGen API] Step: analyze");
      const result = await callOpenAI(apiKey, ANALYZE_PROMPT, prompt);
      return NextResponse.json({ plan: result.plan || "", questions: result.questions || null });
    }

    if (step === "generate") {
      const { plan, answers } = body;
      console.log("[SimuGen API] Step: generate");
      const userContent = `Yêu cầu gốc: ${prompt}\n\nKế hoạch đã xác nhận:\n${plan}${answers ? `\n\nThông tin bổ sung từ giáo viên:\n${answers}` : ""}`;
      const result = await callOpenAI(apiKey, GENERATE_PROMPT, userContent, 16384);
      return NextResponse.json({ html: result.html || "" });
    }

    if (step === "review") {
      const { html } = body;
      console.log("[SimuGen API] Step: review");
      const userContent = `Yêu cầu gốc: ${prompt}\n\nCode HTML cần review:\n${html}`;
      const result = await callOpenAI(apiKey, REVIEW_PROMPT, userContent, 8192);
      return NextResponse.json({ html: result.html || "", fixes: result.fixes || null });
    }

    return NextResponse.json({ error: "Step không hợp lệ" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[SimuGen API] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
