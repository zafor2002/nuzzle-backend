export function Card({
  className = "",
  padded = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  // Padding is a prop rather than a className default: Tailwind orders padding
  // utilities by value, so a `p-0`/`p-2` passed via className would lose to `p-4`.
  return (
    <div
      className={`rounded-md border border-border bg-card ${padded ? "p-4" : ""} ${className}`}
      {...props}
    />
  );
}
