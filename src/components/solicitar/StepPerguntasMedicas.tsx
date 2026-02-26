import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ClipboardList,
  Clock,
  Pill,
  AlertTriangle,
  Heart,
  Baby,
} from "lucide-react";
import type { ConsultaFormData } from "@/pages/SolicitarConsulta";

interface Props {
  formData: ConsultaFormData;
  updateForm: (updates: Partial<ConsultaFormData>) => void;
  errors: Record<string, string>;
}

const inicioOptions = [
  { label: "Hoje", value: "hoje" },
  { label: "Ontem", value: "ontem" },
  { label: "Há 2-3 dias", value: "2-3 dias" },
  { label: "Há mais de uma semana", value: "mais de 1 semana" },
];

const intensidadeOptions = [
  { label: "Leve", value: "leve", color: "bg-green-100 text-green-700 border-green-300" },
  { label: "Moderada", value: "moderada", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { label: "Intensa", value: "intensa", color: "bg-orange-100 text-orange-700 border-orange-300" },
  { label: "Muito intensa", value: "muito intensa", color: "bg-red-100 text-red-700 border-red-300" },
];

const StepPerguntasMedicas = ({ formData, updateForm, errors }: Props) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Avaliação Médica</h2>
          <p className="text-xs text-muted-foreground">
            Responda as perguntas abaixo para que o médico possa avaliar seu caso.
          </p>
        </div>
      </div>

      {/* Quando começaram os sintomas */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Quando começaram os sintomas?
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {inicioOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateForm({ inicioSintomas: opt.value })}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                formData.inicioSintomas === opt.value
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.inicioSintomas && <p className="text-xs text-destructive">{errors.inicioSintomas}</p>}
      </div>

      {/* Intensidade */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-primary" />
          Qual a intensidade dos sintomas?
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {intensidadeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateForm({ intensidade: opt.value })}
              className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                formData.intensidade === opt.value
                  ? `${opt.color} ring-2 ring-primary/20`
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.intensidade && <p className="text-xs text-destructive">{errors.intensidade}</p>}
      </div>

      {/* Medicamentos */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Pill className="w-4 h-4 text-primary" />
          Está tomando algum medicamento atualmente?
        </Label>
        <div className="flex gap-2">
          {["Sim", "Não"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateForm({ tomaMedicamento: opt.toLowerCase() as "sim" | "nao" })}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                formData.tomaMedicamento === opt.toLowerCase()
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {formData.tomaMedicamento === "sim" && (
          <Textarea
            placeholder="Quais medicamentos está tomando?"
            value={formData.medicamentos}
            onChange={(e) => updateForm({ medicamentos: e.target.value.slice(0, 300) })}
            rows={2}
            className="mt-2"
          />
        )}
      </div>

      {/* Doenças crônicas */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          Possui alguma doença crônica ou condição de saúde?
        </Label>
        <div className="flex gap-2">
          {["Sim", "Não"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateForm({ possuiDoencaCronica: opt.toLowerCase() as "sim" | "nao" })}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                formData.possuiDoencaCronica === opt.toLowerCase()
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {formData.possuiDoencaCronica === "sim" && (
          <Textarea
            placeholder="Quais doenças ou condições?"
            value={formData.doencasCronicas}
            onChange={(e) => updateForm({ doencasCronicas: e.target.value.slice(0, 300) })}
            rows={2}
            className="mt-2"
          />
        )}
      </div>

      {/* Alergias */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Baby className="w-4 h-4 text-primary" />
          Possui alguma alergia a medicamentos?
        </Label>
        <div className="flex gap-2">
          {["Sim", "Não"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateForm({ possuiAlergia: opt.toLowerCase() as "sim" | "nao" })}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                formData.possuiAlergia === opt.toLowerCase()
                  ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                  : "border-border hover:bg-muted text-foreground"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        {formData.possuiAlergia === "sim" && (
          <Textarea
            placeholder="Quais alergias?"
            value={formData.alergias}
            onChange={(e) => updateForm({ alergias: e.target.value.slice(0, 300) })}
            rows={2}
            className="mt-2"
          />
        )}
      </div>

      {/* Observações adicionais */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">
          Alguma informação adicional para o médico?
        </Label>
        <Textarea
          placeholder="Descreva aqui qualquer informação que considere importante..."
          value={formData.observacoes}
          onChange={(e) => updateForm({ observacoes: e.target.value.slice(0, 500) })}
          rows={3}
        />
      </div>
    </div>
  );
};

export default StepPerguntasMedicas;
