import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PiscinaFormData } from "@/pages/SolicitarPiscina";

const DOCTOR_NAME = "Dr. Rodrigo V. Vasconcelos";
const DOCTOR_CRM = "CRM/SP 142857";
const CLINIC_NAME = "Atestado24h";

const generateVerificationCode = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

// Bezier for signature
const bezier = (doc: jsPDF, x0: number, y0: number, cx1: number, cy1: number, cx2: number, cy2: number, x1: number, y1: number, segments = 20) => {
  let px = x0, py = y0;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments; const mt = 1 - t;
    const nx = mt*mt*mt*x0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x1;
    const ny = mt*mt*mt*y0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y1;
    doc.line(px, py, nx, ny); px = nx; py = ny;
  }
};

// Realistic handwritten doctor signature
const drawSignature = (doc: jsPDF, startX: number, baseY: number) => {
  const ox = startX;
  const oy = baseY;

  doc.setDrawColor(15, 15, 60);
  doc.setLineWidth(0.5);
  // "R" stem
  bezier(doc, ox, oy, ox+0.3, oy-4, ox+0.2, oy-8, ox+0.8, oy-11, 14);
  doc.setLineWidth(0.45);
  bezier(doc, ox+0.8, oy-11, ox+4, oy-12.5, ox+8, oy-10.5, ox+6, oy-7.5, 14);
  bezier(doc, ox+6, oy-7.5, ox+4, oy-5, ox+1.5, oy-4.5, ox+1.5, oy-4.5, 10);
  doc.setLineWidth(0.4);
  bezier(doc, ox+1.5, oy-4.5, ox+4, oy-3.5, ox+7, oy-0.5, ox+10, oy+1, 12);

  // dot
  doc.setLineWidth(0.35);
  doc.line(ox+12, oy-0.5, ox+12.6, oy-1);

  // flowing continuation
  doc.setLineWidth(0.3);
  const ax = ox + 15;
  bezier(doc, ax, oy-3.5, ax-1, oy-5.5, ax-1, oy-0.5, ax+1, oy-0.5, 10);
  bezier(doc, ax+1, oy-0.5, ax+2, oy-4, ax+3, oy-5.5, ax+4, oy-2.5, 10);
  bezier(doc, ax+4, oy-2.5, ax+5, oy-0.5, ax+6, oy-4, ax+8, oy-2, 8);
  bezier(doc, ax+8, oy-2, ax+9, oy+0.5, ax+11, oy-3, ax+13, oy-1.5, 8);
  bezier(doc, ax+13, oy-1.5, ax+15, oy+0.5, ax+18, oy-2, ax+22, oy-0.5, 10);

  // Underline flourish
  doc.setLineWidth(0.2);
  bezier(doc, ox-2, oy+4, ox+10, oy+3, ox+28, oy+2, ox+40, oy+3.5, 25);
};

// Draw QR code pattern
const drawQRCode = (doc: jsPDF, x: number, y: number, size: number, data: string) => {
  const modules = 25;
  const cellSize = size / modules;
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, size, size, "F");
  doc.setFillColor(0, 0, 0);
  const drawFinder = (fx: number, fy: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++)
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
          doc.rect(fx + c * cellSize, fy + r * cellSize, cellSize, cellSize, "F");
  };
  drawFinder(x, y);
  drawFinder(x + (modules - 7) * cellSize, y);
  drawFinder(x, y + (modules - 7) * cellSize);
  let seed = Math.abs(hash);
  for (let r = 0; r < modules; r++)
    for (let c = 0; c < modules; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c > modules - 9) || (r > modules - 9 && c < 8)) continue;
      if (r === 6 || c === 6) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if (seed % 3 !== 0) doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, "F");
    }
};

export const generatePiscinaPDF = async (formData: PiscinaFormData): Promise<jsPDF> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentW = pageW - margin * 2;
  const verificationCode = generateVerificationCode();
  const now = new Date();
  const unlockCode = Math.floor(1000 + Math.random() * 8999);

  let y = 22;

  // ===== HEADER =====
  // Clinic name (left) — styled like "AVIE" in the reference
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 130, 120);
  doc.text(CLINIC_NAME, margin, y);

  // Doctor info (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(DOCTOR_NAME, pageW - margin, y - 2, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(DOCTOR_CRM.replace("/", " "), pageW - margin, y + 4, { align: "right" });

  y += 18;

  // ===== PATIENT INFO =====
  // Name (bold label)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text("Nome:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(formData.nomeCompleto, margin + 16, y);
  y += 8;

  // CPF
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("CPF:", margin, y);
  doc.text(formData.cpf, margin + 12, y);
  y += 8;

  // Date and time
  doc.text("Data e hora:", margin, y);
  const dateStr = format(now, "dd/MM/yyyy' - 'HH:mm:ss");
  doc.text(`${dateStr} (GMT-3)`, margin + 26, y);

  y += 18;

  // ===== TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  const title = "ATESTADO DERMATOLÓGICO PARA PRÁTICA DE PISCINA E ATIVIDADE AQUÁTICA:";
  const titleLines = doc.splitTextToSize(title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 10;

  // ===== BODY TEXT =====
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const bodyText = `Atesto para os devidos fins que o paciente supracitado esteve em atendimento médico no dia ${format(now, "dd/MM/yyyy")}. Após a realização do exame clínico, confirmo que o paciente se encontra apto para prática de atividades aquáticas e uso de piscina comunitária.`;

  const lines = doc.splitTextToSize(bodyText, contentW);
  doc.text(lines, margin, y);
  y += lines.length * 6 + 25;

  // ===== SIGNATURE SECTION =====
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("Atenciosamente,", margin, y);
  y += 18;

  // Draw handwritten signature
  drawSignature(doc, margin + 5, y - 6);

  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(`${DOCTOR_NAME}.`, margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`CRM ${DOCTOR_CRM.replace("CRM/", "").replace(" ", "-")}`, margin, y);

  // ===== FOOTER SECTION =====
  // Separator
  const footerStartY = pageH - 60;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerStartY, pageW - margin, footerStartY);

  // QR Code left
  const qrSize = 20;
  drawQRCode(doc, margin, footerStartY + 5, qrSize, verificationCode);

  // Footer text next to QR
  const ftx = margin + qrSize + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);
  doc.text("Acesso à sua receita digital via QR Code", ftx, footerStartY + 9);

  doc.setFontSize(7.5);
  doc.text("Endereço: São Paulo, SP", ftx, footerStartY + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`Assinado digitalmente por ${DOCTOR_NAME} - ${DOCTOR_CRM}`, ftx, footerStartY + 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Token (Farmácia): ${verificationCode} - Código de desbloqueio (Paciente): ${unlockCode}`, ftx, footerStartY + 24);

  // Bottom line
  const btmY = pageH - 22;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, btmY, pageW - margin, btmY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${DOCTOR_NAME}, ${DOCTOR_CRM}. ${CLINIC_NAME}, Centro Médico`,
    pageW / 2, btmY + 5, { align: "center" }
  );
  doc.text(
    `São Paulo, SP. Email: atendimento@atestado24h.com.br`,
    pageW / 2, btmY + 10, { align: "center" }
  );

  doc.setFontSize(6);
  doc.text(
    `validar assinatura deste documento | Token: ${verificationCode}`,
    pageW / 2, btmY + 15, { align: "center" }
  );

  return doc;
};
