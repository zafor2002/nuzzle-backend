import Link from "next/link";
import { tokenizeCaption } from "@/lib/hashtags";

/** Renders a caption with #hashtags turned into links. */
export function CaptionText({ caption }: { caption: string }) {
  return (
    <>
      {tokenizeCaption(caption).map((token, i) =>
        token.type === "hashtag" ? (
          <Link
            key={i}
            href={`/hashtags/${encodeURIComponent(token.tag)}`}
            className="font-semibold text-primary hover:underline"
          >
            {token.value}
          </Link>
        ) : (
          <span key={i}>{token.value}</span>
        )
      )}
    </>
  );
}
