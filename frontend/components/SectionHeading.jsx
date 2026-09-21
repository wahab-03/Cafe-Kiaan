export default function SectionHeading({ eyebrow, title }) {
  return (
    <div className="mb-10 flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-kiaan-pink/40" aria-hidden="true" />
      <span className="text-kiaan-pink" aria-hidden="true">✦</span>
      <div className="text-center">
        {eyebrow && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-kiaan-pink">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-3xl font-bold uppercase tracking-wide text-kiaan-ink sm:text-4xl">
          {title}
        </h2>
      </div>
      <span className="text-kiaan-pink" aria-hidden="true">✦</span>
      <span className="h-px w-8 bg-kiaan-pink/40" aria-hidden="true" />
    </div>
  );
}
