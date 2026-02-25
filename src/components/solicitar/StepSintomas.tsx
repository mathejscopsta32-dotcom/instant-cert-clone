import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormData } from "@/pages/Solicitar";

interface Props {
  formData: FormData;
  updateForm: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const sintomasOpcoes = [
  "🧠 Dor de cabeça / Enxaqueca",
  "🌡️ Febre",
  "💊 Dor no corpo / Mal-estar",
  "⚕️ Náusea / Vômito",
  "🏥 Diarreia",
  "🩺 Dor de garganta",
  "🫁 Gripe / Resfriado",
  "🩻 Dor abdominal / Cólica",
  "💉 Tontura / Vertigem",
  "🦷 Dor lombar / Costas",
  "🧬 Ansiedade / Crise emocional",
  "🔬 Alergia",
];

const StepSintomas = ({ formData, updateForm, errors }: Props) => {
  const toggleSintoma = (sintoma: string) => {
    const updated = formData.sintomas.includes(sintoma)
      ? formData.sintomas.filter((s) => s !== sintoma)
      : [...formData.sintomas, sintoma];
    updateForm({ sintomas: updated });
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground mb-1">Sintomas</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Selecione os sintomas que você está apresentando.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sintomasOpcoes.map((sintoma) => (
          <label
            key={sintoma}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              formData.sintomas.includes(sintoma)
                ? "border-primary bg-secondary"
                : "border-border hover:bg-muted"
            }`}
          >
            <Checkbox
              checked={formData.sintomas.includes(sintoma)}
              onCheckedChange={() => toggleSintoma(sintoma)}
            />
            <span className="text-sm text-foreground">{sintoma}</span>
          </label>
        ))}
      </div>

      {errors.sintomas && <p className="text-xs text-destructive mt-1">{errors.sintomas}</p>}

      <div>
        <Label htmlFor="outrosSintomas">Outros sintomas ou observações</Label>
        <Textarea
          id="outrosSintomas"
          placeholder="Descreva outros sintomas que não estão na lista acima..."
          value={formData.outrosSintomas}
          onChange={(e) => updateForm({ outrosSintomas: e.target.value.slice(0, 500) })}
          rows={3}
        />
      </div>
    </div>
  );
};

export default StepSintomas;
