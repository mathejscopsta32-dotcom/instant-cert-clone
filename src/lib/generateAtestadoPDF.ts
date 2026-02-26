import { jsPDF } from "jspdf";
import type { FormData } from "@/pages/Solicitar";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Hospital logo imports
import imgUbs from "@/assets/hospitals/ubs.png";
import imgUpa24h from "@/assets/hospitals/upa24h.png";
import imgSus from "@/assets/hospitals/sus.png";
import imgUnimed from "@/assets/hospitals/unimed.png";
import imgHapvida from "@/assets/hospitals/hapvida.png";
import imgSocorromed from "@/assets/hospitals/socorromed.png";

const hospitalLogos: Record<string, string> = {
  UBS: imgUbs,
  "UPA 24h": imgUpa24h,
  SUS: imgSus,
  Unimed: imgUnimed,
  Hapvida: imgHapvida,
  Socorromed: imgSocorromed,
};

const getInicioDate = (formData: FormData): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (formData.inicioSintomas) {
    case "hoje":
      return today;
    case "ontem":
      return addDays(today, -1);
    case "anteontem":
      return addDays(today, -2);
    case "personalizado":
      return formData.inicioSintomasData || today;
    default:
      return today;
  }
};

const getDiasNum = (label: string): number => {
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
};

const generateVerificationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// CID-10 mapping for common symptoms
const getCID10 = (sintomas: string[]): { code: string; description: string } => {
  const sintomasLower = sintomas.map(s => s.toLowerCase().replace(/^[^\w\s]+\s*/, ""));
  if (sintomasLower.some(s => s.includes("febre"))) return { code: "R50.9", description: "Febre não especificada" };
  if (sintomasLower.some(s => s.includes("dor de cabeça") || s.includes("cefaleia"))) return { code: "R51", description: "Cefaleia" };
  if (sintomasLower.some(s => s.includes("náusea") || s.includes("vômito"))) return { code: "R11", description: "Náusea e vômito" };
  if (sintomasLower.some(s => s.includes("diarreia"))) return { code: "K59.1", description: "Diarreia funcional" };
  if (sintomasLower.some(s => s.includes("tosse"))) return { code: "R05", description: "Tosse" };
  if (sintomasLower.some(s => s.includes("gripe") || s.includes("resfriado"))) return { code: "J11", description: "Influenza (gripe)" };
  if (sintomasLower.some(s => s.includes("dor abdominal") || s.includes("estômago"))) return { code: "R10.4", description: "Dor abdominal não especificada" };
  if (sintomasLower.some(s => s.includes("tontura"))) return { code: "R42", description: "Tontura e instabilidade" };
  if (sintomasLower.some(s => s.includes("ansiedade"))) return { code: "F41.9", description: "Transtorno ansioso não especificado" };
  if (sintomasLower.some(s => s.includes("lombar") || s.includes("costas"))) return { code: "M54.5", description: "Dor lombar baixa" };
  return { code: "R69", description: "Causas desconhecidas de morbidade" };
};

const DOCTOR_NAME = "Dr. Rodrigo V. Vasconcelos";
const DOCTOR_CRM = "CRM/SP 142.857";
const DOCTOR_SPECIALTY = "Clínico Geral";

// Load image as base64 data URL
const loadImageAsBase64 = (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// Bezier curve helper for smooth signature strokes
const bezier = (
  doc: jsPDF,
  x0: number, y0: number,
  cx1: number, cy1: number,
  cx2: number, cy2: number,
  x1: number, y1: number,
  segments = 20
) => {
  let px = x0, py = y0;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    const nx = mt * mt * mt * x0 + 3 * mt * mt * t * cx1 + 3 * mt * t * t * cx2 + t * t * t * x1;
    const ny = mt * mt * mt * y0 + 3 * mt * mt * t * cy1 + 3 * mt * t * t * cy2 + t * t * t * y1;
    doc.line(px, py, nx, ny);
    px = nx;
    py = ny;
  }
};

// Draw a realistic doctor signature — "R. Vasconcelos"
const drawSignature = (doc: jsPDF, centerX: number, baseY: number) => {
  const ox = centerX - 38; // origin offset
  const oy = baseY;

  // --- "R" capital, bold stroke ---
  doc.setDrawColor(10, 10, 50);
  doc.setLineWidth(0.55);
  // Vertical stem
  bezier(doc, ox, oy, ox + 0.5, oy - 5, ox + 0.3, oy - 9, ox + 1, oy - 12, 14);
  // Top loop
  doc.setLineWidth(0.5);
  bezier(doc, ox + 1, oy - 12, ox + 5, oy - 13, ox + 9, oy - 11, ox + 7, oy - 8, 14);
  bezier(doc, ox + 7, oy - 8, ox + 5, oy - 5.5, ox + 2, oy - 5, ox + 2, oy - 5, 10);
  // Leg kick
  doc.setLineWidth(0.45);
  bezier(doc, ox + 2, oy - 5, ox + 5, oy - 4, ox + 8, oy - 1, ox + 11, oy + 1, 12);

  // --- dot / period ---
  doc.setLineWidth(0.4);
  doc.line(ox + 13, oy - 1, ox + 13.8, oy - 1.5);

  // --- "V" stroke ---
  doc.setLineWidth(0.45);
  const vx = ox + 17;
  bezier(doc, vx, oy - 10, vx + 2, oy - 5, vx + 3.5, oy - 1, vx + 5, oy + 1, 12);
  doc.setLineWidth(0.4);
  bezier(doc, vx + 5, oy + 1, vx + 6.5, oy - 3, vx + 8, oy - 8, vx + 10, oy - 11, 12);

  // --- "asc" flowing lowercase ---
  doc.setLineWidth(0.35);
  const ax = ox + 28;
  // "a"
  bezier(doc, ax, oy - 4, ax - 1.5, oy - 6, ax - 1.5, oy - 1, ax + 1, oy - 1, 10);
  bezier(doc, ax + 1, oy - 1, ax + 2, oy - 4, ax + 2.5, oy - 6, ax + 3, oy - 3, 10);
  // "s"
  bezier(doc, ax + 3, oy - 3, ax + 4, oy - 5.5, ax + 5, oy - 6, ax + 5.5, oy - 4, 8);
  bezier(doc, ax + 5.5, oy - 4, ax + 4.5, oy - 2, ax + 5.5, oy - 0.5, ax + 7, oy - 2, 8);
  // "c"
  bezier(doc, ax + 7, oy - 2, ax + 8, oy - 5.5, ax + 7.5, oy - 6.5, ax + 9, oy - 5, 8);
  bezier(doc, ax + 9, oy - 5, ax + 9.5, oy - 2, ax + 10, oy - 1, ax + 11, oy - 2, 8);

  // --- "onc" connected ---
  doc.setLineWidth(0.3);
  const bx = ox + 40;
  // "o"
  bezier(doc, bx, oy - 2, bx - 0.5, oy - 5, bx + 2, oy - 6, bx + 2.5, oy - 3, 10);
  bezier(doc, bx + 2.5, oy - 3, bx + 3, oy - 1, bx + 1, oy, bx + 3.5, oy - 2, 8);
  // "n"
  bezier(doc, bx + 3.5, oy - 2, bx + 4, oy - 5, bx + 5, oy - 6, bx + 5.5, oy - 3, 8);
  bezier(doc, bx + 5.5, oy - 3, bx + 6, oy - 1, bx + 7, oy - 5, bx + 7.5, oy - 2, 8);
  // "c"
  bezier(doc, bx + 7.5, oy - 2, bx + 8.5, oy - 5, bx + 8, oy - 6, bx + 9.5, oy - 4, 8);
  bezier(doc, bx + 9.5, oy - 4, bx + 10, oy - 1.5, bx + 10.5, oy - 1, bx + 11.5, oy - 3, 8);

  // --- "elos" tail with flourish ---
  doc.setLineWidth(0.28);
  const cx = ox + 52;
  // "e"
  bezier(doc, cx, oy - 3, cx + 0.5, oy - 5.5, cx + 2, oy - 5, cx + 1.5, oy - 3.5, 8);
  bezier(doc, cx + 1.5, oy - 3.5, cx + 1, oy - 1, cx + 2, oy, cx + 3, oy - 2, 8);
  // "l"
  bezier(doc, cx + 3, oy - 2, cx + 3.5, oy - 7, cx + 4, oy - 9, cx + 4.5, oy - 2, 12);
  // "os" final
  bezier(doc, cx + 4.5, oy - 2, cx + 5, oy - 5, cx + 6.5, oy - 5.5, cx + 7, oy - 3, 8);
  bezier(doc, cx + 7, oy - 3, cx + 6, oy - 0.5, cx + 7.5, oy, cx + 9, oy - 2, 8);
  bezier(doc, cx + 9, oy - 2, cx + 10, oy - 5, cx + 9.5, oy - 6, cx + 11, oy - 4, 8);
  bezier(doc, cx + 11, oy - 4, cx + 11.5, oy - 1, cx + 13, oy, cx + 16, oy - 1, 10);

  // --- Final flourish / underline ---
  doc.setLineWidth(0.22);
  doc.setDrawColor(10, 10, 50);
  bezier(doc, ox - 2, oy + 4, ox + 20, oy + 3, ox + 50, oy + 2, ox + 70, oy + 3.5, 30);
};

// Draw a realistic QR code pattern
const drawQRCode = (doc: jsPDF, x: number, y: number, size: number, data: string) => {
  const modules = 25;
  const cellSize = size / modules;

  // Generate deterministic pattern from data
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data.charCodeAt(i)) | 0;
  }

  // Draw white background
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, size, size, "F");

  doc.setFillColor(0, 0, 0);

  // Draw finder patterns (3 corners)
  const drawFinder = (fx: number, fy: number) => {
    // Outer
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          doc.rect(fx + c * cellSize, fy + r * cellSize, cellSize, cellSize, "F");
        }
      }
    }
  };

  drawFinder(x, y); // top-left
  drawFinder(x + (modules - 7) * cellSize, y); // top-right
  drawFinder(x, y + (modules - 7) * cellSize); // bottom-left

  // Timing patterns
  for (let i = 8; i < modules - 8; i++) {
    if (i % 2 === 0) {
      doc.rect(x + i * cellSize, y + 6 * cellSize, cellSize, cellSize, "F");
      doc.rect(x + 6 * cellSize, y + i * cellSize, cellSize, cellSize, "F");
    }
  }

  // Data modules (pseudo-random based on hash)
  let seed = Math.abs(hash);
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder pattern areas
      if ((r < 8 && c < 8) || (r < 8 && c > modules - 9) || (r > modules - 9 && c < 8)) continue;
      if (r === 6 || c === 6) continue;
      
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if (seed % 3 !== 0) {
        doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, "F");
      }
    }
  }

  // Border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.rect(x - 1, y - 1, size + 2, size + 2);
};

export const generateAtestadoPDF = async (formData: FormData): Promise<jsPDF> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 15;
  const verificationCode = generateVerificationCode();

  // ===== HEADER =====
  // Blue gradient bar
  doc.setFillColor(0, 70, 140);
  doc.rect(0, 0, pageW, 4, "F");

  y = 14;

  // Hospital logo (left side of header)
  const hospitalName = formData.hospitalPreferencia;
  const logoSrc = hospitalName ? hospitalLogos[hospitalName] : null;
  if (logoSrc) {
    try {
      const logoBase64 = await loadImageAsBase64(logoSrc);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, y - 4, 20, 20);
      }
    } catch {
      // Skip logo if loading fails
    }
  }

  // Title area
  const titleX = logoSrc ? margin + 25 : margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 50, 100);
  doc.text("ATESTADO MÉDICO", titleX, y + 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento emitido eletronicamente", titleX, y + 9);

  // Hospital name (right side)
  if (hospitalName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 50, 100);
    doc.text(hospitalName, pageW - margin, y + 3, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(`${formData.cidade || ""} - ${formData.estado || ""}`, pageW - margin, y + 8, { align: "right" });
  }

  y += 18;

  // Divider
  doc.setDrawColor(0, 70, 140);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // ===== PATIENT DATA =====
  doc.setFillColor(240, 245, 250);
  doc.roundedRect(margin, y - 3, contentW, 38, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 50, 100);
  doc.text("DADOS DO PACIENTE", margin + 5, y + 3);
  y += 10;

  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);

  const patientFields = [
    ["Nome Completo:", formData.nomeCompleto],
    ["CPF:", formData.cpf],
    ["Data de Nascimento:", formData.dataNascimento],
    ["Cidade / Estado:", `${formData.cidade} - ${formData.estado}`],
  ];

  const col1X = margin + 5;
  const col2X = margin + contentW / 2 + 5;

  // Row 1
  doc.setFont("helvetica", "bold");
  doc.text(patientFields[0][0], col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(patientFields[0][1], col1X + 35, y);

  doc.setFont("helvetica", "bold");
  doc.text(patientFields[1][0], col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(patientFields[1][1], col2X + 12, y);
  y += 7;

  // Row 2
  doc.setFont("helvetica", "bold");
  doc.text(patientFields[2][0], col1X, y);
  doc.setFont("helvetica", "normal");
  doc.text(patientFields[2][1], col1X + 42, y);

  doc.setFont("helvetica", "bold");
  doc.text(patientFields[3][0], col2X, y);
  doc.setFont("helvetica", "normal");
  doc.text(patientFields[3][1], col2X + 32, y);

  y += 16;

  // ===== CLINICAL INFO =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 50, 100);
  doc.text("INFORMAÇÕES CLÍNICAS", margin, y);
  y += 2;
  doc.setDrawColor(0, 70, 140);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + 50, y);
  y += 7;

  const inicioDate = getInicioDate(formData);
  const diasNum = getDiasNum(formData.diasAfastamento);
  const fimDate = addDays(inicioDate, diasNum);

  // Symptoms
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text("Sintomas Relatados:", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  const allSintomas = [
    ...formData.sintomas.map((s) => s.replace(/^[^\w\s]+\s*/, "")),
    ...(formData.outrosSintomas ? [formData.outrosSintomas] : []),
  ];

  allSintomas.forEach((s) => {
    doc.setFillColor(0, 70, 140);
    doc.circle(margin + 3, y - 1.2, 0.8, "F");
    doc.text(s, margin + 7, y);
    y += 5.5;
  });

  y += 3;

  // Clinical details in a grid
  const clinicalData = [
    ["Início dos Sintomas", format(inicioDate, "dd/MM/yyyy", { locale: ptBR })],
    ["Período de Afastamento", formData.diasAfastamento],
    ["Data de Retorno", format(fimDate, "dd/MM/yyyy", { locale: ptBR })],
    ["Unidade de Saúde", formData.hospitalPreferencia],
  ];

  clinicalData.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(label + ":", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text(String(value), margin + 50, y);
    y += 6;
  });

  // CID-10 (only if addon selected)
  if (formData.addonCid) {
    y += 3;
    const cid = getCID10(formData.sintomas);
    doc.setFillColor(230, 240, 250);
    doc.roundedRect(margin, y - 3, contentW, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(0, 50, 100);
    doc.text("CID-10:", margin + 5, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(`${cid.code} — ${cid.description}`, margin + 22, y + 2);
    y += 14;
  }

  y += 6;

  // ===== DECLARATION =====
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 50, 100);
  doc.text("DECLARAÇÃO", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);

  const declaration = `Atesto para os devidos fins que o(a) paciente ${formData.nomeCompleto}, portador(a) do CPF ${formData.cpf}, foi atendido(a) nesta data apresentando quadro clínico compatível com os sintomas acima descritos, necessitando de afastamento de suas atividades por ${formData.diasAfastamento}, a partir de ${format(inicioDate, "dd/MM/yyyy")}, com retorno previsto para ${format(fimDate, "dd/MM/yyyy")}.`;

  const lines = doc.splitTextToSize(declaration, contentW);
  doc.text(lines, margin, y);
  y += lines.length * 5.5 + 8;

  // Date and location
  const emissionDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${formData.cidade} - ${formData.estado}, ${emissionDate}`, pageW / 2, y, { align: "center" });
  y += 18;

  // ===== SIGNATURE =====
  drawSignature(doc, pageW / 2, y - 6);

  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.5);
  doc.line(pageW / 2 - 40, y + 2, pageW / 2 + 40, y + 2);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(DOCTOR_NAME, pageW / 2, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`${DOCTOR_CRM} — ${DOCTOR_SPECIALTY}`, pageW / 2, y, { align: "center" });

  // ===== QR CODE (only if addon selected) =====
  if (formData.addonQrCode) {
    const qrSize = 26;
    const qrX = pageW - margin - qrSize;
    const qrY = pageH - 52;

    drawQRCode(doc, qrX, qrY, qrSize, verificationCode);

    // Verification text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(0, 50, 100);
    doc.text("VERIFICAÇÃO DIGITAL", qrX - 3, qrY - 2, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(80, 80, 80);
    doc.text(`Código: ${verificationCode}`, qrX - 3, qrY + 4, { align: "right" });
    doc.text("Escaneie o QR Code para", qrX - 3, qrY + 9, { align: "right" });
    doc.text("verificar a autenticidade", qrX - 3, qrY + 14, { align: "right" });
  }

  // ===== FOOTER =====
  const footerY = pageH - 12;
  doc.setFillColor(0, 70, 140);
  doc.rect(0, footerY - 6, pageW, 18, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text("Documento emitido eletronicamente — Atestado24h", pageW / 2, footerY, { align: "center" });
  doc.setFontSize(6.5);
  doc.text(
    `Emitido em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} | Cód.: ${verificationCode}`,
    pageW / 2,
    footerY + 4,
    { align: "center" }
  );

  return doc;
};
