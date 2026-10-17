import { expect, test } from "@playwright/test";

test("NP-0039/AC-03/TEST-04 rejects an oversized disabled mutation before parsing", async ({ request }) => {
  const response = await request.post("/api/procedures", {
    data: "x".repeat(1_100_000),
    headers: { "content-type": "application/octet-stream" },
  });

  expect(response.status()).toBe(405);
  expect(response.headers().allow).toBe("GET");
});
