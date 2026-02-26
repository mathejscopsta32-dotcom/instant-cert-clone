import { ShieldCheck, Stethoscope, User, ClipboardList, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConsultaFormData } from "@/pages/SolicitarConsulta";

interface Props {
  formData: ConsultaFormData;
  updateForm: (updates: Partial<ConsultaFormData>) => void;
  errors: Record<string, string>;
}

const CONSULTA_PRICE = 29.9;

const StepRevisaoConsulta = ({ formData, updateForm, errors }: Props) => {
  const firstName = formData.nomeCompleto.split(" ")[0] || "Paciente";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Resumo da Consulta</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirme os dados antes de prosseguir para o pagamento.
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-sm text-foreground">
          Olá, <strong>{firstName}</strong>! 👋
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Confira os detalhes da sua consulta médica online antes de finalizar.
        </p>
      </div>

      {/* Dados pessoais */}
      <div className="bg-muted rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Dados Pessoais
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Nome</p>
            <p className="font-medium text-foreground">{formData.nomeCompleto}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CPF</p>
            <p className="font-medium text-foreground">{formData.cpf}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">E-mail</p>
            <p className="font-medium text-foreground">{formData.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Telefone</p>
            <p className="font-medium text-foreground">{formData.telefone}</p>
          </div>
        </div>
      </div>

      {/* Sintomas */}
      <div className="bg-muted rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" /> Sintomas Relatados
        </h3>
        <div className="flex flex-wrap gap-2">
          {formData.sintomas.map((s) => (
            <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{s}</span>
          ))}
          {formData.sintomas.length === 0 && formData.outrosSintomas && (
            <p className="text-sm text-foreground">{formData.outrosSintomas}</p>
          )}
        </div>
        {formData.outrosSintomas && formData.sintomas.length > 0 && (
          <p className="text-xs text-muted-foreground">Obs: {formData.outrosSintomas}</p>
        )}
      </div>

      {/* Avaliação médica */}
      <div className="bg-muted rounded-xl p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" /> Avaliação Médica
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Início dos sintomas</p>
            <p className="font-medium text-foreground capitalize">{formData.inicioSintomas || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Intensidade</p>
            <p className="font-medium text-foreground capitalize">{formData.intensidade || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Toma medicamento</p>
            <p className="font-medium text-foreground capitalize">{formData.tomaMedicamento || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Doença crônica</p>
            <p className="font-medium text-foreground capitalize">{formData.possuiDoencaCronica || "—"}</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="bg-muted rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-foreground">Total da Consulta:</span>
          <span className="text-xl font-extrabold text-primary">
            R$ {CONSULTA_PRICE.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>

      {/* Pagamento */}
      <div className="bg-muted rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Forma de Pagamento</p>
          <p className="text-xs text-muted-foreground">Pix</p>
        </div>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          Agendamento Imediato
        </span>
      </div>

      {/* Termos */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            checked={formData.aceitaTermos}
            onCheckedChange={(checked) => updateForm({ aceitaTermos: checked === true })}
            className="mt-0.5"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            Concordo com os <strong className="text-foreground">Termos de Uso</strong> e{" "}
            <strong className="text-foreground">Política de Privacidade</strong>. Estou ciente de que o
            atendimento é realizado por Médicos brasileiros com CRM ativo.
          </span>
        </label>
        {errors.aceitaTermos && <p className="text-xs text-destructive">{errors.aceitaTermos}</p>}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
        Seus dados são protegidos por criptografia e sigilo médico (LGPD).
      </div>
    </div>
  );
};

export default StepRevisaoConsulta;
