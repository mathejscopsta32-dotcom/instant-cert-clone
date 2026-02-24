import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "O atestado médico online é válido legalmente?",
    a: "Sim, o atestado médico digital é válido legalmente em todo o território nacional, conforme a Resolução CFM nº 2.299/21. Ele possui assinatura digital com certificado ICP-Brasil, garantindo sua autenticidade e validade jurídica para fins trabalhistas e estudantis.",
  },
  {
    q: "Quanto tempo leva para receber o atestado médico online?",
    a: "O processo é extremamente rápido. Após o preenchimento do questionário e confirmação do pagamento via PIX, o atestado é gerado e disponibilizado em poucos minutos.",
  },
  {
    q: "Por quanto tempo posso me afastar com o atestado médico online?",
    a: "O tempo de afastamento depende da avaliação dos seus sintomas e do protocolo médico adequado para a sua condição de saúde.",
  },
  {
    q: "E se meu empregador não aceitar o atestado médico online?",
    a: "Por lei (Lei nº 605/49 e Resolução CFM nº 1.658/2002), o atestado médico digital com assinatura válida (ICP-Brasil) deve ser aceito da mesma forma que o atestado em papel.",
  },
  {
    q: "Preciso fazer uma consulta por vídeo para conseguir um atestado online?",
    a: "Geralmente não. A triagem é realizada através de um questionário detalhado de saúde (anamnese), que é avaliado por nossos médicos. Se necessário, uma interação adicional pode ser solicitada.",
  },
  {
    q: "Como funciona o pagamento para atestado médico online?",
    a: "O pagamento é realizado de forma segura e prática através do PIX, garantindo a liberação imediata do seu documento após a aprovação.",
  },
  {
    q: "Posso pagar o atestado médico online com boleto bancário?",
    a: "Para garantir a agilidade e entrega em minutos, atualmente trabalhamos exclusivamente com PIX e Cartão de Crédito.",
  },
  {
    q: "Como funciona a política de reembolso para atestado médico online?",
    a: "Caso seu atestado não seja emitido por qualquer critério médico, devolvemos 100% do seu dinheiro.",
  },
  {
    q: "Quem são os médicos que emitem os atestados online?",
    a: "Trabalhamos com uma rede de médicos parceiros, todos devidamente registrados no Conselho Regional de Medicina (CRM) e habilitados para telemedicina.",
  },
  {
    q: "Os médicos que emitem atestados online são licenciados?",
    a: "Sim, todos os médicos emissores possuem CRM ativo e certificado digital para assinatura válida em todo território nacional.",
  },
  {
    q: "O atestado médico online serve para justificar faltas em qualquer situação?",
    a: "Serve para justificar faltas no trabalho, escola ou faculdade por motivos de doença, conforme a legislação trabalhista e educacional.",
  },
  {
    q: "Como funciona o processo de emissão do atestado médico online?",
    a: "1. Você responde um questionário sobre sua saúde. 2. Realiza o pagamento. 3. O médico avalia. 4. Se aprovado, você baixa o PDF assinado.",
  },
  {
    q: "Meus dados estão seguros ao solicitar um atestado médico online?",
    a: "Absolutamente. Utilizamos criptografia de ponta e seguimos rigorosamente a Lei Geral de Proteção de Dados (LGPD) e o sigilo médico.",
  },
  {
    q: "Posso solicitar atestado médico online para outra pessoa?",
    a: "Sim, desde que você forneça os dados corretos do paciente (nome, CPF, sintomas) durante o preenchimento.",
  },
  {
    q: "O serviço de atestado médico online está disponível 24 horas por dia?",
    a: "Sim! Nossa plataforma funciona 24 horas por dia, 7 dias por semana, inclusive feriados.",
  },
  {
    q: "Como conseguir um atestado médico no Brasil?",
    a: "Você pode ir a uma consulta presencial ou utilizar serviços de telemedicina regulamentados como o nosso, que é mais rápido e prático.",
  },
  {
    q: "O que diz a lei sobre o atestado médico no Brasil?",
    a: "A lei valida o uso da telemedicina e a emissão de documentos médicos digitais, desde que assinados com certificado digital ICP-Brasil.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-hero">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="section-label mb-3">DÚVIDAS</p>
        <h2 className="section-title mb-4">Perguntas Frequentes</h2>
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
      </div>
    </section>
  );
};

export default FAQ;
