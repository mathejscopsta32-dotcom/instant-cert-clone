import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CreditCard, Mail, Phone, Calendar } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Dados Pessoais</h2>
          <p className="text-xs text-muted-foreground">
            Preencha seus dados para emissão do atestado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <Label htmlFor="nomeCompleto" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nome Completo *</Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="nomeCompleto"
              placeholder="Digite seu nome completo"
              value={formData.nomeCompleto}
              onChange={(e) => updateForm({ nomeCompleto: e.target.value.slice(0, 100) })}
              className={`pl-10 h-11 ${errors.nomeCompleto ? "border-destructive" : ""}`}
            />
          </div>
          {errors.nomeCompleto && <p className="text-xs text-destructive mt-1">{errors.nomeCompleto}</p>}
        </div>

        <div>
          <Label htmlFor="cpf" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CPF *</Label>
          <div className="relative mt-1.5">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="cpf"
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChange={(e) => updateForm({ cpf: formatCPF(e.target.value) })}
              className={`pl-10 h-11 ${errors.cpf ? "border-destructive" : ""}`}
            />
          </div>
          {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
        </div>

        <div>
          <Label htmlFor="dataNascimento" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data de Nascimento *</Label>
          <div className="relative mt-1.5">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="dataNascimento"
              type="date"
              value={formData.dataNascimento}
              onChange={(e) => updateForm({ dataNascimento: e.target.value })}
              className={`pl-10 h-11 ${errors.dataNascimento ? "border-destructive" : ""}`}
            />
          </div>
          {errors.dataNascimento && <p className="text-xs text-destructive mt-1">{errors.dataNascimento}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">E-mail *</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => updateForm({ email: e.target.value.slice(0, 255) })}
              className={`pl-10 h-11 ${errors.email ? "border-destructive" : ""}`}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label htmlFor="telefone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Telefone / WhatsApp *</Label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={(e) => updateForm({ telefone: formatPhone(e.target.value) })}
              className={`pl-10 h-11 ${errors.telefone ? "border-destructive" : ""}`}
            />
          </div>
          {errors.telefone && <p className="text-xs text-destructive mt-1">{errors.telefone}</p>}
        </div>
      </div>
    </div>
  );
};

export default StepDadosPessoais;
