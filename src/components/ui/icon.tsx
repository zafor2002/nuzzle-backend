const PATHS: Record<string, string> = {
  home: "M4 11.5 12 4l8 7.5V20a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5H10v5a1 1 0 01-1 1H5a1 1 0 01-1-1z",
  compass: "M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5l-2.2 5.8-5.8 2.2 2.2-5.8z",
  bell: "M6 10a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 20a2 2 0 004 0",
  chat: "M4 5h16v11H8l-4 4z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7",
  plus: "M12 4v16M4 12h16",
  heart: "M12 20s-7.5-4.6-9.8-9.2C.6 7.4 2.3 4 5.8 4c2 0 3.4 1 4.8 2.7C12 5 13.4 4 15.4 4c3.5 0 5.2 3.4 3.6 6.8C19.5 15.4 12 20 12 20z",
  comment: "M4 4.5h16v12H9l-4.5 4V4.5z",
  send: "M21 3L2.5 10.4 11 13l2.6 8.5z",
  bookmark: "M6 3h12v18l-6-4.5L6 21z",
  search: "M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM20 20l-4.8-4.8",
  camera: "M4 8h3l1.5-2h7L17 8h3v11H4z M12 13.5a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 12.9a7.6 7.6 0 000-1.8l2-1.5-2-3.4-2.3.9a7.4 7.4 0 00-1.6-.9L15 3.5H9l-.5 2.4a7.4 7.4 0 00-1.6.9l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 000 1.8l-2 1.5 2 3.4 2.3-.9c.5.4 1 .7 1.6.9L9 20.5h6l.5-2.4c.6-.2 1.1-.5 1.6-.9l2.3.9 2-3.4z",
  edit: "M4 20l1-4L16 5l3 3L8 19z",
  back: "M15 5l-7 7 7 7",
  more: "M5 12a1.6 1.6 0 113.2 0A1.6 1.6 0 015 12zm5.4 0a1.6 1.6 0 113.2 0 1.6 1.6 0 01-3.2 0zm5.4 0a1.6 1.6 0 113.2 0 1.6 1.6 0 01-3.2 0z",
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  pawprint: "M12 14c-3.3 0-7 2.5-7 5.2 0 1.3 1 2.3 2.3 2.3 1.4 0 2-.7 4.7-.7s3.3.7 4.7.7c1.3 0 2.3-1 2.3-2.3 0-2.7-3.7-5.2-7-5.2zM5.5 10.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM18.5 10.5a2.2 2.2 0 100-4.4 2.2 2.2 0 000 4.4zM9 5.5A2.2 2.2 0 109 1a2.2 2.2 0 000 4.5zM15 5.5A2.2 2.2 0 1015 1a2.2 2.2 0 000 4.5z",
  check: "M5 12l5 5 9-10",
  siren: "M12 3L1 21h22L12 3zM12 10v5M12 18h.01",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  cross: "M2 12h4l1.5-4 3 12 2.5-14 2 6h6.5",
  calendar: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
};

export function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: keyof typeof PATHS;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
