
import { jsPDF } from "jspdf";
import { AnalysisResult } from "../types";

// Helper to construct the PDF content
const createDoc = (result: AnalysisResult, imageSrc: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // --- Helper Configs ---
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

  // --- PAGE 1: Original Image & Highlights ---
  addHeader(1);
  
  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Original Document", margin, 30);

  // Add Image
  // We need to fit the image within margins
  const imgProps = doc.getImageProperties(imageSrc);
  const imgRatio = imgProps.width / imgProps.height;
  const maxImgWidth = pageWidth - (margin * 2);
  const maxImgHeight = pageHeight - 80; // space for header/legend
  
  let finalImgWidth = maxImgWidth;
  let finalImgHeight = finalImgWidth / imgRatio;

  if (finalImgHeight > maxImgHeight) {
    finalImgHeight = maxImgHeight;
    finalImgWidth = finalImgHeight * imgRatio;
  }

  const imgX = (pageWidth - finalImgWidth) / 2;
  const imgY = 40;

  doc.addImage(imageSrc, 'JPEG', imgX, imgY, finalImgWidth, finalImgHeight);

  // Draw Highlights
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
  const legendY = imgY + finalImgHeight + 10;
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


  // --- PAGE 2: Translation ---
  doc.addPage();
  addHeader(2);

  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Translated Content", margin, 30);
  
  // Document Type Badge
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, 40, 50, 8, 2, 2, 'FD');
  doc.setFontSize(10);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text((result.documentType || 'Document').toUpperCase(), margin + 5, 45);

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(result.title || 'Translation', margin, 60);

  // Content Body
  doc.setFontSize(12);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "normal");
  
  // Clean markdown basic tags for PDF text
  const cleanText = (result.translatedContent || '')
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\n\n/g, '\n');

  const splitText = doc.splitTextToSize(cleanText, pageWidth - (margin * 2));
  doc.text(splitText, margin, 75);


  // --- PAGE 3: Summary & Quiz ---
  doc.addPage();
  addHeader(3);

  doc.setFontSize(22);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont("helvetica", "bold");
  doc.text("Summary & Check", margin, 30);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Audio Summary Script", margin, 45);
  
  doc.setFontSize(12);
  doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
  doc.setFont("helvetica", "italic");
  const summaryText = doc.splitTextToSize(`"${result.summary}"`, pageWidth - (margin * 2));
  doc.text(summaryText, margin, 55);

  const summaryHeight = summaryText.length * 7;
  let quizY = 55 + summaryHeight + 20;

  // Emergency Banner if needed
  if (result.isEmergency) {
    doc.setFillColor(254, 226, 226); // Red 50
    doc.setDrawColor(239, 68, 68); // Red 500
    doc.roundedRect(margin, quizY, pageWidth - (margin * 2), 20, 3, 3, 'FD');
    
    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFont("helvetica", "bold");
    doc.text("EMERGENCY WARNING", margin + 5, quizY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(result.emergencyMessage || "Critical info detected.", margin + 5, quizY + 15);
    
    quizY += 30;
  }

  // Quiz
  if (result.quiz && result.quiz.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Understanding Check", margin, quizY);
    quizY += 10;

    result.quiz.forEach((q, i) => {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(`Q${i + 1}: ${q.question}`, margin, quizY);
      
      quizY += 7;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.text(`Answer: ${q.answer ? "Yes" : "No"} - ${q.explanation}`, margin + 5, quizY);
      
      quizY += 15;
    });
  }

  return doc;
};

export const generatePDF = (result: AnalysisResult, imageSrc: string) => {
  const doc = createDoc(result, imageSrc);
  doc.save(`MedSnap_Translation_${Date.now()}.pdf`);
};

export const generatePDFBlob = (result: AnalysisResult, imageSrc: string): Blob => {
  const doc = createDoc(result, imageSrc);
  return doc.output('blob');
};
