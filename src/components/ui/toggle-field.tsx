/**
 * A labelled checkbox in a card, as used across the settings screens.
 *
 * Stays a real `<input type="checkbox">` rather than a styled button so the
 * whole settings surface keeps working as a plain form post — no client state,
 * and the label text is the accessible name for free.
 */
export function ToggleField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
      />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-foreground">{label}</span>
        <span className="mt-1 block text-[11.5px] leading-relaxed text-muted">{description}</span>
      </span>
    </label>
  );
}
