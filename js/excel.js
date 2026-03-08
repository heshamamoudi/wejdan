import { getLang, t } from "./i18n.js";

export function exportToExcel(guests, sheetName) {
  const lang = getLang();
  const isAr = lang === "ar";

  const headers = [
    t("excelName"),
    t("excelPhone"),
    t("excelCommunicated"),
    t("excelConfirmed"),
    t("excelChildren"),
    t("excelNotes"),
  ];

  const rows = guests.map((g) => [
    g.name || "",
    g.phone || "",
    g.communicated ? t("yes") : t("no"),
    g.confirmed ? t("yes") : t("no"),
    (g.children || []).map((c) => c.name).join(", "),
    g.notes || "",
  ]);

  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Auto-width columns
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i]).length)
    );
    return { wch: Math.min(maxLen + 4, 40) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const guests = jsonData.map((row) => {
          const name = row["الاسم"] || row["Name"] || row["name"] || "";
          const phone =
            row["رقم الجوال"] || row["Phone"] || row["phone"] || "";
          const communicated = parseBool(
            row["تم الاعتذار"] || row["تم التواصل"] || row["Apologized"] || row["Communicated"] || row["communicated"]
          );
          const confirmed = parseBool(
            row["تم القبول"] || row["تم التأكيد"] || row["Accepted"] || row["Confirmed"] || row["confirmed"]
          );
          const childrenStr =
            row["الأطفال"] || row["Children"] || row["children"] || "";
          const notes =
            row["ملاحظات"] || row["Notes"] || row["notes"] || "";

          const children = childrenStr
            ? childrenStr
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean)
                .map((c) => ({ name: c }))
            : [];

          return { name, phone, communicated, confirmed, children, notes };
        });

        resolve(guests);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function downloadTemplate() {
  const lang = getLang();
  const isAr = lang === "ar";

  const headers = [
    t("excelName"),
    t("excelPhone"),
    t("excelConfirmed"),
    t("excelCommunicated"),
    t("excelChildren"),
    t("excelNotes"),
  ];

  const exampleRow = isAr
    ? ["محمد أحمد", "0501234567", "نعم", "لا", "سارة, علي", "ملاحظة"]
    : ["John Doe", "0501234567", "Yes", "No", "Sara, Ali", "Note"];

  const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
  ws["!cols"] = headers.map((h, i) => ({
    wch: Math.max(h.length, String(exampleRow[i]).length) + 4,
  }));

  const wb = XLSX.utils.book_new();
  const sheetName = isAr ? "قالب_المدعوين" : "Guest_Template";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
}

function parseBool(val) {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") {
    const v = val.trim().toLowerCase();
    return v === "yes" || v === "نعم" || v === "true" || v === "1";
  }
  return false;
}
