/**
 * Description Builder Utilities (Admin Products Module)
 * Pure, immutable helper functions for managing description sections and tables.
 */

/**
 * Normalizes incoming description state into a structured format
 */
export function normalizeDescriptionState(value) {
  if (typeof value === "object" && value !== null) {
    return {
      short: value.short || "",
      sections: Array.isArray(value.sections) ? value.sections : [],
    };
  }
  return {
    short: typeof value === "string" ? value : "",
    sections: typeof value === "string" && value.trim()
      ? [{ type: "TEXT", title: "Description", content: value }]
      : [],
  };
}

/**
 * Safely extracts cell array from a table row (array or object format)
 */
export function getRowCells(row) {
  if (Array.isArray(row)) return row;
  if (row && typeof row === "object" && Array.isArray(row.cells)) return row.cells;
  return [];
}

/**
 * Adds a new text section
 */
export function addTextSection(sections) {
  const newSection = {
    type: "TEXT",
    title: "",
    content: "",
  };
  return [...sections, newSection];
}

/**
 * Adds a new table section with empty columns & rows for placeholders
 */
export function addTableSection(sections) {
  const newSection = {
    type: "TABLE",
    title: "",
    columns: ["", ""],
    rows: [
      { cells: ["", ""] },
      { cells: ["", ""] },
    ],
  };
  return [...sections, newSection];
}

/**
 * Removes a section by index
 */
export function removeSection(sections, index) {
  return sections.filter((_, i) => i !== index);
}

/**
 * Moves a section up or down
 */
export function moveSection(sections, index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= sections.length) return sections;

  const copy = [...sections];
  const temp = copy[index];
  copy[index] = copy[targetIndex];
  copy[targetIndex] = temp;
  return copy;
}

/**
 * Updates a specific field on a section
 */
export function updateSectionField(sections, index, field, val) {
  const copy = [...sections];
  copy[index] = { ...copy[index], [field]: val };
  return copy;
}

/**
 * Table Helper: Adds a column to a table section
 */
export function addColumn(sections, sectionIndex) {
  const copy = [...sections];
  const sec = copy[sectionIndex];
  const newCols = [...sec.columns, ""];
  const newRows = (sec.rows || []).map((row) => {
    const cells = getRowCells(row);
    return { cells: [...cells, ""] };
  });
  copy[sectionIndex] = { ...sec, columns: newCols, rows: newRows };
  return copy;
}

/**
 * Table Helper: Removes a column from a table section (keeps at least 1)
 */
export function removeColumn(sections, sectionIndex, colIndex) {
  const copy = [...sections];
  const sec = copy[sectionIndex];
  if (sec.columns.length <= 1) return sections;

  const newCols = sec.columns.filter((_, i) => i !== colIndex);
  const newRows = (sec.rows || []).map((row) => {
    const cells = getRowCells(row);
    return { cells: cells.filter((_, i) => i !== colIndex) };
  });
  copy[sectionIndex] = { ...sec, columns: newCols, rows: newRows };
  return copy;
}

/**
 * Table Helper: Updates column header name
 */
export function updateColumnName(sections, sectionIndex, colIndex, name) {
  const copy = [...sections];
  const sec = copy[sectionIndex];
  const newCols = [...sec.columns];
  newCols[colIndex] = name;
  copy[sectionIndex] = { ...sec, columns: newCols };
  return copy;
}

/**
 * Table Helper: Adds a row to a table section
 */
export function addRow(sections, sectionIndex) {
  const copy = [...sections];
  const sec = copy[sectionIndex];
  const emptyCells = new Array(sec.columns.length).fill("");
  const newRows = [...(sec.rows || []), { cells: emptyCells }];
  copy[sectionIndex] = { ...sec, rows: newRows };
  return copy;
}

/**
 * Table Helper: Removes a row from a table section
 */
export function removeRow(sections, sectionIndex, rowIndex) {
  const copy = [...sections];
  const sec = copy[sectionIndex];
  const newRows = (sec.rows || []).filter((_, i) => i !== rowIndex);
  copy[sectionIndex] = { ...sec, rows: newRows };
  return copy;
}

/**
 * Table Helper: Updates cell value in a table section
 */
export function updateCell(sections, sectionIndex, rowIndex, colIndex, val) {
  const copy = [...sections];
  const sec = copy[sectionIndex];
  const newRows = (sec.rows || []).map((r, rIdx) => {
    if (rIdx !== rowIndex) return r;
    const currentCells = getRowCells(r);
    const updatedCells = [...currentCells];
    updatedCells[colIndex] = val;
    return { cells: updatedCells };
  });
  copy[sectionIndex] = { ...sec, rows: newRows };
  return copy;
}
