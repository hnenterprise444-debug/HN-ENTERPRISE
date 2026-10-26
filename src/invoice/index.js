/**
 * Global Invoice Module Barrel Export
 * Centralizes all invoice rendering, printing, template selection, and download functionality.
 */

export { default as InvoiceRenderer } from "./InvoiceRenderer";
export { default as InvoiceDownloadButton } from "./InvoiceDownloadButton";
export { normalizeInvoiceData } from "./invoiceDataUtils";
export { invoiceRenderUtils } from "./invoiceRenderUtils";
export { INVOICE_TEMPLATES, getInvoiceTemplate } from "./templates";
