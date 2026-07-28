"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { markStorySeen } from "@/app/actions/stories";
import type { StoryGroup } from "@/lib/stories";

const SEGMENT_MS = 5000;

export function StoryViewer({
  groups,
  startGroup,
  onClose,
}: {
  groups: StoryGroup[];
  startGroup: number;
  onClose: () => void;
}) {
  const [gi, setGi] = useState(startGroup);
  const [si, setSi] = useState(0);
  const seen = useRef(new Set<string>());

  const group = groups[gi];
  const story = group?.stories[si];

  // Close once we run past the final story of the final group.
  useEffect(() => {
    if (!group) onClose();
  }, [group, onClose]);

  const prev = useCallback(() => {
    if (si > 0) {
      setSi(si - 1);
    } else if (gi > 0) {
      setGi(gi - 1);
      setSi(groups[gi - 1].stories.length - 1);
    }
  }, [gi, si, groups]);

  const advance = useCallback(() => {
    const current = groups[gi];
    if (si + 1 < current.stories.length) {
      setSi(si + 1);
    } else if (gi + 1 < groups.length) {
      setGi(gi + 1);
      setSi(0);
    } else {
      onClose();
    }
  }, [gi, si, groups, onClose]);

  // Mark seen once per story, without blocking playback.
  useEffect(() => {
    if (!story || seen.current.has(story.id)) return;
    seen.current.add(story.id);
    void markStorySeen(story.id);
  }, [story]);

  useEffect(() => {
    const t = setTimeout(advance, SEGMENT_MS);
    return () => clearTimeout(t);
  }, [advance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") advance();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, prev, onClose]);

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#17131A]" role="dialog" aria-label="Stories">
      <Image
        src={story.mediaUrl}
        alt=""
        fill
        unoptimized
        className="object-contain"
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.55)_0%,transparent_22%,transparent_62%,rgba(0,0,0,.6)_100%)]" />

      <div className="relative z-10 flex gap-1 px-3 pt-3">
        {group.stories.map((s, i) => (
          <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded bg-white/30">
            <span
              className={`block h-full rounded bg-white ${i < si ? "w-full" : i === si ? "animate-[storyfill_5s_linear_forwards]" : "w-0"}`}
            />
          </span>
        ))}
      </div>

      {/* z-20: must sit above the tap zones, or the close button is unclickable. */}
      <div className="relative z-20 flex items-center gap-2.5 px-3.5 py-3 text-white">
        <Avatar name={story.authorLabel} src={story.avatarUrl} size="sm" />
        <span className="min-w-0 flex-1 truncate text-sm font-bold">{story.authorLabel}</span>
        <span className="shrink-0 text-[11.5px] opacity-80">
          {timeAgo(new Date(story.createdAt))}
        </span>
        <button type="button" onClick={onClose} aria-label="Close stories" className="shrink-0 p-1">
          <Icon name="x" className="h-5 w-5" />
        </button>
      </div>

      {/* Tap zones: left third goes back, the rest advances. They start below
          the header so they never swallow taps on the close button. */}
      <button
        type="button"
        aria-label="Previous story"
        onClick={prev}
        className="absolute bottom-0 left-0 top-20 z-10 w-1/3"
      />
      <button
        type="button"
        aria-label="Next story"
        onClick={advance}
        className="absolute bottom-0 right-0 top-20 z-10 w-2/3"
      />

      {story.caption && (
        <p className="relative z-10 mt-auto px-5 pb-10 text-center text-sm leading-relaxed text-white">
          {story.caption}
        </p>
      )}

      <style>{`@keyframes storyfill { from { width: 0 } to { width: 100% } }`}</style>
    </div>
  );
}

function timeAgo(d: Date) {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h`;
}
