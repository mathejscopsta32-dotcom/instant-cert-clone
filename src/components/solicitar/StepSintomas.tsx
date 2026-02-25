import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Stethoscope,
  Brain,
  Thermometer,
  Pill,
  HeartPulse,
  Droplets,
  Wind,
  CloudSnow,
  Activity,
  RotateCcw,
  Bone,
  SmilePlus,
  Flower2,
  type LucideIcon,
} from "lucide-react";
import type { FormData } from "@/pages/Solicitar";

interface Props {
  formData: FormData;
  updateForm: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const sintomasOpcoes: { label: string; icon: LucideIcon }[] = [
  { label: "Dor de cabeça / Enxaqueca", icon: Brain },
  { label: "Febre", icon: Thermometer },
  { label: "Dor no corpo / Mal-estar", icon: Pill },
  { label: "Náusea / Vômito", icon: HeartPulse },
  { label: "Diarreia", icon: Droplets },
  { label: "Dor de garganta", icon: Wind },
  { label: "Gripe / Resfriado", icon: CloudSnow },
  { label: "Dor abdominal / Cólica", icon: Activity },
  { label: "Tontura / Vertigem", icon: RotateCcw },
  { label: "Dor lombar / Costas", icon: Bone },
  { label: "Ansiedade / Crise emocional", icon: SmilePlus },
  { label: "Alergia", icon: Flower2 },
];

const StepSintomas = ({ formData, updateForm, errors }: Props) => {
  const toggleSintoma = (sintoma: string) => {
    const updated = formData.sintomas.includes(sintoma)
      ? formData.sintomas.filter((s) => s !== sintoma)
      : [...formData.sintomas, sintoma];
    updateForm({ sintomas: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Stethoscope className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Sintomas</h2>
          <p className="text-xs text-muted-foreground">
            Selecione os sintomas que você está apresentando.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sintomasOpcoes.map((sintoma) => {
          const Icon = sintoma.icon;
          const isSelected = formData.sintomas.includes(sintoma.label);
          return (
            <label
              key={sintoma.label}
              className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                  : "border-border hover:bg-muted hover:border-border/80"
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleSintoma(sintoma.label)}
              />
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-foreground">{sintoma.label}</span>
            </label>
          );
        })}
      </div>

      {errors.sintomas && <p className="text-xs text-destructive mt-1">{errors.sintomas}</p>}

      <div>
        <Label htmlFor="outrosSintomas" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Outros sintomas ou observações
        </Label>
        <Textarea
          id="outrosSintomas"
          placeholder="Descreva outros sintomas que não estão na lista acima..."
          value={formData.outrosSintomas}
          onChange={(e) => updateForm({ outrosSintomas: e.target.value.slice(0, 500) })}
          rows={3}
          className="mt-1.5"
        />
      </div>
    </div>
  );
};

export default StepSintomas;
