import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Info } from "lucide-react";
import type { FormData } from "@/pages/Solicitar";

interface Props {
  formData: FormData;
  updateForm: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

export const diasOpcoes = [
  { label: "1 dia", preco: "R$ 39,90", valor: 39.90 },
  { label: "2 dias", preco: "R$ 43,90", valor: 43.90 },
  { label: "3 dias", preco: "R$ 49,90", valor: 49.90 },
  { label: "5 dias", preco: "R$ 59,90", valor: 59.90 },
  { label: "7 dias", preco: "R$ 69,90", valor: 69.90 },
  { label: "10 dias", preco: "R$ 79,90", valor: 79.90 },
  { label: "15 dias", preco: "R$ 89,90", valor: 89.90 },
];

const inicioOpcoes = [
  { value: "amanha", label: "Amanhã" },
  { value: "hoje", label: "Hoje" },
  { value: "ontem", label: "Ontem" },
  { value: "personalizado", label: "Personalizado" },
];

const estadosBR = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const getDateFromInicio = (inicio: string, customDate?: Date): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (inicio) {
    case "amanha": return addDays(today, 1);
    case "hoje": return today;
    case "ontem": return subDays(today, 1);
    case "personalizado": return customDate || today;
    default: return today;
  }
};

const StepDetalhes = ({ formData, updateForm, errors }: Props) => {
  const inicioDate = formData.inicioSintomas
    ? getDateFromInicio(formData.inicioSintomas, formData.inicioSintomasData)
    : null;

  const validadeDate = inicioDate ? addDays(inicioDate, 1) : null;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground mb-1">Detalhes Finais</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Informações sobre o início dos sintomas e período desejado.
      </p>

      {/* Observações / outros detalhes */}
      <div>
        <Label htmlFor="observacoes">Outros sintomas ou detalhes que gostaria de mencionar?</Label>
        <Textarea
          id="observacoes"
          placeholder="Descreva outros sintomas ou informações relevantes..."
          value={formData.observacoes}
          onChange={(e) => updateForm({ observacoes: e.target.value.slice(0, 500) })}
          rows={3}
          className="mt-2"
        />
      </div>

      {/* Início dos sintomas */}
      <div>
        <Label>Quando começaram os sintomas? *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {inicioOpcoes.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateForm({ inicioSintomas: opt.value })}
              className={`p-3 rounded-xl border text-sm font-medium transition-colors ${
                formData.inicioSintomas === opt.value
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.inicioSintomas && <p className="text-xs text-destructive mt-1">{errors.inicioSintomas}</p>}
      </div>

      {/* Data personalizada */}
      {formData.inicioSintomas === "personalizado" && (
        <div>
          <Label>Selecione a data *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-start gap-2 border rounded-lg px-3 py-2.5 text-sm mt-2 text-left",
                  !formData.inicioSintomasData && "text-muted-foreground",
                  errors.inicioSintomasData ? "border-destructive" : "border-input"
                )}
              >
                <CalendarIcon className="w-4 h-4" />
                {formData.inicioSintomasData
                  ? format(formData.inicioSintomasData, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Selecione a data"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.inicioSintomasData}
                onSelect={(date) => updateForm({ inicioSintomasData: date })}
                disabled={(date) => date > addDays(new Date(), 1)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {errors.inicioSintomasData && <p className="text-xs text-destructive mt-1">{errors.inicioSintomasData}</p>}
        </div>
      )}

      {/* Nota sobre validade */}
      {formData.inicioSintomas && (
        <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3 text-sm text-muted-foreground">
          <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <span>
            O atestado será válido a partir de{" "}
            <strong className="text-foreground">
              {validadeDate ? format(validadeDate, "dd/MM/yyyy", { locale: ptBR }) : "—"}
            </strong>{" "}
            (1 dia após o início dos sintomas).
          </span>
        </div>
      )}

      {/* Dias de afastamento */}
      <div>
        <Label>Por quantos dias você precisa do atestado? *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {diasOpcoes.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => updateForm({ diasAfastamento: d.label })}
              className={`p-4 rounded-xl border text-left transition-colors ${
                formData.diasAfastamento === d.label
                  ? "border-primary bg-secondary text-secondary-foreground"
                  : "border-border text-foreground hover:bg-muted"
              }`}
            >
              <span className="block text-sm font-semibold">{d.label}</span>
              <span className="block text-xs text-primary font-bold mt-1">{d.preco}</span>
            </button>
          ))}
        </div>
        {errors.diasAfastamento && (
          <p className="text-xs text-destructive mt-1">{errors.diasAfastamento}</p>
        )}
      </div>

      {/* Nota sobre período */}
      <div className="flex items-start gap-2 bg-secondary/50 rounded-xl p-3 text-sm text-muted-foreground">
        <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <span>
          O período final de afastamento será definido pelo médico após a avaliação do seu caso clínico.
        </span>
      </div>

      {/* Hospital de Preferência */}
      <div>
        <Label htmlFor="hospital">Hospital de Preferência</Label>
        <Input
          id="hospital"
          placeholder="Ex: Hospital São Luiz, UPA Central..."
          value={formData.hospitalPreferencia}
          onChange={(e) => updateForm({ hospitalPreferencia: e.target.value })}
          className="mt-2"
        />
      </div>

      {/* Cidade e Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            placeholder="Ex: São Paulo"
            value={formData.cidade}
            onChange={(e) => updateForm({ cidade: e.target.value })}
            className={cn("mt-2", errors.cidade && "border-destructive")}
          />
          {errors.cidade && <p className="text-xs text-destructive mt-1">{errors.cidade}</p>}
        </div>
        <div>
          <Label>Estado *</Label>
          <Select
            value={formData.estado}
            onValueChange={(value) => updateForm({ estado: value })}
          >
            <SelectTrigger className={cn("mt-2", errors.estado && "border-destructive")}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {estadosBR.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.estado && <p className="text-xs text-destructive mt-1">{errors.estado}</p>}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">* Obrigatório</p>
    </div>
  );
};

export default StepDetalhes;