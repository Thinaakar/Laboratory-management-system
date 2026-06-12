export default function TermsPage() {
  return (
    <>
      <div className="mkt-page-hero">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="mkt-section-title">Terms & Conditions</h1>
        </div>
      </div>
      <section className="mx-auto max-w-3xl px-6 py-16 text-sm leading-relaxed text-muted">
        <p>By accessing LabCore services, you agree to these terms. Please read them carefully before using our platform.</p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">Service Usage</h2>
        <p className="mt-2">LabCore LIMS is provided as a subscription service for authorized laboratory personnel. You are responsible for maintaining account security and ensuring users comply with applicable healthcare regulations.</p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">Data Responsibility</h2>
        <p className="mt-2">Customers retain ownership of patient and laboratory data. LabCore processes data solely to provide the contracted services.</p>
        <h2 className="mt-8 text-lg font-semibold text-slate-900">Contact</h2>
        <p className="mt-2">For terms inquiries: hello@labcore.io</p>
      </section>
    </>
  );
}
