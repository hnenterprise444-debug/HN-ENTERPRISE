import React from "react";
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaTable, FaAlignLeft } from "react-icons/fa";
import {
  normalizeDescriptionState,
  getRowCells,
  addTextSection,
  addTableSection,
  removeSection,
  moveSection,
  updateSectionField,
  addColumn,
  removeColumn,
  updateColumnName,
  addRow,
  removeRow,
  updateCell,
} from "../utils/descriptionUtils";

/**
 * ProductDescriptionBuilder Component (Admin Products Module)
 * Enables admins to construct structured descriptions containing ordered TEXT and TABLE sections.
 * Delegates pure data manipulations to ../utils/descriptionUtils.js
 */
export default function ProductDescriptionBuilder({ value, onChange }) {
  const descriptionState = normalizeDescriptionState(value);

  const updateShort = (shortText) => {
    onChange({
      ...descriptionState,
      short: shortText,
    });
  };

  const updateSections = (newSections) => {
    onChange({
      ...descriptionState,
      sections: newSections,
    });
  };

  return (
    <div className="space-y-5">
      {/* Short Summary */}
      <div>
        <label className="block font-semibold text-text-base mb-1.5 text-xs">
          Short Overview / Summary (Optional)
        </label>
        <textarea
          rows={4}
          value={descriptionState.short}
          onChange={(e) => updateShort(e.target.value)}
          placeholder="Brief 1-2 sentence overview of the product..."
          className="w-full rounded-xl border border-border-subtle bg-bg-base px-3.5 py-2.5 text-xs text-text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[90px]"
        />
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block font-bold text-text-base uppercase tracking-wider text-[11px]">
            Content Sections ({descriptionState.sections.length})
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateSections(addTextSection(descriptionState.sections))}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FaAlignLeft size={11} /> + Text Section
            </button>
            <button
              type="button"
              onClick={() => updateSections(addTableSection(descriptionState.sections))}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FaTable size={11} /> + Table Section
            </button>
          </div>
        </div>

        {descriptionState.sections.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-border-subtle/70 rounded-xl text-center text-text-muted text-xs bg-bg-base/40">
            No description sections added. Click <span className="font-semibold text-primary">"+ Text Section"</span> or <span className="font-semibold text-primary">"+ Table Section"</span> above.
          </div>
        ) : (
          descriptionState.sections.map((section, idx) => (
            <div key={idx} className="border border-border-subtle rounded-xl p-4 bg-card space-y-3.5 shadow-xs">
              {/* Section Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border-subtle/60 pb-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-primary tracking-wide">
                  {section.type === "TEXT" ? <FaAlignLeft size={11} /> : <FaTable size={11} />}
                  {section.type} SECTION #{idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateSections(moveSection(descriptionState.sections, idx, -1))}
                    disabled={idx === 0}
                    className="p-1.5 rounded-md text-text-muted hover:text-text-base hover:bg-card-hover disabled:opacity-30 cursor-pointer transition"
                    title="Move Up"
                  >
                    <FaArrowUp size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSections(moveSection(descriptionState.sections, idx, 1))}
                    disabled={idx === descriptionState.sections.length - 1}
                    className="p-1.5 rounded-md text-text-muted hover:text-text-base hover:bg-card-hover disabled:opacity-30 cursor-pointer transition"
                    title="Move Down"
                  >
                    <FaArrowDown size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSections(removeSection(descriptionState.sections, idx))}
                    className="p-1.5 rounded-md text-rose-500 hover:bg-rose-500/10 cursor-pointer ml-1 transition"
                    title="Delete Section"
                  >
                    <FaTrash size={11} />
                  </button>
                </div>
              </div>

              {/* Title Field */}
              <div>
                <input
                  type="text"
                  value={section.title || ""}
                  onChange={(e) => updateSections(updateSectionField(descriptionState.sections, idx, "title", e.target.value))}
                  placeholder="Section Title (e.g. Overview or Technical Specifications)"
                  className="w-full rounded-xl border border-border-subtle bg-bg-base px-3 py-2 text-xs font-bold text-text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* TEXT Section Builder */}
              {section.type === "TEXT" && (
                <div>
                  <textarea
                    rows={5}
                    value={section.content || ""}
                    onChange={(e) => updateSections(updateSectionField(descriptionState.sections, idx, "content", e.target.value))}
                    placeholder="Write detailed section content here..."
                    className="w-full rounded-xl border border-border-subtle bg-bg-base p-3 text-xs text-text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[120px]"
                  />
                </div>
              )}

              {/* TABLE Section Builder */}
              {section.type === "TABLE" && (
                <div className="space-y-3">
                  <div className="overflow-x-auto border border-border-subtle rounded-lg bg-bg-base">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border-subtle bg-bg-base">
                          {(section.columns || []).map((col, cIdx) => (
                            <th key={cIdx} className="p-2 border-r border-border-subtle/50 min-w-[120px]">
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={col}
                                  onChange={(e) => updateSections(updateColumnName(descriptionState.sections, idx, cIdx, e.target.value))}
                                  placeholder={`Column ${cIdx + 1}`}
                                  className="w-full bg-bg-base border border-border-subtle rounded px-1.5 py-0.5 text-xs font-bold text-text-base focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                {section.columns.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => updateSections(removeColumn(descriptionState.sections, idx, cIdx))}
                                    className="text-rose-500 hover:text-rose-400 p-0.5"
                                    title="Delete column"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            </th>
                          ))}
                          <th className="p-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(section.rows || []).map((row, rIdx) => {
                          const cells = getRowCells(row);
                          return (
                            <tr key={rIdx} className="border-b border-border-subtle/50 last:border-0 hover:bg-card-hover">
                              {(section.columns || []).map((_, cIdx) => (
                                <td key={cIdx} className="p-1.5 border-r border-border-subtle/50">
                                  <input
                                    type="text"
                                    value={cells[cIdx] || ""}
                                    onChange={(e) => updateSections(updateCell(descriptionState.sections, idx, rIdx, cIdx, e.target.value))}
                                    placeholder="Cell value..."
                                    className="w-full bg-bg-base border border-border-subtle/70 rounded px-2 py-1 text-xs text-text-base placeholder:text-text-subtle focus:outline-none focus:ring-1 focus:ring-primary"
                                  />
                                </td>
                              ))}
                              <td className="p-1.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => updateSections(removeRow(descriptionState.sections, idx, rIdx))}
                                  className="text-rose-500 hover:text-rose-400 font-bold px-1"
                                  title="Delete row"
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Control Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateSections(addRow(descriptionState.sections, idx))}
                      className="px-2.5 py-1 rounded bg-bg-base border border-border-subtle text-text-base font-bold text-[10px] hover:bg-card-hover cursor-pointer"
                    >
                      + Add Row
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSections(addColumn(descriptionState.sections, idx))}
                      className="px-2.5 py-1 rounded bg-bg-base border border-border-subtle text-text-base font-bold text-[10px] hover:bg-card-hover cursor-pointer"
                    >
                      + Add Column
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
