import { describe, expect, it } from "vitest";
import { extractHashtags, tokenizeCaption } from "@/lib/hashtags";

describe("extractHashtags", () => {
  it("pulls tags out of a caption", () => {
    expect(extractHashtags("Beach day with #momo and #biscuit")).toEqual(["momo", "biscuit"]);
  });

  it("lower-cases so #Corgi and #corgi are one tag", () => {
    expect(extractHashtags("#Corgi #corgi #CORGI")).toEqual(["corgi"]);
  });

  it("ignores purely numeric tags so dates don't become tags", () => {
    expect(extractHashtags("Best of #2026 and #1")).toEqual([]);
  });

  it("handles no caption", () => {
    expect(extractHashtags(null)).toEqual([]);
    expect(extractHashtags(undefined)).toEqual([]);
    expect(extractHashtags("")).toEqual([]);
  });

  it("supports non-Latin tags", () => {
    expect(extractHashtags("#кот #犬")).toEqual(["кот", "犬"]);
  });

  it("does not treat a bare # or mid-word # as a tag", () => {
    expect(extractHashtags("# alone and a#b")).toEqual(["b"]);
  });

  it("caps the number of tags per post", () => {
    const caption = Array.from({ length: 50 }, (_, i) => `#tag${i}`).join(" ");
    expect(extractHashtags(caption)).toHaveLength(30);
  });
});

describe("tokenizeCaption", () => {
  it("splits text and hashtags in order", () => {
    expect(tokenizeCaption("hi #momo bye")).toEqual([
      { type: "text", value: "hi " },
      { type: "hashtag", value: "#momo", tag: "momo" },
      { type: "text", value: " bye" },
    ]);
  });

  it("round-trips the original caption exactly", () => {
    const caption = "Sun #naps are the #best thing. 100% #agreed";
    const rebuilt = tokenizeCaption(caption)
      .map((t) => t.value)
      .join("");
    expect(rebuilt).toBe(caption);
  });

  it("leaves a caption with no tags as a single text token", () => {
    expect(tokenizeCaption("no tags here")).toEqual([{ type: "text", value: "no tags here" }]);
  });
});
