import { ReactNode } from "react";

/**
 * On phones this is a plain pass-through wrapper. From `lg` up it draws a device
 * frame around the app so the mobile-only design reads as deliberate instead of
 * looking like a stretched page.
 *
 * `lg:[transform:translateZ(0)]` is doing real work, not decoration: a transform
 * makes the element a containing block for `position: fixed` descendants, so the
 * bottom nav (and the Reels overlay) anchor to the frame rather than the browser
 * window. Without it the nav would sit at the bottom of the screen while the
 * frame floated in the middle.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="lg:flex lg:min-h-screen lg:items-center lg:justify-center lg:bg-[#E8E2DC] lg:py-8">
      <div
        className="
          relative flex min-h-screen w-full flex-col bg-background
          lg:h-[880px] lg:max-h-[92vh] lg:min-h-0 lg:w-[420px] lg:overflow-y-auto
          lg:rounded-[44px] lg:shadow-[0_30px_60px_rgba(70,50,40,.28),0_0_0_10px_#2B2420,0_0_0_12px_#4A403A]
          lg:[transform:translateZ(0)]
          lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden
        "
      >
        {children}
      </div>
    </div>
  );
}
