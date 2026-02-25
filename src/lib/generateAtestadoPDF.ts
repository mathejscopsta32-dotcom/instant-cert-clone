import { jsPDF } from "jspdf";
import type { FormData } from "@/pages/Solicitar";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const getInicioDate = (formData: FormData): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (formData.inicioSintomas) {
    case "hoje":
      return today;
    case "ontem":
      return addDays(today, -1);
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

export const generateAtestadoPDF = (formData: FormData): jsPDF => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = 20;

  // Header line
  doc.setDrawColor(0, 102, 178);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text("ATESTADO MÉDICO", pageW / 2, y, { align: "center" });
  y += 12;

  // Subtitle
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Documento emitido eletronicamente para fins de justificativa de ausência", pageW / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 12;

  // Patient info section
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 51, 102);
  doc.text("DADOS DO PACIENTE", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  const fields = [
    ["Nome Completo", formData.nomeCompleto],
    ["CPF", formData.cpf],
    ["Data de Nascimento", formData.dataNascimento],
    ["Cidade / Estado", `${formData.cidade} - ${formData.estado}`],
  ];

  fields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), margin + 45, y);
    y += 7;
  });

  y += 6;

  // Clinical info
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 51, 102);
  doc.text("INFORMAÇÕES CLÍNICAS", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  const inicioDate = getInicioDate(formData);
  const diasNum = getDiasNum(formData.diasAfastamento);
  const fimDate = addDays(inicioDate, diasNum);

  doc.setFont("helvetica", "bold");
  doc.text("Sintomas Relatados:", margin, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  const allSintomas = [
    ...formData.sintomas.map((s) => s.replace(/^[^\w\s]+\s*/, "")),
    ...(formData.outrosSintomas ? [formData.outrosSintomas] : []),
  ];

  allSintomas.forEach((s) => {
    doc.text(`• ${s}`, margin + 5, y);
    y += 6;
  });

  y += 4;

  const clinicalFields = [
    ["Início dos Sintomas", format(inicioDate, "dd/MM/yyyy", { locale: ptBR })],
    ["Período de Afastamento", formData.diasAfastamento],
    ["Data de Retorno", format(fimDate, "dd/MM/yyyy", { locale: ptBR })],
    ["Unidade de Saúde", formData.hospitalPreferencia],
  ];

  clinicalFields.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(value), margin + 55, y);
    y += 7;
  });

  y += 10;

  // Declaration
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 51, 102);
  doc.text("DECLARAÇÃO", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);

  const declaration = `Atesto para os devidos fins que o(a) paciente ${formData.nomeCompleto}, portador(a) do CPF ${formData.cpf}, foi atendido(a) nesta data apresentando quadro clínico compatível com os sintomas acima descritos, necessitando de afastamento de suas atividades por ${formData.diasAfastamento}, a partir de ${format(inicioDate, "dd/MM/yyyy")}.`;

  const lines = doc.splitTextToSize(declaration, contentW);
  doc.text(lines, margin, y);
  y += lines.length * 6 + 10;

  // Date and location
  const emissionDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  doc.text(`${formData.cidade} - ${formData.estado}, ${emissionDate}`, pageW / 2, y, { align: "center" });
  y += 20;

  // Signature
  doc.setDrawColor(40, 40, 40);
  doc.line(pageW / 2 - 40, y, pageW / 2 + 40, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Médico(a) Responsável", pageW / 2, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("CRM registrado", pageW / 2, y, { align: "center" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(0, 102, 178);
  doc.setLineWidth(1.5);
  doc.line(margin, footerY - 5, pageW - margin, footerY - 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Documento emitido eletronicamente — Atestado24h", pageW / 2, footerY, { align: "center" });

  return doc;
};
