import PptxGenJS from "pptxgenjs";
import { SlidePresentation } from "./types";
import katex from "katex";

const TYPE_COLORS: Record<string, string> = {
  intro: "1e3a5f",
  concept: "ffffff",
  formula: "f8fafc",
  quiz: "fffbeb",
  simulation: "eef2ff",
};

function renderFormulaToImage(latex: string): Promise<string> {
  return new Promise((resolve) => {
    const html = katex.renderToString(latex, { throwOnError: false, displayMode: true });

    const container = document.createElement("div");
    container.innerHTML = html;
    container.style.cssText = "position:absolute;left:-9999px;top:-9999px;font-size:32px;padding:16px;background:white;";
    document.body.appendChild(container);

    // Wait for fonts to render
    requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const rect = container.getBoundingClientRect();
      const dpr = 2;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Use html2canvas-like approach via SVG foreignObject
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-size:32px;padding:16px;background:white;">${html}</div>
        </foreignObject>
      </svg>`;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        document.body.removeChild(container);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        document.body.removeChild(container);
        resolve(""); // fallback: skip image
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  });
}

export async function exportPptx(presentation: SlidePresentation) {
  const pptx = new PptxGenJS();
  pptx.title = presentation.title;
  pptx.subject = presentation.subject || "";
  pptx.layout = "LAYOUT_16x9";

  for (const slide of presentation.slides) {
    const pptSlide = pptx.addSlide();
    const bgColor = (slide.bgColor || TYPE_COLORS[slide.type] || "ffffff").replace("#", "");
    pptSlide.background = { color: bgColor };

    // Title
    pptSlide.addText(slide.title, {
      x: 0.6, y: 0.3, w: 8.5, h: 0.8,
      fontSize: 28, bold: true,
      color: slide.type === "intro" ? "ffffff" : "0f172a",
    });

    if (slide.subtitle) {
      pptSlide.addText(slide.subtitle, {
        x: 0.6, y: 1.0, w: 8.5, h: 0.5,
        fontSize: 18,
        color: slide.type === "intro" ? "cccccc" : "64748b",
      });
    }

    // Elements
    for (const el of slide.elements) {
      // Convert pixel coords to inches (96 DPI)
      const xInch = el.x / 96;
      const yInch = el.y / 96;
      const wInch = el.width / 96;
      const hInch = Math.max((el.height || 40) / 96, 0.4);

      if (el.type === "formula") {
        // Try rendering formula as image
        try {
          const dataUrl = await renderFormulaToImage(el.content);
          if (dataUrl) {
            pptSlide.addImage({ data: dataUrl, x: xInch, y: yInch, w: wInch, h: hInch });
            continue;
          }
        } catch {
          // fallback to text
        }
        pptSlide.addText(el.content, {
          x: xInch, y: yInch, w: wInch, h: hInch,
          fontSize: 18, italic: true,
          color: (el.fill || "2563eb").replace("#", ""),
        });
      } else if (el.type === "text") {
        pptSlide.addText(el.content, {
          x: xInch, y: yInch, w: wInch, h: hInch,
          fontSize: Math.round((el.fontSize || 24) * 0.75),
          color: (el.fill || "1e293b").replace("#", ""),
          align: el.align || "left",
        });
      }
    }

    if (slide.notes) {
      pptSlide.addNotes(slide.notes);
    }
  }

  await pptx.writeFile({ fileName: `${presentation.title || "slides"}.pptx` });
}
