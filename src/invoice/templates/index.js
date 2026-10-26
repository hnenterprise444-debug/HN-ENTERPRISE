import DefaultInvoiceTemplate from "./DefaultInvoiceTemplate";
import MinimalInvoiceTemplate from "./MinimalInvoiceTemplate";
import ClassicInvoiceTemplate from "./ClassicInvoiceTemplate";

/**
 * 🎯 ACTIVE INVOICE TEMPLATE CONFIGURATION
 * -----------------------------------------------------------------------------
 * Change this single key ("classic", "default", or "minimal") to instantly swap
 * the active invoice template for BOTH Admin and Client panels across the app!
 */
export const ACTIVE_INVOICE_TEMPLATE = "classic";

export const INVOICE_TEMPLATES = {
  classic: ClassicInvoiceTemplate,
  default: DefaultInvoiceTemplate,
  minimal: MinimalInvoiceTemplate,
  calssic: ClassicInvoiceTemplate // Typo fallback alias
};

export const DEFAULT_TEMPLATE_KEY = ACTIVE_INVOICE_TEMPLATE;

export function getInvoiceTemplate(templateKey = ACTIVE_INVOICE_TEMPLATE) {
  return (
    INVOICE_TEMPLATES[templateKey] ||
    INVOICE_TEMPLATES[ACTIVE_INVOICE_TEMPLATE] ||
    INVOICE_TEMPLATES.classic
  );
}

export { DefaultInvoiceTemplate, MinimalInvoiceTemplate, ClassicInvoiceTemplate };
