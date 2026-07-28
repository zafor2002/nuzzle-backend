"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { toggleReelLike } from "@/app/actions/reels";

export type ReelItem = {
  id: string;
  videoUrl: string;
  caption: string | null;
  likeCount: number;
  liked: boolean;
  authorLabel: string;
  authorHref: string | null;
  avatarUrl: string | null;
};

export function ReelFeed({ items, signedIn }: { items: ReelItem[]; signedIn: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-10 snap-y snap-mandatory overflow-y-auto overscroll-contain bg-black">
      {items.map((item) => (
        <Reel key={item.id} item={item} signedIn={signedIn} />
      ))}
    </div>
  );
}

function Reel({ item, signedIn }: { item: ReelItem; signedIn: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(item.liked);
  const [count, setCount] = useState(item.likeCount);
  const [, startTransition] = useTransition();

  // Play only the reel currently on screen; pause the rest so several videos
  // are never decoding (and downloading) at once.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function onLike() {
    if (!signedIn) return;
    // Optimistic: the server action reconciles on refresh.
    setLiked((v) => !v);
    setCount((c) => c + (liked ? -1 : 1));
    startTransition(() => void toggleReelLike(item.id));
  }

  return (
    <section className="relative h-dvh w-full snap-start snap-always">
      <video
        ref={ref}
        src={item.videoUrl}
        className="h-full w-full object-contain"
        loop
        muted
        playsInline
        preload="metadata"
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.45)_0%,transparent_25%,transparent_55%,rgba(0,0,0,.65)_100%)]" />

      <Link
        href="/feed"
        aria-label="Back to feed"
        className="absolute left-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl text-white"
      >
        <Icon name="back" className="h-5 w-5" />
      </Link>

      <div className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-5 text-white">
        <button
          type="button"
          onClick={onLike}
          aria-label={liked ? "Unlike reel" : "Like reel"}
          aria-pressed={liked}
          className="flex flex-col items-center gap-1"
        >
          <Icon name="heart" className={`h-8 w-8 ${liked ? "text-danger" : ""}`} filled={liked} />
          <span className="text-[11px] font-semibold">{count}</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 px-4 text-white">
        <div className="mb-2 flex items-center gap-2.5">
          <Avatar name={item.authorLabel} src={item.avatarUrl} size="sm" />
          {item.authorHref ? (
            <Link href={item.authorHref} className="text-sm font-bold">
              {item.authorLabel}
            </Link>
          ) : (
            <span className="text-sm font-bold">{item.authorLabel}</span>
          )}
        </div>
        {item.caption && <p className="text-[13px] leading-relaxed">{item.caption}</p>}
      </div>
    </section>
  );
}
