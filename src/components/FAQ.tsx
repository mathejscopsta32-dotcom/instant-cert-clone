import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    q: "Esse tipo de atestado tem validade jurídica?",
    a: "Sim. O documento é emitido por profissional médico com CRM ativo, em conformidade com a Resolução CFM nº 2.314/2022 que regulamenta a telemedicina no Brasil e a Lei 13.989/2020. O atestado possui a mesma validade legal de um emitido presencialmente.",
  },
  {
    q: "O atestado para trabalho é aceito pelo empregador?",
    a: "Sim. O atestado para trabalho emitido pela JustMed tem a mesma validade legal de um presencial, sendo aceito por empregadores em todo o Brasil conforme a legislação de telemedicina. Nosso serviço abrange condições de baixa complexidade.",
  },
  {
    q: "Quanto tempo leva para receber o documento?",
    a: "Após a confirmação do pagamento via Pix (que acontece em segundos), o documento é processado e encaminhado automaticamente para o e-mail informado. Em condições normais, o recebimento ocorre em poucos minutos.",
  },
  {
    q: "Qual o valor do atestado?",
    a: "O valor inicia em R$ 34,99. O preço varia conforme a quantidade de dias de afastamento solicitados: quanto maior o período, maior o valor. O preço final é exibido antes da confirmação do pagamento, sem cobranças adicionais.",
  },
  {
    q: "Que dados são necessários para o pedido?",
    a: "São solicitados dados de identificação (nome completo, CPF, data de nascimento) além de informações sobre o motivo do atendimento. Todos os dados são tratados com sigilo médico e protegidos por criptografia conforme a LGPD.",
  },
  {
    q: "Como funciona a avaliação médica à distância?",
    a: "A avaliação é baseada em uma anamnese digital (questionário médico) elaborada por profissionais de saúde. As respostas permitem ao médico avaliar a condição relatada e emitir o documento quando pertinente. Se for identificada necessidade de exame presencial, o paciente será orientado adequadamente.",
  },
  {
    q: "Qual o período máximo de afastamento coberto?",
    a: "O serviço contempla afastamentos de curta duração, com base na avaliação das informações fornecidas. Períodos mais extensos podem demandar acompanhamento presencial e avaliações complementares.",
  },
  {
    q: "O atestado escolar é aceito pela faculdade?",
    a: "Sim. O atestado escolar emitido por telemedicina possui validade legal e é aceito por escolas, faculdades e universidades em todo o Brasil. O documento é assinado por médico com CRM ativo e pode ser verificado online.",
  },
  {
    q: "Como solicitar atestado de piscina online?",
    a: "O atestado de piscina (atestado de aptidão física para atividades aquáticas) pode ser solicitado online pela plataforma. Basta preencher o formulário, selecionar a opção \"Piscina\" e realizar o pagamento via Pix. Após avaliação médica por telemedicina, o documento é enviado por e-mail em poucos minutos.",
  },
  {
    q: "Como funciona o atestado de comparecimento?",
    a: "O atestado de comparecimento comprova que o paciente esteve em atendimento médico em determinada data e horário. É aceito por empresas e instituições de ensino. Basta preencher o formulário com os dados do atendimento e o documento é emitido digitalmente.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-hero">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">DÚVIDAS</p>
        <h2 className="section-title mb-4">Perguntas frequentes</h2>
        <p className="section-subtitle mb-10">
          Tire suas dúvidas sobre nosso serviço de emissão de atestados.
        </p>

        <Accordion type="single" collapsible className="text-left space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border rounded-xl px-5"
            >
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12">
          <p className="text-foreground font-semibold mb-4">Pronto para solicitar?</p>
          <Link
            to="/selecionar-servico"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Solicitar atestado
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
