export default function Mascot({ message, emoji = '🤖', className = '' }: { message?: string; emoji?: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div aria-hidden className="animate-float text-5xl">{emoji}</div>
      {message && (
        <div className="animate-pop-in relative rounded-2xl rounded-bl-md bg-white px-4 py-2.5 font-extrabold shadow-[0_4px_0_#ece3d2]">
          {message}
        </div>
      )}
    </div>
  );
}