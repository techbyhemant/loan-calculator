import React from "react";
import { Button } from "@/components/ui/button";
import { FaFilePdf } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa6";
import { FaShareNodes } from "react-icons/fa6";
import { useLoanCalculator } from "../context/LoanCalculatorContext";

export function DownloadButtons() {
  const { handleExportPDF, handleExportExcel, handleShareURL } = useLoanCalculator();

  return (
    <div className="flex flex-row flex-wrap gap-3 mt-4 justify-center">
      <Button
        type="button"
        variant="default"
        onClick={handleExportPDF}
        className="bg-primary text-white rounded-full text-sm px-4 py-2 flex items-center gap-2 hover:bg-primary/90 hover:text-white transition-colors"
      >
        <FaFilePdf /> Download PDF
      </Button>
      <Button
        type="button"
        variant="default"
        onClick={handleExportExcel}
        className="bg-primary text-white rounded-full text-sm px-4 py-2 flex items-center gap-2 hover:bg-primary/90 hover:text-white transition-colors"
      >
        <FaFileExcel /> Download Excel
      </Button>
      <Button
        type="button"
        variant="default"
        onClick={handleShareURL}
        className="bg-primary text-white rounded-full text-sm px-4 py-2 flex items-center gap-2 hover:bg-primary/90 hover:text-white transition-colors"
      >
        <FaShareNodes /> Share
      </Button>
    </div>
  );
}
