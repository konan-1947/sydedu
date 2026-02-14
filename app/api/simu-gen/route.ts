import { NextRequest, NextResponse } from "next/server";
import { callAI } from "../../lib/ai-client";
import type { AIModel } from "../../components/ModelContext";

const ANALYZE_PROMPT = `Bạn là chuyên gia vật lý giáo dục. Phân tích yêu cầu mô phỏng của giáo viên và lập kế hoạch.

Nếu giáo viên gửi kèm ảnh tham khảo, hãy phân tích kỹ ảnh để hiểu: cấu trúc thiết bị/hiện tượng, bố cục, các thành phần vật lý, thông số có thể đọc được từ ảnh. Sử dụng thông tin từ ảnh để lập kế hoạch chính xác hơn.

Trả về JSON:
{
  "plan": "Mô tả chi tiết kế hoạch mô phỏng: hiện tượng vật lý, công thức, tham số, UI controls",
  "questions": ["câu hỏi 1", "câu hỏi 2"] hoặc null nếu yêu cầu đã đủ rõ
}

Chỉ hỏi khi thực sự thiếu thông tin quan trọng (vd: thiếu thông số, mơ hồ về loại chuyển động). Nếu prompt đã rõ ràng, questions = null.`;

const GENERATE_PROMPT = `Bạn là chuyên gia vật lý và lập trình mô phỏng đồ họa cao cấp. Dựa trên kế hoạch đã được giáo viên xác nhận, tạo code HTML5/JS mô phỏng vật lý tương tác với đồ họa đẹp, hiện đại, CHÍNH XÁC về mặt vật lý.

Nếu có ảnh tham khảo từ giáo viên, hãy tái hiện cấu trúc, bố cục, và các thành phần trong ảnh một cách trung thực nhất có thể trong mô phỏng.

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

## QUAN TRỌNG: KHÔNG dùng thư viện bên ngoài
- KHÔNG được load bất kỳ CDN nào (GSAP, Matter.js, Three.js, etc.)
- Code phải 100% tự viết, KHÔNG có thẻ <script src="..."> external
- Dùng requestAnimationFrame cho animation
- Tự viết physics engine đơn giản nếu cần va chạm
- Lý do: code chạy trong sandbox iframe không có quyền fetch external resources

## Layout & Responsive (CỰC KỲ QUAN TRỌNG)
- html, body: margin 0, padding 0, width 100%, height 100vh, overflow hidden
- Dùng flexbox row: controls panel bên trái (width: 280px, shrink-0), canvas container bên phải (flex: 1, min-width: 0)
- Canvas element phải có width và height BẰNG ĐÚNG kích thước container (dùng ResizeObserver để cập nhật canvas.width và canvas.height khi resize)
- KHÔNG để khoảng trống thừa — canvas phải fill 100% vùng còn lại sau controls panel
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
- Tự viết transitions bằng CSS transition hoặc vanilla JS animation
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
- QUAN TRỌNG: Giữ tổng code HTML dưới 12000 ký tự để tránh bị cắt. Ưu tiên code gọn, hiệu quả. Dùng vòng lặp thay vì lặp code. Dùng tên biến ngắn trong draw functions. KHÔNG thêm comment dài dòng.

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
7. Code có dùng thư viện CDN bên ngoài không? Nếu có, phải XÓA và viết lại bằng vanilla JS (vì iframe sandbox không fetch được external scripts)
8. UI controls có được custom style không? (KHÔNG chấp nhận default browser buttons/sliders)
9. Canvas có hiệu ứng visual đủ không? (grid background, gradient fills, shadow, trail effects)
10. Layout có dùng flexbox với controls panel tách biệt không? Canvas có FILL ĐẦY 100% vùng còn lại không? (html/body phải margin:0, height:100vh, canvas phải resize theo container bằng ResizeObserver). Nếu canvas không fill đầy, phải SỬA.

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

// Attempt to extract HTML from truncated JSON like {"html": "<!DOCTYPE...
function extractHtmlFromTruncated(raw: string): string | null {
  const match = raw.match(/"html"\s*:\s*"([\s\S]+)/);
  if (!match) return null;
  // Remove the trailing incomplete part - unescape what we have
  let html = match[1];
  // Remove trailing incomplete JSON (last `"` or `"}` may be missing)
  html = html.replace(/"\s*,?\s*"fixes"[\s\S]*$/, "");
  html = html.replace(/"\s*}\s*$/, "");
  // If it still ends abruptly, just use what we have
  // Unescape JSON string escapes
  try {
    html = JSON.parse(`"${html}"`);
  } catch {
    html = html.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return html || null;
}

function safeParseAIResponse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    // Try to salvage truncated HTML response
    const html = extractHtmlFromTruncated(raw);
    if (html) return { html };
    throw new Error("AI trả về JSON không hợp lệ (có thể bị cắt do giới hạn token)");
  }
}

type Step = "analyze" | "generate" | "review";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const step: Step = body.step || "analyze";
  const { prompt, model: reqModel, image } = body;
  const model: AIModel = reqModel || "gpt-4o";
  const imageBase64: string | null = typeof image === "string" ? image : null;

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json({ error: "Prompt không hợp lệ" }, { status: 400 });
  }

  try {
    if (step === "analyze") {
      console.log("[SimuGen API] Step: analyze, model:", model);
      const raw = await callAI(model, ANALYZE_PROMPT, prompt, 4096, true, imageBase64);
      const result = JSON.parse(raw);
      return NextResponse.json({ plan: result.plan || "", questions: result.questions || null });
    }

    if (step === "generate") {
      const { plan, answers } = body;
      console.log("[SimuGen API] Step: generate, model:", model, "hasImage:", !!imageBase64, "imageSize:", imageBase64 ? Math.round(imageBase64.length / 1024) + "KB" : "N/A");
      const userContent = `Yêu cầu gốc: ${prompt}\n\nKế hoạch đã xác nhận:\n${plan}${answers ? `\n\nThông tin bổ sung từ giáo viên:\n${answers}` : ""}`;
      const raw = await callAI(model, GENERATE_PROMPT, userContent, 16384, true, imageBase64);
      const result = safeParseAIResponse(raw);
      return NextResponse.json({ html: result.html || "" });
    }

    if (step === "review") {
      const { html } = body;
      console.log("[SimuGen API] Step: review, model:", model);
      const userContent = `Yêu cầu gốc: ${prompt}\n\nCode HTML cần review:\n${html}`;
      const raw = await callAI(model, REVIEW_PROMPT, userContent, 16384);
      const result = safeParseAIResponse(raw);
      return NextResponse.json({ html: result.html || "", fixes: result.fixes || null });
    }

    return NextResponse.json({ error: "Step không hợp lệ" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[SimuGen API] Exception:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
