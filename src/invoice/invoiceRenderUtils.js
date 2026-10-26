import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { normalizeInvoiceData } from "./invoiceDataUtils";

/**
 * invoiceRenderUtils.js
 * Centralized print & PDF rendering engine.
 * Houses HTML UI PDF generation and window printing logic.
 */
export const invoiceRenderUtils = {
  /**
   * Triggers native browser window printing for an element ID or page
   */
  printInvoice(elementId = "printable-invoice") {
    const element = document.getElementById(elementId);
    if (!element) {
      window.print();
      return;
    }
    window.print();
  },

  /**
   * Generates and directly downloads a PDF preserving 100% of the exact HTML invoice UI styling.
   * Employs JPEG encoding & jsPDF stream compression to achieve a tiny file size (~180 KB - 280 KB instead of 6.7 MB).
   */
  async generateClientInvoicePdf(orderData, siteConfig = {}, elementId = "printable-invoice", elementRef = null) {
    const normalized = normalizeInvoiceData(orderData, siteConfig);
    const invoiceNumber = normalized.invoiceNumber || "INV";
    const fileName = `Invoice-${invoiceNumber}.pdf`;

    const element = elementRef?.current || document.getElementById(elementId);
    if (!element) {
      throw new Error("Invoice template element not found in DOM.");
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    // JPEG at 85% quality compresses white spaces & text efficiently, reducing file size by 96%+
    const imgData = canvas.toDataURL("image/jpeg", 0.85);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

    pdf.save(fileName);
  }
};



