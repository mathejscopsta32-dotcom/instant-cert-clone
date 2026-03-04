import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck } from "lucide-react";

const TermosDeUso = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">Última atualização: Março de 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar e utilizar os serviços disponibilizados pela plataforma Atestado24h ("Plataforma"), 
              operada sob a responsabilidade do Dr. Rodrigo V. Vasconcelos (CRM/SP 142.857), você concorda 
              integralmente com os presentes Termos de Uso. Caso não concorde com qualquer disposição, 
              solicitamos que não utilize nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Descrição dos Serviços</h2>
            <p>
              A Plataforma oferece serviços de telemedicina, incluindo emissão de atestados médicos digitais 
              e consultas médicas online, em conformidade com a Resolução CFM nº 2.314/2022 e demais 
              regulamentações vigentes sobre telemedicina no Brasil.
            </p>
            <p>
              Os serviços são prestados por médicos devidamente registrados no Conselho Regional de Medicina (CRM), 
              com certificação digital ICP-Brasil para assinatura de documentos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. Condições de Uso</h2>
            <p>O usuário declara e garante que:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Possui pelo menos 18 anos de idade ou autorização de responsável legal;</li>
              <li>As informações fornecidas são verdadeiras, completas e atualizadas;</li>
              <li>Não utilizará os serviços para fins ilícitos ou fraudulentos;</li>
              <li>Compreende que a avaliação médica é baseada nas informações declaradas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Pagamento</h2>
            <p>
              Os pagamentos são processados via PIX através de gateways de pagamento seguros. 
              O valor do serviço é informado previamente ao usuário antes da confirmação. 
              Após a confirmação do pagamento, o documento é disponibilizado digitalmente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Política de Reembolso</h2>
            <p>
              Caso o atestado não seja emitido por critério médico, o valor pago será devolvido 
              integralmente ao usuário. Solicitações de reembolso devem ser realizadas em até 7 dias 
              após o pagamento.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Limitação de Responsabilidade</h2>
            <p>
              A Plataforma não se responsabiliza por informações falsas ou incompletas fornecidas 
              pelo usuário. O uso indevido do atestado médico é de responsabilidade exclusiva do 
              usuário, sujeito às penalidades previstas em lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo da Plataforma, incluindo textos, logotipos, imagens e software, 
              é protegido por direitos autorais e propriedade intelectual. É proibida a reprodução 
              sem autorização prévia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Alterações nos Termos</h2>
            <p>
              Reservamo-nos o direito de alterar estes Termos a qualquer momento. As alterações 
              serão publicadas nesta página com a data de atualização. O uso contínuo da Plataforma 
              após alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Foro</h2>
            <p>
              Para a resolução de eventuais controvérsias, fica eleito o foro da comarca de São Paulo/SP, 
              com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosDeUso;
