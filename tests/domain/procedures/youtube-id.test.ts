import { describe, expect, it } from "vitest";
import { parseYoutubeId } from "@/backend/domain/procedures/parse-youtube-id";

describe("NP-0038/AC-02/TEST-02 YouTube IDs", () => {
  it("accepts the characterized ID and URL variants", () => {
    const valid = [
      "dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://youtu.be/dQw4w9WgXcQ", "https://youtube.com/embed/dQw4w9WgXcQ",
      "https://youtube.com/shorts/dQw4w9WgXcQ", "https://youtube.com/live/dQw4w9WgXcQ",
    ];
    expect(valid.map(parseYoutubeId)).toEqual(valid.map(() => "dQw4w9WgXcQ"));
  });

  it("rejects arbitrary hosts, schemes and malformed IDs", () => {
    expect(parseYoutubeId("https://vimeo.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parseYoutubeId("javascript:alert(1)")).toBeNull();
    expect(parseYoutubeId("dQw4w9Wg!Q")).toBeNull();
    expect(parseYoutubeId(null)).toBeNull();
  });
});
