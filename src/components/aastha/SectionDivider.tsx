interface SectionDividerProps {
  label?: string;
}

const SectionDivider = ({ label }: SectionDividerProps) => {
  return (
    <div className="container py-10 sm:py-14" aria-hidden={!label}>
      <div className="flex items-center justify-center gap-4">
        <span className="h-px flex-1 max-w-[180px] bg-gradient-to-r from-transparent via-cta/60 to-cta" />
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cta" />
          <span className="h-1.5 w-6 rounded-full bg-cta" />
          <span className="h-1.5 w-1.5 rounded-full bg-cta" />
        </span>
        {label ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/70 px-2">
            {label}
          </span>
        ) : null}
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cta" />
          <span className="h-1.5 w-6 rounded-full bg-cta" />
          <span className="h-1.5 w-1.5 rounded-full bg-cta" />
        </span>
        <span className="h-px flex-1 max-w-[180px] bg-gradient-to-l from-transparent via-cta/60 to-cta" />
      </div>
    </div>
  );
};

export default SectionDivider;
