import {
  ClipboardList,
  FileCheck,
  FlaskConical,
  Send,
  TestTube2,
  UserPlus,
  Beaker,
} from 'lucide-react';

const STEPS = [
  { label: 'Patient Registration', icon: UserPlus },
  { label: 'Test Order', icon: ClipboardList },
  { label: 'Sample Collection', icon: TestTube2 },
  { label: 'Processing', icon: FlaskConical },
  { label: 'Result Entry', icon: Beaker },
  { label: 'Pathologist Approval', icon: FileCheck },
  { label: 'Report Delivery', icon: Send },
];

export function WorkflowTimeline() {
  return (
    <section className="bg-muted-bg py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">End-to-End Workflow</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Every step connected, nothing isolated
          </h2>
          <p className="mt-3 text-muted">
            From front desk to final report — LabCore guides your team through a seamless laboratory pipeline.
          </p>
        </div>

        <div className="mt-14 hidden lg:block">
          <div className="relative flex items-start justify-between">
            <div className="absolute left-0 right-0 top-8 h-0.5 bg-primary/20" />
            {STEPS.map((step, i) => (
              <div key={step.label} className="relative flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-white shadow-card">
                  <step.icon className="text-primary" size={24} />
                </div>
                <p className="mt-3 max-w-[100px] text-center text-xs font-medium text-slate-900">{step.label}</p>
                {i < STEPS.length - 1 && (
                  <span className="absolute -right-2 top-7 text-primary/40">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="mt-10 space-y-0 lg:hidden">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-white shadow-card">
                  <step.icon className="text-primary" size={20} />
                </div>
                {i < STEPS.length - 1 && <div className="my-1 w-0.5 flex-1 bg-primary/20" />}
              </div>
              <div className="pb-8 pt-2">
                <p className="font-medium text-slate-900">{step.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
