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

// Hospitals that use the "UPA style" (simple layout with SUS logo alongside)
const upaStyleHospitals = ["UPA 24h", "UBS", "SUS", "Socorromed"];

// CID-10 mapping
const getCID10 = (sintomas: string[]): { code: string; description: string } => {
  const s = sintomas.map(x => x.toLowerCase().replace(/^[^\w\s]+\s*/, ""));
  if (s.some(x => x.includes("febre"))) return { code: "R50.9", description: "Febre não especificada" };
  if (s.some(x => x.includes("dor de cabeça") || x.includes("cefaleia"))) return { code: "R51", description: "Cefaleia" };
  if (s.some(x => x.includes("náusea") || x.includes("vômito"))) return { code: "R11", description: "Náusea e vômito" };
  if (s.some(x => x.includes("diarreia"))) return { code: "K59.1", description: "Diarreia funcional" };
  if (s.some(x => x.includes("tosse"))) return { code: "R05", description: "Tosse" };
  if (s.some(x => x.includes("gripe") || x.includes("resfriado"))) return { code: "J11", description: "Influenza (gripe)" };
  if (s.some(x => x.includes("dor abdominal") || x.includes("estômago"))) return { code: "R10.4", description: "Dor abdominal" };
  if (s.some(x => x.includes("tontura"))) return { code: "R42", description: "Tontura e instabilidade" };
  if (s.some(x => x.includes("ansiedade"))) return { code: "F41.9", description: "Transtorno ansioso" };
  if (s.some(x => x.includes("lombar") || x.includes("costas"))) return { code: "M54.5", description: "Dor lombar baixa" };
  if (s.some(x => x.includes("dengue"))) return { code: "A90", description: "Dengue" };
  return { code: "R69", description: "Causas desconhecidas de morbidade" };
};

// Doctor database with CRM info
const doctorDatabase: Record<string, { fullName: string; crm: string }> = {
  "Dr. Rodrigo V.": { fullName: "Dr. Rodrigo V. Vasconcelos", crm: "CRM/SP 158.743" },
  "Dra. Ana Beatriz": { fullName: "Dra. Ana Beatriz de Souza", crm: "CRM/RJ 198.432" },
  "Dr. Roberto Mendes": { fullName: "Dr. Roberto Mendes Silva", crm: "CRM/MG 165.291" },
  "Dra. Juliana Costa": { fullName: "Dra. Juliana Costa Ferreira", crm: "CRM/SP 201.845" },
};

const DEFAULT_DOCTOR_NAME = "Dr. Rodrigo V. Vasconcelos";
const DEFAULT_DOCTOR_CRM = "CRM/SP 158.743";

const getDoctorInfo = (medicoSelecionado?: string) => {
  if (medicoSelecionado && doctorDatabase[medicoSelecionado]) {
    return doctorDatabase[medicoSelecionado];
  }
  return { fullName: DEFAULT_DOCTOR_NAME, crm: DEFAULT_DOCTOR_CRM };
};

const getInicioDate = (formData: FormData): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (formData.inicioSintomas) {
    case "hoje": return today;
    case "ontem": return addDays(today, -1);
    case "anteontem": return addDays(today, -2);
    case "personalizado": return formData.inicioSintomasData || today;
    default: return today;
  }
};

const getDiasNum = (label: string): number => {
  const match = label.match(/(\d+)/);
  return match ? parseInt(match[1]) : 1;
};

const loadImageAsBase64 = (src: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png")); }
      else resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// Bezier curve helper
const bezier = (
  doc: jsPDF, x0: number, y0: number,
  cx1: number, cy1: number, cx2: number, cy2: number,
  x1: number, y1: number, segments = 20
) => {
  let px = x0, py = y0;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const mt = 1 - t;
    const nx = mt*mt*mt*x0 + 3*mt*mt*t*cx1 + 3*mt*t*t*cx2 + t*t*t*x1;
    const ny = mt*mt*mt*y0 + 3*mt*mt*t*cy1 + 3*mt*t*t*cy2 + t*t*t*y1;
    doc.line(px, py, nx, ny);
    px = nx; py = ny;
  }
};

// Realistic handwritten doctor signature — "R. Vasconcelos"
const drawSignature = (doc: jsPDF, centerX: number, baseY: number) => {
  const ox = centerX - 30;
  const oy = baseY;

  doc.setDrawColor(15, 15, 60);
  doc.setLineWidth(0.5);
  // "R" stem
  bezier(doc, ox, oy, ox+0.3, oy-4, ox+0.2, oy-8, ox+0.8, oy-11, 14);
  // "R" top loop
  doc.setLineWidth(0.45);
  bezier(doc, ox+0.8, oy-11, ox+4, oy-12.5, ox+8, oy-10.5, ox+6, oy-7.5, 14);
  bezier(doc, ox+6, oy-7.5, ox+4, oy-5, ox+1.5, oy-4.5, ox+1.5, oy-4.5, 10);
  // "R" leg
  doc.setLineWidth(0.4);
  bezier(doc, ox+1.5, oy-4.5, ox+4, oy-3.5, ox+7, oy-0.5, ox+10, oy+1, 12);

  // dot
  doc.setLineWidth(0.35);
  doc.line(ox+12, oy-0.5, ox+12.6, oy-1);

  // "V"
  doc.setLineWidth(0.4);
  const vx = ox + 15;
  bezier(doc, vx, oy-9, vx+1.5, oy-4, vx+3, oy, vx+4.5, oy+1, 12);
  doc.setLineWidth(0.35);
  bezier(doc, vx+4.5, oy+1, vx+5.5, oy-2.5, vx+7, oy-7, vx+9, oy-10, 12);

  // "asc" flowing
  doc.setLineWidth(0.3);
  const ax = ox + 25;
  bezier(doc, ax, oy-3.5, ax-1.2, oy-5.5, ax-1.2, oy-0.5, ax+1, oy-0.5, 10);
  bezier(doc, ax+1, oy-0.5, ax+1.8, oy-3.5, ax+2.2, oy-5.5, ax+2.8, oy-2.5, 10);
  bezier(doc, ax+2.8, oy-2.5, ax+3.5, oy-5, ax+4.5, oy-5.5, ax+5, oy-3.5, 8);
  bezier(doc, ax+5, oy-3.5, ax+4, oy-1.5, ax+5, oy, ax+6.5, oy-1.5, 8);
  bezier(doc, ax+6.5, oy-1.5, ax+7.5, oy-5, ax+7, oy-6, ax+8.5, oy-4.5, 8);

  // "onc"
  doc.setLineWidth(0.28);
  const bx = ox + 34;
  bezier(doc, bx, oy-1.5, bx-0.5, oy-4.5, bx+1.8, oy-5.5, bx+2.2, oy-2.5, 10);
  bezier(doc, bx+2.2, oy-2.5, bx+2.8, oy-0.5, bx+0.8, oy+0.5, bx+3.2, oy-1.5, 8);
  bezier(doc, bx+3.2, oy-1.5, bx+3.8, oy-4.5, bx+4.8, oy-5.5, bx+5.2, oy-2.5, 8);
  bezier(doc, bx+5.2, oy-2.5, bx+5.8, oy-0.5, bx+6.8, oy-4.5, bx+7.2, oy-1.5, 8);
  bezier(doc, bx+7.2, oy-1.5, bx+8, oy-4.5, bx+7.5, oy-5.5, bx+9, oy-3.5, 8);

  // "elos" tail
  doc.setLineWidth(0.25);
  const cx = ox + 44;
  bezier(doc, cx, oy-2.5, cx+0.5, oy-5, cx+1.8, oy-4.5, cx+1.3, oy-3, 8);
  bezier(doc, cx+1.3, oy-3, cx+0.8, oy-0.5, cx+1.8, oy+0.5, cx+2.8, oy-1.5, 8);
  bezier(doc, cx+2.8, oy-1.5, cx+3.2, oy-6.5, cx+3.8, oy-8, cx+4.2, oy-1.5, 12);
  bezier(doc, cx+4.2, oy-1.5, cx+4.8, oy-4.5, cx+6, oy-5, cx+6.5, oy-2.5, 8);
  bezier(doc, cx+6.5, oy-2.5, cx+5.5, oy, cx+7, oy+0.5, cx+8.5, oy-1.5, 8);
  bezier(doc, cx+8.5, oy-1.5, cx+9.5, oy-4.5, cx+9, oy-5.5, cx+10.5, oy-3.5, 8);
  bezier(doc, cx+10.5, oy-3.5, cx+11, oy-0.5, cx+12.5, oy+0.5, cx+15, oy-0.5, 10);

  // Underline flourish
  doc.setLineWidth(0.2);
  bezier(doc, ox-2, oy+4, ox+18, oy+3, ox+42, oy+2, ox+62, oy+3.5, 30);
};

// Generate QR code pattern
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

const generateVerificationCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += "-";
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Hospital addresses
const hospitalAddresses: Record<string, string> = {
  "UPA 24h": "R. Barão de Mauá, 3567 - São João",
  UBS: "Av. Brasil, 1200 - Centro",
  SUS: "Praça da Saúde, 100",
  Unimed: "Av. Ayrton Senna, 2550 - Barra da Tijuca",
  Hapvida: "R. Pedro Álvares Cabral, 800 - Aldeota",
  Socorromed: "Av. Paulista, 2100 - Bela Vista",
};

export const generateAtestadoPDF = async (formData: FormData): Promise<jsPDF> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentW = pageW - margin * 2;
  const verificationCode = generateVerificationCode();
  const now = new Date();
  const doctorInfo = getDoctorInfo(formData.medicoSelecionado);
  const DOCTOR_NAME = doctorInfo.fullName;
  const DOCTOR_CRM = doctorInfo.crm;

  const inicioDate = getInicioDate(formData);
  const diasNum = getDiasNum(formData.diasAfastamento);
  const fimDate = addDays(inicioDate, diasNum);
  const hospitalName = formData.hospitalPreferencia;
  const isUpaStyle = upaStyleHospitals.includes(hospitalName);

  let y = 20;

  // ===== LOAD HOSPITAL LOGO =====
  const logoSrc = hospitalName ? hospitalLogos[hospitalName] : null;
  let logoBase64: string | null = null;
  if (logoSrc) {
    try { logoBase64 = await loadImageAsBase64(logoSrc); } catch { /* skip */ }
  }

  if (isUpaStyle) {
    // ========== UPA / SUS STYLE LAYOUT ==========
    // Logos side by side at top
    let logoEndX = margin;
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", margin, y - 5, 28, 22);
      logoEndX = margin + 32;
    }
    // Also add SUS logo if hospital is UPA 24h
    if (hospitalName === "UPA 24h") {
      try {
        const susLogo = await loadImageAsBase64(imgSus);
        if (susLogo) {
          doc.addImage(susLogo, "PNG", logoEndX, y - 3, 22, 18);
        }
      } catch { /* skip */ }
    }

    // Subtitle under logos
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("UNIDADE DE PRONTO ATENDIMENTO", margin, y);

    y += 14;

    // ===== TITLE =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text("Atestado Médico", margin, y);

    y += 14;

    // ===== PARA: =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text("PARA:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(formData.nomeCompleto.toUpperCase(), margin + 16, y);

    y += 12;

    // ===== BODY TEXT =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    const bodyText = `Atesto para os devidos fins, que a Sra./Sr. ${formData.nomeCompleto}, CPF: ${formData.cpf}, compareceu a pronto atendimento na data ${format(inicioDate, "dd/MM/yyyy")} às ${format(now, "HH:mm")}, necessitando afastar-se de suas funções laborais diárias pelo período de ${formData.diasAfastamento} por motivo de doença.`;

    const lines = doc.splitTextToSize(bodyText, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 6 + 5;

    // ===== CID =====
    if (formData.addonCid) {
      const cid = getCID10(formData.sintomas);
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`CID ${cid.code}`, margin, y);
      y += 8;
    }

    y += 10;

    // ===== DATE LINE =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    const dateStr = `Pronto Atendimento, ${format(inicioDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
    doc.text(dateStr, margin, y);

    y += 25;

    // ===== SIGNATURE =====
    drawSignature(doc, margin + 35, y - 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(DOCTOR_NAME, margin, y + 5);
    y += 11;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Médico", margin, y + 1);
    y += 7;
    doc.setFont("helvetica", "normal");
    doc.text(DOCTOR_CRM, margin, y + 1);

    // ===== QR CODE (optional) =====
    if (formData.addonQrCode) {
      const qrSize = 22;
      drawQRCode(doc, pageW - margin - qrSize, pageH - 70, qrSize, verificationCode);
      doc.setFontSize(6.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Código: ${verificationCode}`, pageW - margin - qrSize, pageH - 45);
    }

    // ===== FOOTER =====
    const address = hospitalAddresses[hospitalName] || "";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${address}${formData.cidade ? `, ${formData.cidade}` : ""}${formData.estado ? ` - ${formData.estado}` : ""}`,
      margin, pageH - 15
    );

  } else {
    // ========== UNIMED / HAPVIDA STYLE LAYOUT ==========
    // Logo top-left
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", margin, y - 5, 35, 20);
    }

    // Hospital name + subtitle (right of logo or at top)
    const textX = logoBase64 ? margin + 40 : margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`TELESSAÚDE - ${hospitalName?.toUpperCase()}`, textX, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    const addr = hospitalAddresses[hospitalName] || "";
    doc.text(`${addr}${formData.cidade ? `, ${formData.cidade}` : ""}${formData.estado ? ` - ${formData.estado}` : ""}`.toUpperCase(), textX, y + 7);

    y += 25;

    // ===== PATIENT DATA GRID =====
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);

    // Row 1 - Name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Nome do paciente:", margin, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(formData.nomeCompleto.toUpperCase(), margin + 38, y);
    y += 6;
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    // Row 2 - CPF and Date of Birth
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("CPF:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(formData.cpf, margin + 10, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Data de Nascimento:", pageW / 2, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(formData.dataNascimento || "", pageW / 2 + 40, y);
    y += 6;
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    // Row 3 - Convênio and Cidade
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Convênio:", margin, y);
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(hospitalName || "", margin + 20, y);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Cidade/Estado:", pageW / 2, y);
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(`${formData.cidade} - ${formData.estado}`, pageW / 2 + 30, y);
    y += 6;
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    // Row 4 - Professional and Date
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Profissional:", margin, y);
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(DOCTOR_NAME.toUpperCase(), margin + 25, y);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Data Assinatura:", pageW / 2, y);
    doc.setFontSize(9);
    doc.setTextColor(20, 20, 20);
    doc.text(format(now, "dd/MM/yyyy HH:mm:ss"), pageW / 2 + 33, y);
    y += 6;
    doc.line(margin, y, pageW - margin, y);

    y += 16;

    // ===== TITLE =====
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text("ATESTADO MÉDICO", pageW / 2, y, { align: "center" });

    y += 14;

    // ===== BODY TEXT =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);

    const bodyText = `Atesto para os devidos fins, a pedido que o(a) Sr(a). ${formData.nomeCompleto.toUpperCase()}, inscrito(a) no CPF sob o nº ${formData.cpf}, paciente sob meus cuidados, foi atendido(a) no dia ${format(inicioDate, "dd/MM/yy")} às ${format(now, "HH:mm")} apresentando quadro clínico compatível com os sintomas relatados, necessitando afastar-se de suas atividades pelo período de ${formData.diasAfastamento}.`;

    const lines = doc.splitTextToSize(bodyText, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 5.5 + 5;

    // Validity note
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const validityNote = `(Este atestado é válido para as finalidades previstas nos artigos 71 e 72, parágrafo 1º do Decreto 3048/99, e será expedido para justificar o afastamento do trabalho por ${formData.diasAfastamento}).`;
    const validLines = doc.splitTextToSize(validityNote, contentW);
    doc.text(validLines, margin, y);
    y += validLines.length * 5 + 5;

    // ===== CID =====
    if (formData.addonCid) {
      const cid = getCID10(formData.sintomas);
      y += 3;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text(`Eu, ${formData.nomeCompleto.toUpperCase()}, autorizo a inclusão da CID ${cid.code} no atestado médico.`, margin, y);
      y += 10;

      // Patient "signature" line
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(formData.nomeCompleto.toUpperCase(), margin, y);
      y += 8;
    }

    y += 15;

    // ===== SIGNATURE =====
    drawSignature(doc, pageW / 2, y - 8);

    // Signature line
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.4);
    doc.line(pageW / 2 - 35, y + 2, pageW / 2 + 35, y + 2);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("Assinatura e Carimbo", pageW / 2, y, { align: "center" });

    // ===== QR CODE =====
    if (formData.addonQrCode) {
      const qrSize = 22;
      const qrX = margin;
      const qrY = pageH - 70;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text("A validação do documento poderá ser realizada através do QRCode ou do link abaixo.", margin, qrY - 8);

      drawQRCode(doc, qrX, qrY, qrSize, verificationCode);

      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(`CÓDIGO: ${verificationCode}`, qrX + qrSize + 5, qrY + 10);
    }

    // ===== FOOTER =====
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Impresso em: ${format(now, "dd/MM/yyyy HH:mm")}`,
      margin, pageH - 20
    );
    doc.text(`Criado por: ${DOCTOR_NAME.toUpperCase()}`, margin, pageH - 15);
    doc.text(DOCTOR_CRM, margin, pageH - 10);
  }

  return doc;
};
