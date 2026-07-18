const PALETTE = [
  "bg-rose-200 text-rose-800",
  "bg-amber-200 text-amber-800",
  "bg-lime-200 text-lime-800",
  "bg-teal-200 text-teal-800",
  "bg-sky-200 text-sky-800",
  "bg-violet-200 text-violet-800",
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ${colorFor(name)} ${SIZE_CLASSES[size]}`}
    >
      {initial}
    </span>
  );
}
