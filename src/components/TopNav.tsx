import { Plus, ShieldCheck } from 'lucide-react';

interface TopNavProps {
  onOpenCreate: () => void;
}

export function TopNav({ onOpenCreate }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1326]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#overview"
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-lg font-bold tracking-tight text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#059669]/20 text-[#68dba9] border border-[#68dba9]/30">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          AeroShield
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 text-sm font-medium text-[#bccac0] md:flex"
        >
          <a
            href="#overview"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] rounded"
          >
            Overview
          </a>
          <a
            href="#advisor"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] rounded"
          >
            GenAI Advisor
          </a>
          <a
            href="#action-plan"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] rounded"
          >
            Action Plan
          </a>
          <a
            href="#impact-lab"
            className="whitespace-nowrap shrink-0 transition-colors hover:text-[#dae2fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] rounded"
          >
            Impact Lab
          </a>
        </nav>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-[#059669] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#047857] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#68dba9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1326]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Action
          </button>
        </div>
      </div>
    </header>
  );
}
