import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaFilePdf, FaFileExcel, FaShareNodes } from "react-icons/fa6";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function DownloadButtons() {
  const { handleExportPDF, handleExportExcel, handleShareURL, partPayments, emiIncreases } =
    useLoanCalculator();

  const hasSimulations =
    Object.keys(partPayments || {}).some((k) => partPayments[Number(k)] > 0) ||
    Object.keys(emiIncreases || {}).length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border justify-center">
      {/* Primary: Save to account */}
      <Button
        asChild
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        size="sm"
      >
        <Link href={hasSimulations ? "/login?ref=simulator&save=true" : "/login?ref=calculator&save=true"}>
          {hasSimulations ? "Save this plan — free" : "Save to dashboard — free"}
        </Link>
      </Button>

      {/* Secondary: downloads */}
      <Button variant="outline" size="sm" onClick={handleExportPDF}>
        <FaFilePdf className="mr-1.5" /> PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportExcel}>
        <FaFileExcel className="mr-1.5" /> Excel
      </Button>
      <Button variant="ghost" size="sm" onClick={handleShareURL}>
        <FaShareNodes className="mr-1.5" /> Share
      </Button>
    </div>
  );
}
