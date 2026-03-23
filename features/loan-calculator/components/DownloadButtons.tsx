import React from "react";
import { Button } from "@/components/ui/button";
import { FaFilePdf, FaFileExcel, FaShareAlt } from "react-icons/fa";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function DownloadButtons() {
  const { handleExportPDF, handleExportExcel, handleShareURL } = useLoanCalculator();

  return (
    <div className="flex flex-row flex-wrap gap-3 mt-4 justify-center">
      <Button
        type="button"
        variant="default"
        onClick={handleExportPDF}
        className="bg-[#10B981] text-white rounded-full text-sm px-4 py-2 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-colors"
      >
        <FaFilePdf /> Download PDF
      </Button>
      <Button
        type="button"
        variant="default"
        onClick={handleExportExcel}
        className="bg-[#10B981] text-white rounded-full text-sm px-4 py-2 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-colors"
      >
        <FaFileExcel /> Download Excel
      </Button>
      <Button
        type="button"
        variant="default"
        onClick={handleShareURL}
        className="bg-[#10B981] text-white rounded-full text-sm px-4 py-2 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-colors"
      >
        <FaShareAlt /> Share
      </Button>
    </div>
  );
}
