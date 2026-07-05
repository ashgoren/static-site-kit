import Link from "next/link";

export function PageShell({ title, subtitle, children }: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-200 mx-auto px-4 mb-12 text-center">
        <h1 className="text-[clamp(1.5rem,4vw,1.75rem)]">{title}</h1>
        {subtitle}
      </div>
      <div className="max-w-200 mx-auto px-4">{children}</div>
    </div>
  );
}

export function SectionDivider() {
  return <hr className="my-8 border-foreground/15" />;
}

export function SectionHeader({ id, children }: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <h2 id={id} className="text-xl font-bold mt-8 mb-2">
      {children}
    </h2>
  );
}

export function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-base leading-relaxed my-3">{children}</p>;
}

export function SectionSubHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold mt-5 mb-1 text-foreground/70">{children}</h3>
  );
}

export function BulletList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc list-outside pl-5 space-y-1 text-base text-foreground/80">
      {children}
    </ul>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-accent/50 rounded-2xl px-5 py-4 my-8 bg-accent/15">
      {children}
    </div>
  );
}

export function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-foreground/20 pl-4 italic text-foreground/70 text-base leading-relaxed my-6">
      {children}
    </blockquote>
  );
}

export function EventCard({ title, note, highlight, facts, children }: {
  title: React.ReactNode;
  note?: React.ReactNode;
  highlight?: React.ReactNode;
  facts: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-foreground/15 p-4 sm:p-6 mb-6">
      <h2 className={`text-xl font-bold ${highlight ? "mb-3" : (note ? "mb-1" : "mb-3")}`}>{title}</h2>
      {!highlight && note && <p className="text-sm text-foreground/70 italic mb-3">{note}</p>}

      {highlight && (
        <div className="mb-3 pb-3 border-b border-foreground/10">
          <div className="text-base font-semibold space-y-0.5">{highlight}</div>
          {note && <p className="text-sm text-foreground/70 italic mt-1">{note}</p>}
        </div>
      )}
      <div className="text-sm space-y-1">{facts}</div>

      {children}
    </div>
  );
}

export function InlineLink({ href, children }: {
  href: string;
  children: React.ReactNode;
}) {
  const cls = "underline underline-offset-2 hover:opacity-70 transition-opacity";
  if (href.startsWith("/") && !href.endsWith(".pdf")) {
    return <Link href={href} className={cls}>{children}</Link>;
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  );
}
