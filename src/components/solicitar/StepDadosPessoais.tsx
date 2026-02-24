import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormData } from "@/pages/Solicitar";

interface Props {
  formData: FormData;
  updateForm: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const StepDadosPessoais = ({ formData, updateForm, errors }: Props) => {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-foreground mb-1">Dados Pessoais</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Preencha seus dados pessoais para emissão do atestado.
      </p>

      <div>
        <Label htmlFor="nomeCompleto">Nome Completo *</Label>
        <Input
          id="nomeCompleto"
          placeholder="Digite seu nome completo"
          value={formData.nomeCompleto}
          onChange={(e) => updateForm({ nomeCompleto: e.target.value.slice(0, 100) })}
          className={errors.nomeCompleto ? "border-destructive" : ""}
        />
        {errors.nomeCompleto && <p className="text-xs text-destructive mt-1">{errors.nomeCompleto}</p>}
      </div>

      <div>
        <Label htmlFor="cpf">CPF *</Label>
        <Input
          id="cpf"
          placeholder="000.000.000-00"
          value={formData.cpf}
          onChange={(e) => updateForm({ cpf: formatCPF(e.target.value) })}
          className={errors.cpf ? "border-destructive" : ""}
        />
        {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
      </div>

      <div>
        <Label htmlFor="email">E-mail *</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={(e) => updateForm({ email: e.target.value.slice(0, 255) })}
          className={errors.email ? "border-destructive" : ""}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="telefone">Telefone / WhatsApp *</Label>
        <Input
          id="telefone"
          placeholder="(00) 00000-0000"
          value={formData.telefone}
          onChange={(e) => updateForm({ telefone: formatPhone(e.target.value) })}
          className={errors.telefone ? "border-destructive" : ""}
        />
        {errors.telefone && <p className="text-xs text-destructive mt-1">{errors.telefone}</p>}
      </div>

      <div>
        <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
        <Input
          id="dataNascimento"
          type="date"
          value={formData.dataNascimento}
          onChange={(e) => updateForm({ dataNascimento: e.target.value })}
          className={errors.dataNascimento ? "border-destructive" : ""}
        />
        {errors.dataNascimento && <p className="text-xs text-destructive mt-1">{errors.dataNascimento}</p>}
      </div>
    </div>
  );
};

export default StepDadosPessoais;
