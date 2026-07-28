"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { StoryViewer } from "@/components/story-viewer";
import type { StoryGroup } from "@/lib/stories";

export function StoryTray({ groups }: { groups: StoryGroup[] }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const hasOwn = groups.some((g) => g.isSelf);

  return (
    <>
      <div className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!hasOwn && (
          <Link href="/stories/new" className="w-[68px] shrink-0 text-center">
            <span className="relative flex h-[66px] w-[66px] items-center justify-center rounded-full border-2 border-dashed border-border">
              <Avatar name="You" size="lg" />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2.5px] border-background bg-primary text-primary-foreground">
                <Icon name="plus" className="h-3 w-3" />
              </span>
            </span>
            <span className="mt-1.5 block truncate text-[11.5px] text-muted">Add story</span>
          </Link>
        )}

        {groups.map((group, i) => (
          <button
            key={group.ownerId}
            type="button"
            onClick={() => setOpenAt(i)}
            className="w-[68px] shrink-0 text-center"
          >
            <span
              className={`flex h-[66px] w-[66px] items-center justify-center rounded-full p-[3px] transition-transform active:scale-95 ${
                group.allSeen
                  ? "bg-border"
                  : "bg-[conic-gradient(from_200deg,#F4915C,#F2718B,#C6A8E8,#4FBAD4,#F4915C)]"
              }`}
            >
              <span className="flex h-full w-full items-center justify-center rounded-full border-[2.5px] border-background bg-background">
                <Avatar name={group.label} src={group.avatarUrl} size="lg" />
              </span>
            </span>
            <span className="mt-1.5 block truncate text-[11.5px] text-muted">{group.label}</span>
          </button>
        ))}
      </div>

      {openAt !== null && (
        <StoryViewer
          groups={groups}
          startGroup={openAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
