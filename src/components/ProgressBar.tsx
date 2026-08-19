export default function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-4 w-full overflow-hidden rounded-full bg-[#efe6d4] ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-sun to-coral transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}