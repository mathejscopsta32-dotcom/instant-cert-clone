import { ShieldCheck, Stethoscope, User, ClipboardList, CheckCircle2, Sparkles, FileText, QrCode, FileBadge } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { ConsultaFormData } from "@/pages/SolicitarConsulta";

interface Props {
  formData: ConsultaFormData;
  updateForm: (updates: Partial<ConsultaFormData>) => void;
  errors: Record<string, string>;
}

const CONSULTA_PRICE = 29.9;
const ADDON_CID_PRICE = 9.9;
const ADDON_QR_PRICE = 9.9;
const ADDON_ATESTADO_2DIAS_PRICE = 49.9;

export const calcConsultaTotal = (formData: ConsultaFormData) => {
  let total = CONSULTA_PRICE;
  if (formData.addonCid) total += ADDON_CID_PRICE;
  if (formData.addonQrCode) total += ADDON_QR_PRICE;
  if (formData.addonAtestado2dias) total += ADDON_ATESTADO_2DIAS_PRICE;
  return total;
};

const StepRevisaoConsulta = ({ formData, updateForm, errors }: Props) => {
  const firstName = formData.nomeCompleto.split(" ")[0] || "Paciente";
  const total = calcConsultaTotal(formData);

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

      {/* Upsells */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Adicione ao seu pedido
        </h3>

        <button
          type="button"
          onClick={() => updateForm({ addonCid: !formData.addonCid })}
          className={`w-full text-left p-4 rounded-xl border transition-colors ${
            formData.addonCid
              ? "border-primary bg-secondary ring-2 ring-primary/20"
              : "border-border hover:bg-muted"
          }`}
        >
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Incluir CID no atestado</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Código internacional da doença (CID-10). Recomendado para INSS, empresas grandes e perícias.
              </p>
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">+R$ 9,90</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => updateForm({ addonQrCode: !formData.addonQrCode })}
          className={`w-full text-left p-4 rounded-xl border transition-colors ${
            formData.addonQrCode
              ? "border-primary bg-secondary ring-2 ring-primary/20"
              : "border-border hover:bg-muted"
          }`}
        >
          <div className="flex items-start gap-3">
            <QrCode className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Verificação Digital com QR Code</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                QR Code que permite à empresa verificar a autenticidade online. Ideal para RH rigoroso.
              </p>
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">+R$ 9,90</span>
          </div>
        </button>

        {/* Atestado 2 dias */}
        <button
          type="button"
          onClick={() => updateForm({ addonAtestado2dias: !formData.addonAtestado2dias })}
          className={`w-full text-left p-4 rounded-xl border transition-colors ${
            formData.addonAtestado2dias
              ? "border-primary bg-secondary ring-2 ring-primary/20"
              : "border-border hover:bg-muted"
          }`}
        >
          <div className="flex items-start gap-3">
            <FileBadge className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Atestado Médico – 2 dias</p>
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                  MAIS VENDIDO
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receba um atestado médico de 2 dias de afastamento junto com sua consulta. Emitido por médico com CRM ativo.
              </p>
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">+R$ 49,90</span>
          </div>
        </button>
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
      <div className="bg-muted rounded-xl p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Consulta Médica Online</span>
          <span className="font-medium text-foreground">R$ 29,90</span>
        </div>
        {formData.addonCid && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">CID-10</span>
            <span className="font-medium text-foreground">R$ 9,90</span>
          </div>
        )}
        {formData.addonQrCode && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">QR Code Digital</span>
            <span className="font-medium text-foreground">R$ 9,90</span>
          </div>
        )}
        {formData.addonAtestado2dias && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Atestado Médico – 2 dias</span>
            <span className="font-medium text-foreground">R$ 49,90</span>
          </div>
        )}
        <div className="border-t border-border pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Total:</span>
            <span className="text-xl font-extrabold text-primary">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>
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
