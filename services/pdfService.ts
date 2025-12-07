
import { jsPDF } from "jspdf";
import { AnalysisResult } from "../types";

/**
 * Creates the jsPDF document instance with all content.
 * logic is split for reusability between Download (save) and Share (blob).
 */
const createDoc = (result: AnalysisResult, imageSrc: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // --- Theme Colors ---
  const colors = {
    primary: [0, 102, 245], // #0066F5
    text: [30, 41, 59],     // Slate 800
    red: [211, 47, 47],
    orange: [245, 124, 0],
    yellow: [251, 192, 45],
    green: [56, 142, 60]
  };

  const addHeader = (pageNum: number) => {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`MedSnap Translation • ${new Date().toLocaleDateString()}`, margin, 15);
    doc.text(`Page ${pageNum}`, pageWidth - margin, 15, { align: 'right' });
  };

  // ==========================
  // PAGE 1: VISUAL & LEGEND
  // ==========================
  addHeader(1);
  
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Original Document", margin, 30);

  try {
    // Detect Image Format based on base64 header
    let format = 'JPEG';
    if (imageSrc.startsWith('data:image/png')) format = 'PNG';
    if (imageSrc.startsWith('data:image/webp')) format = 'WEBP';

    const imgProps = doc.getImageProperties(imageSrc);
    const imgRatio = imgProps.width / imgProps.height;
    const maxImgWidth = pageWidth - (margin * 2);
    const maxImgHeight = pageHeight - 100; // Leave space for legend
    
    let finalImgWidth = maxImgWidth;
    let finalImgHeight = finalImgWidth / imgRatio;

    if (finalImgHeight > maxImgHeight) {
      finalImgHeight = maxImgHeight;
      finalImgWidth = finalImgHeight * imgRatio;
    }

    const imgX = (pageWidth - finalImgWidth) / 2;
    const imgY = 40;

    doc.addImage(imageSrc, format, imgX, imgY, finalImgWidth, finalImgHeight);

    // Draw Highlight Boxes
    if (result.highlights) {
      result.highlights.forEach(h => {
        // h.box_2d is [ymin, xmin, ymax, xmax] in 0-1000 scale relative to image
        const y1 = imgY + (h.box_2d[0] / 1000) * finalImgHeight;
        const x1 = imgX + (h.box_2d[1] / 1000) * finalImgWidth;
        const hRect = (h.box_2d[2] - h.box_2d[0]) / 1000 * finalImgHeight;
        const wRect = (h.box_2d[3] - h.box_2d[1]) / 1000 * finalImgWidth;

        let strokeColor = colors.primary;
        if (h.type === 'critical') strokeColor = colors.red;
        if (h.type === 'medication') strokeColor = colors.orange;
        if (h.type === 'date') strokeColor = colors.yellow;
        if (h.type === 'normal') strokeColor = colors.green;

        doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
        doc.setLineWidth(1);
        doc.rect(x1, y1, wRect, hRect);
      });
    }

    // Legend
    const legendY = imgY + finalImgHeight + 15;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let currentLegendX = margin;
    const drawLegendItem = (label: string, color: number[]) => {
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(currentLegendX, legendY - 1, 1.5, 'F');
        doc.text(label, currentLegendX + 4, legendY);
        currentLegendX += doc.getTextWidth(label) + 15;
    };

    drawLegendItem("Warning", colors.red);
    drawLegendItem("Medication", colors.orange);
    drawLegendItem("Date", colors.yellow);
    drawLegendItem("Normal", colors.green);

  } catch (error) {
    console.error("PDF Image Error", error);
    doc.setFontSize(10);
    doc.setTextColor(colors.red[0], colors.red[1], colors.red[2]);
    doc.text("Error rendering image in PDF", margin, 40);
  }

  // ==========================
  // PAGE 2: FULL TRANSLATION
  // ==========================
  doc.addPage();
  addHeader(2);

  // Badge
  doc.setFillColor(240, 249, 255); // Light Blue
  doc.setDrawColor(0, 102, 245);
  doc.roundedRect(margin, 25, 60, 8, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text((result.documentType || 'DOCUMENT').toUpperCase(), margin + 4, 30);

  // Title
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(result.title || 'Medical Translation', margin, 45);

  // Body
  doc.setFontSize(11);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "normal");
  
  // Clean markdown for PDF
  const cleanText = (result.translatedContent || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\n\n/g, '\n');

  const splitText = doc.splitTextToSize(cleanText, pageWidth - (margin * 2));
  doc.text(splitText, margin, 60);

  // ==========================
  // PAGE 3: SUMMARY & SAFETY
  // ==========================
  doc.addPage();
  addHeader(3);

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Summary & Safety", margin, 30);

  let currentY = 45;

  // Emergency Box
  if (result.isEmergency) {
    doc.setFillColor(254, 226, 226); // Red 50
    doc.setDrawColor(239, 68, 68); // Red 500
    doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 25, 3, 3, 'FD');
    
    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EMERGENCY WARNING", margin + 5, currentY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const emergText = doc.splitTextToSize(result.emergencyMessage || "Critical info detected.", pageWidth - (margin * 2) - 10);
    doc.text(emergText, margin + 5, currentY + 16);
    
    currentY += 40;
  }

  // Simple Summary
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Simple Explanation:", margin, currentY);
  currentY += 8;

  doc.setFontSize(11);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "italic");
  const summaryText = doc.splitTextToSize(`"${result.summary}"`, pageWidth - (margin * 2));
  doc.text(summaryText, margin, currentY);
  
  currentY += (summaryText.length * 6) + 20;

  // Quiz / Verification
  if (result.quiz && result.quiz.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Verification Points:", margin, currentY);
    currentY += 10;

    result.quiz.forEach((q, i) => {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      const qText = doc.splitTextToSize(`Q: ${q.question}`, pageWidth - (margin * 2));
      doc.text(qText, margin, currentY);
      currentY += (qText.length * 5) + 2;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      const aText = doc.splitTextToSize(`A: ${q.answer ? "Yes" : "No"} - ${q.explanation}`, pageWidth - (margin * 2));
      doc.text(aText, margin, currentY);
      currentY += (aText.length * 5) + 8;
    });
  }

  return doc;
};

export const generatePDF = (result: AnalysisResult, imageSrc: string) => {
  try {
    const doc = createDoc(result, imageSrc);
    // Format filename safe
    const safeTitle = (result.title || 'document').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`MedSnap_${safeTitle}.pdf`);
  } catch (e) {
    console.error("PDF Download failed", e);
    alert("Could not generate PDF. Please try again.");
  }
};

export const generatePDFBlob = (result: AnalysisResult, imageSrc: string): Blob => {
  const doc = createDoc(result, imageSrc);
  return doc.output('blob');
};
