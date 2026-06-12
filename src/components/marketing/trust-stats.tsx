const STATS = [
  { value: '500+', label: 'Laboratories' },
  { value: '1M+', label: 'Reports Generated' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' },
];

export function TrustStats() {
  return (
    <section className="border-y border-muted-border bg-muted-bg py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-3xl font-bold text-slate-900 md:text-4xl">{s.value}</p>
            <p className="mt-1 text-sm font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
