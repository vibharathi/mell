export default function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <use href={`/icons.svg#${name}`} />
    </svg>
  );
}