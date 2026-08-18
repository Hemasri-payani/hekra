export function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <section className="surface-hero">
      <div className="container-page py-16 sm:py-20">
        <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold sm:text-5xl">{title}</h1>
        {body ? <p className="mt-4 max-w-2xl text-ink-muted">{body}</p> : null}
      </div>
    </section>
  );
}
