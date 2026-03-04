import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Lock } from "lucide-react";

const PoliticaPrivacidade = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">Última atualização: Março de 2026</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
          <section>
            <h2 className="text-lg font-bold text-foreground">1. Introdução</h2>
            <p>
              A presente Política de Privacidade descreve como a plataforma Atestado24h coleta, 
              utiliza, armazena e protege os dados pessoais dos usuários, em conformidade com a 
              Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018) e o sigilo 
              médico previsto no Código de Ética Médica.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados para a prestação de nossos serviços:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Dados de identificação:</strong> nome completo, CPF, data de nascimento, e-mail e telefone;</li>
              <li><strong className="text-foreground">Dados de saúde:</strong> sintomas relatados, histórico médico declarado e informações de saúde necessárias para a avaliação;</li>
              <li><strong className="text-foreground">Dados de pagamento:</strong> comprovantes de pagamento via PIX;</li>
              <li><strong className="text-foreground">Dados de navegação:</strong> endereço IP, cidade (para fins estatísticos) e interações com a plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">3. Finalidade do Tratamento</h2>
            <p>Os dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prestação dos serviços de telemedicina contratados;</li>
              <li>Emissão de documentos médicos;</li>
              <li>Processamento de pagamentos;</li>
              <li>Comunicação com o usuário sobre seu pedido;</li>
              <li>Cumprimento de obrigações legais e regulatórias;</li>
              <li>Melhoria contínua da plataforma e experiência do usuário.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">4. Segurança dos Dados</h2>
            <p>
              Adotamos medidas técnicas e organizacionais rigorosas para proteger seus dados:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-foreground">Criptografia SSL/TLS:</strong> todas as comunicações são criptografadas de ponta a ponta;</li>
              <li><strong className="text-foreground">Armazenamento seguro:</strong> dados sensíveis são armazenados em servidores com certificação de segurança;</li>
              <li><strong className="text-foreground">Acesso restrito:</strong> apenas profissionais autorizados têm acesso aos dados;</li>
              <li><strong className="text-foreground">Sigilo médico:</strong> todos os dados de saúde são protegidos pelo sigilo médico-paciente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">5. Compartilhamento de Dados</h2>
            <p>
              Seus dados pessoais <strong className="text-foreground">não são vendidos, alugados ou compartilhados</strong> com 
              terceiros para fins comerciais. O compartilhamento ocorre apenas:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Com médicos responsáveis pela avaliação e emissão de documentos;</li>
              <li>Com processadores de pagamento, estritamente para efetivação da transação;</li>
              <li>Quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">6. Direitos do Titular</h2>
            <p>
              Conforme a LGPD, você possui os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmação da existência de tratamento de dados;</li>
              <li>Acesso aos dados coletados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
              <li>Portabilidade dos dados;</li>
              <li>Revogação do consentimento.</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato através do e-mail informado na página de Contato.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">7. Cookies</h2>
            <p>
              A plataforma não utiliza cookies de rastreamento de terceiros. Utilizamos apenas 
              armazenamento local (localStorage/sessionStorage) para manter o estado da sessão 
              e preferências do usuário durante a navegação.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">8. Retenção de Dados</h2>
            <p>
              Os dados são mantidos pelo período necessário para a prestação do serviço e 
              cumprimento de obrigações legais. Dados de saúde são retidos conforme exigido 
              pela legislação sanitária vigente (mínimo de 20 anos, conforme Resolução CFM nº 1.821/2007).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">9. Alterações</h2>
            <p>
              Esta política pode ser atualizada periodicamente. A versão mais recente estará 
              sempre disponível nesta página, com a data da última modificação.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PoliticaPrivacidade;
