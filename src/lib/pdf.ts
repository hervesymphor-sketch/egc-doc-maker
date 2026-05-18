import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;

async function renderElement(el: HTMLElement) {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
  return {
    imgData: canvas.toDataURL("image/jpeg", 0.95),
    imgHeight: (canvas.height * PAGE_WIDTH) / canvas.width,
  };
}

function addPaged(pdf: jsPDF, imgData: string, imgHeight: number) {
  let heightLeft = imgHeight;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, PAGE_WIDTH, imgHeight);
  heightLeft -= PAGE_HEIGHT;
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, PAGE_WIDTH, imgHeight);
    heightLeft -= PAGE_HEIGHT;
  }
}

export async function exportElementToPdf(
  el: HTMLElement,
  filename: string,
): Promise<Blob> {
  const { imgData, imgHeight } = await renderElement(el);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  addPaged(pdf, imgData, imgHeight);
  pdf.save(filename);
  return pdf.output("blob");
}

export async function exportElementsToPdf(
  els: HTMLElement[],
  filename: string,
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  for (let i = 0; i < els.length; i++) {
    const { imgData, imgHeight } = await renderElement(els[i]);
    if (i > 0) pdf.addPage();
    addPaged(pdf, imgData, imgHeight);
    onProgress?.(i + 1, els.length);
  }
  pdf.save(filename);
  return pdf.output("blob");
}
