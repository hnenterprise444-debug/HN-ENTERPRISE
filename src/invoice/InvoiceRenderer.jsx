import React, { forwardRef } from "react";
import { getInvoiceTemplate, ACTIVE_INVOICE_TEMPLATE } from "./templates";

/**
 * InvoiceRenderer Component
 * Dynamic invoice template renderer.
 * Consumes ACTIVE_INVOICE_TEMPLATE from src/invoice/templates/index.js as default.
 */
const InvoiceRenderer = forwardRef(({ invoiceData, templateKey }, ref) => {
  if (!invoiceData) return null;

  // Resolve template key dynamically:
  // 1. Explicit templateKey prop (if passed)
  // 2. Configured invoiceTemplate from invoiceData.siteConfig
  // 3. Fallback to ACTIVE_INVOICE_TEMPLATE from src/invoice/templates/index.js
  const resolvedKey =
    templateKey ||
    invoiceData?.siteConfig?.invoiceTemplate ||
    invoiceData?.company?.invoiceTemplate ||
    ACTIVE_INVOICE_TEMPLATE;

  const SelectedTemplate = getInvoiceTemplate(resolvedKey);

  return <SelectedTemplate ref={ref} invoiceData={invoiceData} />;
});

InvoiceRenderer.displayName = "InvoiceRenderer";

export default InvoiceRenderer;
