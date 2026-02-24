import { ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FormData } from "@/pages/Solicitar";

interface Props {
  formData: FormData;
}

const finalidadeLabels: Record<string, string> = {
  trabalho: "Trabalho (CLT)",
  escola: "Escola / Faculdade",
  concurso: "Concurso / Prova",
  outro: "Outro",
};

const StepRevisao = ({ formData }: Props) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-foreground mb-1">Revisão da Solicitação</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Confira seus dados antes de enviar a solicitação.
      </p>

      <div className="space-y-4">
        {/* Dados Pessoais */}
        <div className="bg-muted rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground">Dados Pessoais</h3>
          <Row label="Nome" value={formData.nomeCompleto} />
          <Row label="CPF" value={formData.cpf} />
          <Row label="E-mail" value={formData.email} />
          <Row label="Telefone" value={formData.telefone} />
          <Row label="Data de Nasc." value={formData.dataNascimento} />
        </div>

        {/* Sintomas */}
        <div className="bg-muted rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground">Sintomas</h3>
          {formData.sintomas.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.sintomas.map((s) => (
                <span key={s} className="bg-secondary text-secondary-foreground text-xs px-2.5 py-1 rounded-full font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
          {formData.outrosSintomas && <Row label="Outros" value={formData.outrosSintomas} />}
        </div>

        {/* Detalhes */}
        <div className="bg-muted rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-foreground">Detalhes do Atestado</h3>
          <Row label="Finalidade" value={finalidadeLabels[formData.finalidade] || formData.finalidade} />
          <Row
            label="Data de início"
            value={
              formData.dataInicio
                ? format(formData.dataInicio, "dd/MM/yyyy", { locale: ptBR })
                : "—"
            }
          />
          <Row label="Afastamento" value={formData.diasAfastamento} />
          {formData.observacoes && <Row label="Observações" value={formData.observacoes} />}
        </div>

        {/* Valor */}
        <div className="bg-secondary rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Valor Total</p>
            <p className="text-xs text-muted-foreground">Pagamento via PIX ou Cartão</p>
          </div>
          <p className="text-2xl font-extrabold text-primary">R$ 29</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
          Seus dados são protegidos por criptografia e sigilo médico (LGPD).
        </div>
      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium text-right max-w-[60%] break-words">{value}</span>
  </div>
);

export default StepRevisao;
