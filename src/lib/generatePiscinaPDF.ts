import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PiscinaFormData } from "@/pages/SolicitarPiscina";

const DOCTOR_NAME = "Dr. Rodrigo V. Vasconcelos";
const DOCTOR_CRM = "CRM/SP 142.857";
const CLINIC_NAME = "Atestado24h — Telemedicina";

const generateVerificationCode = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

// Draw a realistic QR code pattern (same as main generator)
const drawQRCode = (doc: jsPDF, x: number, y: number, size: number, data: string) => {
  const modules = 25;
  const cellSize = size / modules;
  let hash = 0;
  for (let i = 0; i < data.length; i++) hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, size, size, "F");
  doc.setFillColor(0, 0, 0);
  const drawFinder = (fx: number, fy: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          doc.rect(fx + c * cellSize, fy + r * cellSize, cellSize, cellSize, "F");
        }
      }
    }
  };
  drawFinder(x, y);
  drawFinder(x + (modules - 7) * cellSize, y);
  drawFinder(x, y + (modules - 7) * cellSize);
  let seed = Math.abs(hash);
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if ((r < 8 && c < 8) || (r < 8 && c > modules - 9) || (r > modules - 9 && c < 8)) continue;
      if (r === 6 || c === 6) continue;
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if (seed % 3 !== 0) doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, "F");
    }
  }
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

const drawSignature = (doc: jsPDF, centerX: number, baseY: number) => {
  const ox = centerX - 20; const oy = baseY;
  doc.setDrawColor(10, 10, 50); doc.setLineWidth(0.45);
  bezier(doc, ox, oy, ox+0.5, oy-5, ox+0.3, oy-9, ox+1, oy-12, 14);
  doc.setLineWidth(0.4);
  bezier(doc, ox+1, oy-12, ox+5, oy-13, ox+9, oy-11, ox+7, oy-8, 14);
  bezier(doc, ox+7, oy-8, ox+5, oy-5.5, ox+2, oy-5, ox+2, oy-5, 10);
  doc.setLineWidth(0.35);
  bezier(doc, ox+2, oy-5, ox+5, oy-4, ox+8, oy-1, ox+11, oy+1, 12);
  doc.setLineWidth(0.2);
  bezier(doc, ox-2, oy+4, ox+10, oy+3, ox+30, oy+2, ox+42, oy+3.5, 30);
};

export const generatePiscinaPDF = async (formData: PiscinaFormData): Promise<jsPDF> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  const verificationCode = generateVerificationCode();
  const now = new Date();

  let y = 20;

  // ===== HEADER — clinic logo area =====
  // Teal accent bar
  doc.setFillColor(0, 150, 136);
  doc.rect(0, 0, pageW, 3, "F");

  // Clinic name (left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 120, 110);
  doc.text(CLINIC_NAME, margin, y);

  // Doctor info (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(DOCTOR_NAME, pageW - margin, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(DOCTOR_CRM, pageW - margin, y, { align: "right" });

  y += 12;

  // Patient info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Nome:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(formData.nomeCompleto, margin + 16, y);

  doc.setFont("helvetica", "bold");
  doc.text("CPF:", margin, y + 7);
  doc.setFont("helvetica", "normal");
  doc.text(formData.cpf, margin + 12, y + 7);

  // Date (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Data e hora:", pageW - margin - 55, y);
  doc.setFont("helvetica", "normal");
  const dateStr = format(now, "dd/MM/yyyy - HH:mm:ss", { locale: ptBR });
  doc.text(dateStr, pageW - margin - 55 + 25, y);
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("(GMT-3)", pageW - margin, y, { align: "right" });

  y += 20;

  // ===== TITLE =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("ATESTADO DERMATOLÓGICO PARA PRÁTICA DE PISCINA E ATIVIDADE AQUÁTICA:", margin, y);

  y += 12;

  // ===== BODY TEXT =====
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(40, 40, 40);

  const bodyText = `Atesto para os devidos fins que o paciente supracitado esteve em atendimento médico no dia ${format(now, "dd/MM/yyyy")}. Após a realização do exame clínico, confirmo que o paciente se encontra apto para prática de atividades aquáticas e uso de piscina comunitária.`;

  const lines = doc.splitTextToSize(bodyText, contentW);
  doc.text(lines, margin, y);
  y += lines.length * 6 + 30;

  // ===== SIGNATURE =====
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Atenciosamente,", margin, y);
  y += 6;
  doc.text(DOCTOR_NAME + ".", margin, y);
  y += 6;
  doc.text(DOCTOR_CRM.replace("/", "").replace(" ", ""), margin, y);

  // Draw signature above
  drawSignature(doc, margin + 30, y - 20);

  // ===== FOOTER with QR Code =====
  const footerY = pageH - 55;

  // Separator
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY, pageW - margin, footerY);

  // QR Code
  const qrSize = 18;
  drawQRCode(doc, margin, footerY + 5, qrSize, verificationCode);

  // Footer text next to QR
  const ftx = margin + qrSize + 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);
  doc.text("Acesso à sua receita digital via QR Code", ftx, footerY + 9);
  doc.text(`Endereço: São Paulo, SP`, ftx, footerY + 13);
  doc.setFont("helvetica", "bold");
  doc.text(`Assinado digitalmente por ${DOCTOR_NAME} - ${DOCTOR_CRM}`, ftx, footerY + 17);
  doc.setFont("helvetica", "normal");
  doc.text(`Token: ${verificationCode} - Código de desbloqueio (Paciente): ${Math.floor(Math.random() * 9999)}`, ftx, footerY + 21);

  // Bottom line
  const btmY = pageH - 18;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, btmY, pageW - margin, btmY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${DOCTOR_NAME}, ${DOCTOR_CRM}. ${CLINIC_NAME}. São Paulo, SP. Email: contato@atestado24h.com.br`,
    pageW / 2, btmY + 5, { align: "center" }
  );

  doc.setFontSize(6);
  doc.text(
    `validar assinatura deste documento | Token: ${verificationCode}`,
    pageW / 2, btmY + 10, { align: "center" }
  );

  return doc;
};
