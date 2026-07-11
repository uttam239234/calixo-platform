import { CreditCard } from "lucide-react";
import { ComingSoonSection } from "@/components/settings/ComingSoonSection";

export default function BillingPage() {
  return (
    <ComingSoonSection
      icon={<CreditCard size={28} />}
      title="Billing & Plans"
      description="Manage your plan, payment method, and invoices. A read-only summary already lives on the Organization page today."
    />
  );
}
