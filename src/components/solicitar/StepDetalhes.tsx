import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { FormData } from "@/pages/Solicitar";

interface Props {
  formData: FormData;
  updateForm: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const finalidades = [
  { value: "trabalho", label: "Trabalho (CLT)" },
  { value: "escola", label: "Escola / Faculdade" },
  { value: "concurso", label: "Concurso / Prova" },
  { value: "outro", label: "Outro" },
];

const diasOpcoes = ["1 dia", "2 dias", "3 dias", "5 dias", "7 dias", "15 dias"];

const StepDetalhes = ({ formData, updateForm, errors }: Props) => {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground mb-1">Detalhes do Atestado</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Informe os detalhes para emissão do seu atestado médico.
      </p>

      {/* Finalidade */}
      <div>
        <Label>Finalidade do atestado *</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {finalidades.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => updateForm({ finalidade: f.value })}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors text-left ${
                formData.finalidade === f.value
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {errors.finalidade && <p className="text-xs text-destructive mt-1">{errors.finalidade}</p>}
      </div>

      {/* Data de início */}
      <div>
        <Label>Data de início do afastamento *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-start gap-2 border rounded-lg px-3 py-2.5 text-sm mt-2 text-left",
                !formData.dataInicio && "text-muted-foreground",
                errors.dataInicio ? "border-destructive" : "border-input"
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              {formData.dataInicio
                ? format(formData.dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                : "Selecione a data"}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formData.dataInicio}
              onSelect={(date) => updateForm({ dataInicio: date })}
              disabled={(date) => date > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {errors.dataInicio && <p className="text-xs text-destructive mt-1">{errors.dataInicio}</p>}
      </div>

      {/* Dias de afastamento */}
      <div>
        <Label>Dias de afastamento *</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {diasOpcoes.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => updateForm({ diasAfastamento: d })}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                formData.diasAfastamento === d
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        {errors.diasAfastamento && (
          <p className="text-xs text-destructive mt-1">{errors.diasAfastamento}</p>
        )}
      </div>

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações adicionais (opcional)</Label>
        <Textarea
          id="observacoes"
          placeholder="Informações adicionais relevantes..."
          value={formData.observacoes}
          onChange={(e) => updateForm({ observacoes: e.target.value.slice(0, 500) })}
          rows={3}
        />
      </div>
    </div>
  );
};

export default StepDetalhes;
