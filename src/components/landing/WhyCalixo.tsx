import { X, CheckCircle2 } from "lucide-react";
import { Container } from "./shared/Container";
import { SectionHeading } from "./shared/SectionHeading";
import { Reveal } from "./shared/Reveal";

const rows = [
  { before: "8+ disconnected tools", after: "One unified platform" },
  { before: "A separate login for every tool", after: "One single sign-on" },
  { before: "Manual, error-prone reporting", after: "Unified, automated reports" },
  { before: "Disconnected, siloed data", after: "Unified analytics, powered by AI" },
  { before: "Manual, repetitive workflows", after: "Unified automation across every team" },
  { before: "No single source of truth", after: "One AI. One source of truth." },
];

export default function WhyCalixo() {
  return (
    <section className="relative bg-background py-24 lg:py-32">
      <Container>
        <SectionHeading badge="Why Calixo" title="The old way doesn't scale. This is the new way." />

        <Reveal delay={0.1}>
          <div className="table-container mx-auto mt-14 max-w-4xl">
            <table className="table w-full">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell w-1/2">Traditional Stack</th>
                  <th className="table-header-cell w-1/2 !text-primary">Calixo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.before} className="table-row">
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-2.5 text-muted-foreground">
                        <X size={16} className="flex-shrink-0 text-destructive/70" />
                        {row.before}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center gap-2.5 font-semibold text-foreground">
                        <CheckCircle2 size={16} className="flex-shrink-0 text-success" />
                        {row.after}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
