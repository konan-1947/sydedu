import { NextRequest, NextResponse } from "next/server";

const ANALYZE_PROMPT = `Bạn là chuyên gia vật lý giáo dục. Phân tích yêu cầu mô phỏng của giáo viên và lập kế hoạch.

Trả về JSON:
{
  "plan": "Mô tả chi tiết kế hoạch mô phỏng: hiện tượng vật lý, công thức, tham số, UI controls",
  "questions": ["câu hỏi 1", "câu hỏi 2"] hoặc null nếu yêu cầu đã đủ rõ
}

Chỉ hỏi khi thực sự thiếu thông tin quan trọng (vd: thiếu thông số, mơ hồ về loại chuyển động). Nếu prompt đã rõ ràng, questions = null.`;

const GENERATE_PROMPT = `Bạn là chuyên gia vật lý và lập trình mô phỏng đồ họa cao cấp. Dựa trên kế hoạch đã được giáo viên xác nhận, tạo code HTML5/JS mô phỏng vật lý tương tác với đồ họa đẹp, hiện đại, CHÍNH XÁC về mặt vật lý.

## NGUYÊN TẮC QUAN TRỌNG NHẤT
- Mô phỏng phải TRỰC QUAN, thể hiện rõ CẤU TRÚC VẬT LÝ thực tế của hiện tượng
- KHÔNG BAO GIỜ chỉ vẽ hình học đơn giản (ô vuông, tròn) để đại diện cho thiết bị phức tạp
- Phải vẽ đầy đủ các bộ phận cấu thành: ví dụ động cơ phải có stator, rotor, cuộn dây, từ trường; mạch điện phải có dây dẫn, điện trở, tụ điện, cuộn cảm với ký hiệu chuẩn
- Dùng Canvas 2D API để vẽ chi tiết: arc, bezierCurveTo, lineTo... tạo hình dạng thực tế
- Dùng màu sắc có ý nghĩa vật lý: đỏ/xanh cho cực từ N/S, vàng cho dòng điện, xanh cho từ trường

## Hướng dẫn vẽ chi tiết trên Canvas
- Cuộn dây: vẽ nhiều vòng arc chồng lên nhau, có 3D effect bằng gradient
- Từ trường: vẽ đường sức bằng bezier curves với mũi tên, màu gradient xanh→tím
- Dòng điện: vẽ particles chạy dọc dây dẫn (animated dots), hoặc mũi tên di chuyển
- Rotor/Stator: vẽ hình tròn lồng nhau, rãnh, cuộn dây, trục quay
- Vector lực/vận tốc: mũi tên có đầu tam giác, label rõ ràng, độ dài tỉ lệ giá trị
- Đồ thị realtime: vẽ trục tọa độ, grid, đường cong liên tục cập nhật (giữ history array)

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
- Scale pixel/meter rõ ràng, hiển thị thước đo trên canvas nếu phù hợp
- UI điều khiển dùng tiếng Việt

## Code structure
- Code phải tự khởi chạy khi load (window.onload hoặc DOMContentLoaded)
- Tất cả trong 1 file HTML duy nhất, inline CSS và JS
- Play/Pause/Reset buttons luôn có
- Code sạch, có comment giải thích physics
- Code phải DÀI VÀ CHI TIẾT — đừng lười, vẽ đầy đủ mọi thành phần

Trả về JSON: { "html": "<!DOCTYPE html>..." }`;

const REVIEW_PROMPT = `Bạn là reviewer chuyên kiểm tra mô phỏng vật lý với tiêu chuẩn cao về cả độ chính xác và chất lượng đồ họa. Kiểm tra code HTML sau:

## Kiểm tra TRỰC QUAN (QUAN TRỌNG NHẤT)
1. Hình vẽ có thể hiện ĐÚNG cấu trúc vật lý thực tế không? Ví dụ: động cơ phải có stator, rotor, cuộn dây; con lắc phải có dây treo, quả cầu, điểm treo
2. KHÔNG CHẤP NHẬN hình đơn giản (chỉ 1 hình vuông, 1 hình tròn) đại diện cho thiết bị phức tạp — nếu thấy, phải VIẾT LẠI phần vẽ canvas cho chi tiết
3. Có đủ các thành phần trực quan: cuộn dây, từ trường, dòng điện particles, vector lực...

## Kiểm tra vật lý
4. Công thức vật lý có đúng không?
5. Đơn vị có nhất quán không?
6. Animation có mượt không? (requestAnimationFrame, delta time handling, dt capped)

## Kiểm tra đồ họa & UI
7. GSAP có được load từ CDN không? Nếu thiếu, thêm: <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
8. UI controls có được custom style không? (KHÔNG chấp nhận default browser buttons/sliders)
9. Canvas có hiệu ứng visual đủ không? (grid background, gradient fills, shadow, trail effects)
10. Layout có dùng flexbox với controls panel tách biệt không?

## Kiểm tra kỹ thuật
11. Controls có hoạt động đúng không?
12. Có lỗi JS nào không?
13. Code có responsive không? (ResizeObserver hoặc window resize)

Nếu có lỗi hoặc thiếu chi tiết đồ họa, SỬA TOÀN BỘ và trả về code đã sửa. Đặc biệt nếu hình vẽ quá đơn giản, phải viết lại phần draw cho chi tiết.

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
      const result = await callOpenAI(apiKey, REVIEW_PROMPT, userContent, 16384);
      return NextResponse.json({ html: result.html || "", fixes: result.fixes || null });
    }

    return NextResponse.json({ error: "Step không hợp lệ" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[SimuGen API] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
