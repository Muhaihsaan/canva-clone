import { describe, test, expect } from "bun:test";
import app from "@/app/api/[[...route]]/ai";

function decodeBase64DataUrl(dataUrl: string): string {
  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64").toString("utf-8");
}

describe("AI API Endpoints", () => {
  describe("POST /generate-image", () => {
    test("returns mock image with custom dimensions", async () => {
      const res = await app.request("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "cat in space",
          width: 256,
          height: 256,
        }),
      });

      const data = await res.json();
      const svg = decodeBase64DataUrl(data.image_url);

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.image_url).toContain("data:image/svg+xml;base64,");
      expect(svg).toContain("256x256");
      expect(svg).toContain("GENERATED: cat in space");
      expect(data.finish_reason).toBe("SUCCESS");
      expect(data.seed).toBe(12345);
    });

    test("returns mock image with default parameters", async () => {
      const res = await app.request("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "test image",
        }),
      });

      const data = await res.json();
      const svg = decodeBase64DataUrl(data.image_url);

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(svg).toContain("512x512");
    });

    test("validates output format", async () => {
      const res = await app.request("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "test image",
          output_format: "invalid",
        }),
      });

      expect(res.status).toBe(400);
    });

    test("returns error for invalid input", async () => {
      const res = await app.request("/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Missing required prompt
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /inpaint", () => {
    test("performs mock inpainting", async () => {
      const res = await app.request("/inpaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Add clouds",
          image: "base64_mock_image_data",
        }),
      });

      const data = await res.json();
      const svg = decodeBase64DataUrl(data.image_url);

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(svg).toContain("INPAINT: Add clouds");
      expect(data.finish_reason).toBe("SUCCESS");
      expect(data.seed).toBe(54321);
    });

    test("requires valid prompt for inpainting", async () => {
      const res = await app.request("/inpaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: "base64_mock_image_data",
          // Missing prompt
        }),
      });

      expect(res.status).toBe(400);
    });
  });
});
