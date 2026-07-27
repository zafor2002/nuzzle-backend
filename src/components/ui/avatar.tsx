// Pastel tone pairs [background, foreground] — mirrors the prototype's palette.
const TONES: [string, string][] = [
  ["#FDE3D2", "#B4693A"],
  ["#DCE8F7", "#3F6389"],
  ["#E6E0F5", "#61508F"],
  ["#DDF0E2", "#3B7A55"],
  ["#FBE0E8", "#9C4A63"],
  ["#F6EBD2", "#8A6A2E"],
];

function toneFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % TONES.length;
  }
  return TONES[hash];
}

/** Up to two letters: initials of the first two words, else the first two characters. */
function initialsFor(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-[76px] w-[76px] text-2xl",
};

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className={`inline-block shrink-0 rounded-full object-cover ${SIZE_CLASSES[size]} ${className}`}
      />
    );
  }

  const [bg, fg] = toneFor(name);
  return (
    <span
      style={{ backgroundColor: bg, color: fg }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZE_CLASSES[size]} ${className}`}
    >
      {initialsFor(name)}
    </span>
  );
}
