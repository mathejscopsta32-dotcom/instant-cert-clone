import { useState } from "react";
import { ShieldCheck, MapPin, Sparkles, FileText, QrCode, Package, Hospital } from "lucide-react";
import type { FormData } from "@/pages/Solicitar";
import { diasOpcoes } from "./StepDetalhes";
import { Checkbox } from "@/components/ui/checkbox";

import imgUbs from "@/assets/hospitals/ubs.png";
import imgUpa24h from "@/assets/hospitals/upa24h.png";
import imgSus from "@/assets/hospitals/sus.png";
import imgUnimed from "@/assets/hospitals/unimed.png";
import imgHapvida from "@/assets/hospitals/hapvida.png";
import imgSocorromed from "@/assets/hospitals/socorromed.png";

const hospitalImages: Record<string, string> = {
  UBS: imgUbs,
  "UPA 24h": imgUpa24h,
  SUS: imgSus,
  Unimed: imgUnimed,
  Hapvida: imgHapvida,
  Socorromed: imgSocorromed,
};

interface Props {
  formData: FormData;
  updateForm: (updates: Partial<FormData>) => void;
  onFinalize: () => void;
  errors: Record<string, string>;
}

const ADDON_CID_PRICE = 9.9;
const ADDON_QR_PRICE = 9.9;
const ADDON_PACOTE_PRICE = 39.9;

const StepRevisao = ({ formData, updateForm, onFinalize, errors }: Props) => {
  const selected = diasOpcoes.find((d) => d.label === formData.diasAfastamento);
  const basePrice = selected?.valor || 39.9;

  let total = basePrice;
  if (formData.addonCid) total += ADDON_CID_PRICE;
  if (formData.addonQrCode) total += ADDON_QR_PRICE;
  if (formData.addonPacote3) total += ADDON_PACOTE_PRICE;

  const firstName = formData.nomeCompleto.split(" ")[0] || "Paciente";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Resumo do Pedido</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Confirme os dados antes de prosseguir para o pagamento.
        </p>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-sm text-foreground">
          Olá, <strong>{firstName}</strong>! 👋
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Estamos quase lá! Confira os detalhes do seu atestado antes de finalizar.
        </p>
      </div>

      {/* Addons */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-primary" />
          Adicione ao seu pedido
        </h3>

        {/* CID */}
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

        {/* QR Code */}
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

        {/* Pacote 3 */}
        <button
          type="button"
          onClick={() => updateForm({ addonPacote3: !formData.addonPacote3 })}
          className={`w-full text-left p-4 rounded-xl border transition-colors ${
            formData.addonPacote3
              ? "border-primary bg-secondary ring-2 ring-primary/20"
              : "border-border hover:bg-muted"
          }`}
        >
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">Pacote 3 Atestados</p>
                <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                  ECONOMIZE R$ 19!
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compre 3 atestados pelo preço de 2. Os créditos ficam salvos na sua conta para usar quando precisar.
              </p>
            </div>
            <span className="text-sm font-bold text-primary whitespace-nowrap">+R$ 39,90</span>
          </div>
        </button>
      </div>

      {/* Order Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Resumo do Pedido</h3>

        <div className="bg-muted rounded-xl p-4 space-y-3">
          {/* Hospital */}
          <div className="flex items-center gap-3">
            {formData.hospitalPreferencia && hospitalImages[formData.hospitalPreferencia] ? (
              <img
                src={hospitalImages[formData.hospitalPreferencia]}
                alt={formData.hospitalPreferencia}
                className="h-8 object-contain"
              />
            ) : (
              <Hospital className="w-6 h-6 text-primary" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Hospital Selecionado</p>
              <p className="text-sm font-semibold text-foreground">{formData.hospitalPreferencia || "—"}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Item */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-foreground">
                Atestado Médico - {formData.diasAfastamento || "1 dia"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formData.sintomas.length > 0 ? formData.sintomas.join(", ") : "—"}
              </p>
            </div>
            <span className="text-sm font-bold text-foreground">
              {selected?.preco || "R$ 39,90"}
            </span>
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
          {formData.addonPacote3 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pacote 3 Atestados</span>
              <span className="font-medium text-foreground">R$ 39,90</span>
            </div>
          )}

          <div className="border-t border-border" />

          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-foreground">Total:</span>
            <span className="text-xl font-extrabold text-primary">
              R$ {total.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
      </div>

      {/* Local emission note */}
      <div className="flex items-start gap-3 bg-secondary/50 rounded-xl p-4">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">
            Emissão Local (Hospitais de {formData.estado || "SP"})
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Seu atestado é emitido e assinado digitalmente em minutos por unidades de saúde parceiras próximas a você.
          </p>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-muted rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">Forma de Pagamento</p>
          <p className="text-xs text-muted-foreground">Pix</p>
        </div>
        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          Liberação Imediata
        </span>
      </div>

      {/* Terms */}
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
            atendimento é realizado por Médicos brasileiros com CRM ativo e que, caso o atestado não
            seja aceito, terei direito ao reembolso integral do valor pago.
          </span>
        </label>
        {errors.aceitaTermos && <p className="text-xs text-destructive">{errors.aceitaTermos}</p>}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Ao clicar em "Finalizar Pedido", você concorda em pagar o valor de{" "}
        <strong>R$ {total.toFixed(2).replace(".", ",")}</strong> pelo atestado médico online via Pix.
        O atestado estará disponível no sistema do site em até 5 minutos após a confirmação do
        pagamento, avaliado por Médicos brasileiros com CRM ativo de plantão. Você poderá baixar o
        PDF do atestado diretamente do site assim que o pagamento for confirmado.
      </p>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
        Seus dados são protegidos por criptografia e sigilo médico (LGPD).
      </div>
    </div>
  );
};

export default StepRevisao;
