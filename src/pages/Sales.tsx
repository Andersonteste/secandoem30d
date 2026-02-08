import SalesHero from "@/components/sales/SalesHero";
import SalesForWho from "@/components/sales/SalesForWho";
import SalesResults from "@/components/sales/SalesResults";
import SalesAppFeatures from "@/components/sales/SalesAppFeatures";
import SalesHowItWorks from "@/components/sales/SalesHowItWorks";
import SalesWhatsAppGroup from "@/components/sales/SalesWhatsAppGroup";
import SalesDifferentials from "@/components/sales/SalesDifferentials";
import SalesFinalCTA from "@/components/sales/SalesFinalCTA";

const Sales = () => {
  return (
    <div className="min-h-screen bg-[hsl(0,0%,5%)]">
      <SalesHero />
      <SalesForWho />
      <SalesResults />
      <SalesAppFeatures />
      <SalesHowItWorks />
      <SalesWhatsAppGroup />
      <SalesDifferentials />
      <SalesFinalCTA />
    </div>
  );
};

export default Sales;
