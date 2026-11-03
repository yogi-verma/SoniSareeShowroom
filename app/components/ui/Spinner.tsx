import { FiLoader } from "react-icons/fi";

export function Spinner({ size = 16, className = "", label }: { size?: number; className?: string; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} role={label ? "status" : undefined}>
      <FiLoader size={size} className="store-spinner" aria-hidden="true" />
      {label && <span>{label}</span>}
    </span>
  );
}
