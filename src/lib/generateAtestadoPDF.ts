import { jsPDF } from "jspdf";
import type { FormData } from "@/pages/Solicitar";
import { format, addDays } from "date-fns";

// Hospital logo imports
import imgUbs from "@/assets/hospitals/ubs.png";
import imgUpa24h from "@/assets/hospitals/upa24h.png";
import imgSus from "@/assets/hospitals/sus.png";
import imgUnimed from "@/assets/hospitals/unimed.png";
import imgHapvida from "@/assets/hospitals/hapvida.png";
import imgSocorromed from "@/assets/hospitals/socorromed.png";
import imgIcpBrasil from "@/assets/icp-brasil.png";

const hospitalLogos: Record<string, string> = {
  UBS: imgUbs,
  "UPA 24h": imgUpa24h,
  SUS: imgSus,
  Unimed: imgUnimed,
  Hapvida: imgHapvida,
  Socorromed: imgSocorromed,
};

// CID-10 mapping
const getCID10 = (sintomas: string[]): { code: string; description: string } => {
  const s = sintomas.map((x) => x.toLowerCase().replace(/^[^\w\s]+\s*/, ""));
  if (s.some((x) => x.includes("febre"))) return { code: "R50.9", description: "Febre não especificada" };
  if (s.some((x) => x.includes("dor de cabeça") || x.includes("cefaleia"))) return { code: "R51", description: "Cefaleia" };
  if (s.some((x) => x.includes("náusea") || x.includes("vômito"))) return { code: "R11", description: "Náusea e vômito" };
  if (s.some((x) => x.includes("diarreia"))) return { code: "K59.1", description: "Diarreia funcional" };
  if (s.some((x) => x.includes("tosse"))) return { code: "R05", description: "Tosse" };
  if (s.some((x) => x.includes("gripe") || x.includes("resfriado"))) return { code: "J11", description: "Influenza (gripe)" };
  if (s.some((x) => x.includes("dor abdominal") || x.includes("estômago"))) return { code: "R10.4", description: "Dor abdominal" };
  if (s.some((x) => x.includes("tontura"))) return { code: "R42", description: "Tontura e instabilidade" };
  if (s.some((x) => x.includes("ansiedade"))) return { code: "F41.9", description: "Transtorno ansioso" };
  if (s.some((x) => x.includes("lombar") || x.includes("costas"))) return { code: "M54.5", description: "Dor lombar baixa" };
  if (s.some((x) => x.includes("dengue"))) return { code: "A90", description: "Dengue" };
  return { code: "R69", description: "Causas desconhecidas de morbidade" };
};

// Doctor database (legacy lookup kept for compatibility)
const doctorDatabase: Record<string, { fullName: string; crm: string }> = {
  "Dr. Rodrigo V.": { fullName: "Dr. Rodrigo V. Vasconcelos", crm: "CRM/SP 158.743" },
  "Dra. Ana Beatriz": { fullName: "Dra. Ana Beatriz de Souza", crm: "CRM/RJ 198.432" },
  "Dr. Roberto Mendes": { fullName: "Dr. Roberto Mendes Silva", crm: "CRM/MG 165.291" },
  "Dra. Juliana Costa": { fullName: "Dra. Juliana Costa Ferreira", crm: "CRM/SP 201.845" },
};

const DEFAULT_DOCTOR_NAME = "Dr. Rodrigo V. Vasconcelos";
const DEFAULT_DOCTOR_CRM = "CRM/SP 158.743";

const getDoctorInfo = (formData: FormData) => {
  // 1) Prefer explicit override (e.g. doctor chosen by UF lookup)
  if (formData.medicoOverride?.fullName && formData.medicoOverride?.crm) {
    return {
      fullName: formData.medicoOverride.fullName,
      crm: formData.medicoOverride.crm,
    };
  }
  // 2) Legacy named selection
  if (formData.medicoSelecionado && doctorDatabase[formData.medicoSelecionado]) {
    return doctorDatabase[formData.medicoSelecionado];
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

const loadImageAsBase64 = (src: string): Promise<string | null> =>
  new Promise((resolve) => {
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
      } else resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

// QR code pattern generator (visual representation)
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

// (Hospital address agora vem do endereço escolhido pelo cliente — cidade/UF
// ou um endereço informado/editado no admin. Não usamos mais endereços fixos.)

export const generateAtestadoPDF = async (formData: FormData): Promise<jsPDF> => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const verificationCode = generateVerificationCode();
  const now = new Date();
  const doctorInfo = getDoctorInfo(formData);
  const DOCTOR_NAME = doctorInfo.fullName;
  const DOCTOR_CRM = doctorInfo.crm;

  const inicioDate = getInicioDate(formData);
  const diasNum = getDiasNum(formData.diasAfastamento);
  const hospitalName = formData.hospitalPreferencia;

  // ============== HEADER ==============
  const headerTop = 15;

  // Hospital logo (small, top-left) — kept compact so it never overlaps the QR box
  const logoSrc = hospitalName ? hospitalLogos[hospitalName] : null;
  let logoBase64: string | null = null;
  if (logoSrc) {
    try { logoBase64 = await loadImageAsBase64(logoSrc); } catch { /* skip */ }
  }
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", margin, headerTop, 38, 18);
  }

  // ============== QR VALIDATION BOX (only when add-on selected) ==============
  if (formData.addonQrCode) {
    const boxW = 78;
    const boxH = 50;
    const boxX = pageW - margin - boxW;
    const boxY = headerTop - 3;

    // Light green/gray box
    doc.setFillColor(244, 249, 246);
    doc.setDrawColor(220, 230, 224);
    doc.setLineWidth(0.3);
    doc.roundedRect(boxX, boxY, boxW, boxH, 2.5, 2.5, "FD");

    // Heading text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(40, 60, 50);
    doc.text("Você sabia que pode", boxX + 4, boxY + 5);
    doc.text("validar esse mesmo", boxX + 4, boxY + 9);
    doc.text("Atestado no seu celular?", boxX + 4, boxY + 13);

    // QR code (left side of box)
    drawQRCode(doc, boxX + 4, boxY + 17, 28, verificationCode);

    // Numbered steps (right side of box)
    const stepsX = boxX + 38;
    let stepY = boxY + 19;
    const steps = [
      "Escaneie o QR Code ou\nacesse: docmedonline.lovable.app",
      'Se solicitado, clique em\n"Validar Documento"',
      "Confira se as informações\nbatem com o atestado",
    ];
    steps.forEach((stepText, idx) => {
      // numbered green circle
      doc.setFillColor(34, 139, 90);
      doc.circle(stepsX + 1.8, stepY, 1.8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text(String(idx + 1), stepsX + 1.8, stepY + 0.7, { align: "center" });

      // step text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(60, 70, 65);
      doc.text(stepText, stepsX + 5, stepY - 0.5);

      stepY += 9;
    });
  }

  // ============== PATIENT BLOCK ==============
  let y = 55;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text("Paciente:", margin, y);

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text(formData.nomeCompleto.toUpperCase(), margin, y);

  y += 8;

  // 3-column row: CPF | Nascimento | Emissão
  const colW = contentW / 3;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text("CPF do Paciente:", margin, y);
  doc.text("Nascimento:", margin + colW, y);
  doc.text("Emissão:", margin + colW * 2, y);

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text(formData.cpf || "—", margin, y);
  doc.text(formData.dataNascimento || "—", margin + colW, y);
  const emissaoDate = formData.dataEmissaoOverride || now;
  doc.text(format(emissaoDate, "dd/MM/yyyy - HH:mm:ss"), margin + colW * 2, y);

  y += 8;

  // Endereço row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text("Endereço:", margin, y);

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  const enderecoFmt =
    formData.enderecoOverride ||
    [formData.cidade, formData.estado].filter(Boolean).join(" - ") ||
    "—";
  doc.text(enderecoFmt, margin, y);

  // Divider
  y += 6;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);

  // ============== TITLE ==============
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20);
  doc.text("Atestado Médico", pageW / 2, y, { align: "center" });

  // ============== CID (optional) ==============
  y += 14;
  if (formData.addonCid) {
    const cid = formData.cidOverride || getCID10(formData.sintomas);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`CID: ${cid.code}${cid.description ? " - " + cid.description : ""}`, margin, y);
    y += 9;
  }

  // ============== BODY ==============
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(40, 40, 40);
  const bodyText = `Esteve sob cuidados profissionais no dia ${format(
    inicioDate,
    "dd/MM/yyyy"
  )} e deverá permanecer em repouso a partir de hoje (${format(
    now,
    "dd/MM/yyyy"
  )}) por ${diasNum} dia(s).`;
  const lines = doc.splitTextToSize(bodyText, contentW);
  doc.text(lines, margin, y);

  // ============== FOOTER ==============
  // Top divider above footer
  const footerTop = pageH - 38;
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.3);
  doc.line(margin, footerTop, pageW - margin, footerTop);

  // ICP Brasil logo (left) + digital signature notice (center)
  let icpBase64: string | null = null;
  try { icpBase64 = await loadImageAsBase64(imgIcpBrasil); } catch { /* skip */ }

  const footerY = footerTop + 6;
  if (icpBase64) {
    doc.addImage(icpBase64, "PNG", margin + 18, footerY, 10, 10);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(
    "ESTE DOCUMENTO FOI ASSINADO DIGITALMENTE COM CERTIFICADO DIGITAL PADRÃO",
    pageW / 2,
    footerY + 3,
    { align: "center" }
  );
  doc.text(
    "ICP-BRASIL AMPARADO PELA MEDIDA PROVISÓRIA 2200-2/2001",
    pageW / 2,
    footerY + 7,
    { align: "center" }
  );

  // Doctor signature line (digital, no handwritten signature)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `Dr(a). ${DOCTOR_NAME.toUpperCase()}  |  ${DOCTOR_CRM}`,
    pageW / 2,
    footerY + 14,
    { align: "center" }
  );

  // Hospital footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(110, 110, 110);
  const enderecoLinha =
    formData.hospitalEnderecoOverride ||
    formData.enderecoOverride ||
    [formData.cidade, formData.estado].filter(Boolean).join(" - ");
  const hospitalLine = `${hospitalName || ""}${enderecoLinha ? " - " + enderecoLinha : ""}`;
  doc.text(hospitalLine, pageW / 2, footerY + 19, { align: "center" });

  // Disclaimer (CID disclosure note) — only if CID add-on
  if (formData.addonCid) {
    doc.setFontSize(6.5);
    doc.setTextColor(140, 140, 140);
    doc.text(
      "A exibição do CID no atestado médico foi solicitada pelo paciente (ou representante legal), conforme Art. 5º CFM 1658/02.",
      pageW / 2,
      footerY + 24,
      { align: "center" }
    );
  }

  return doc;
};
