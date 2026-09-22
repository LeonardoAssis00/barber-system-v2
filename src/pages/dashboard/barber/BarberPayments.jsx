import BackButton from "../../../components/BackButton";

export default function BarberPayment() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="absolute top-6 left-6">
        <BackButton />
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl flex flex-col gap-6">
        {/* Título */}
        <div className="flex flex-col gap-1">
          <h1 className="text-zinc-100 text-xl font-bold">
            Acesso temporariamente bloqueado
          </h1>
          <p className="text-zinc-500 text-sm">
            Seu período de teste gratuito foi encerrado
          </p>
        </div>

        {/* Aviso */}
        <div className="bg-zinc-800/40 border border-zinc-700 rounded-lg p-4">
          <p className="text-zinc-300 text-sm leading-relaxed">
            Para continuar utilizando o painel do barbeiro e gerenciar sua
            barbearia, é necessário realizar o pagamento da assinatura.
          </p>
        </div>

        {/* Informações do PIX */}
        <div className="flex flex-col gap-3">
          <h2 className="text-zinc-100 font-semibold">Pagamento via PIX</h2>

          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 flex flex-col gap-2">
            <span className="text-zinc-500 text-xs">Chave PIX</span>
            <strong className="text-amber-500 text-sm select-all">
              sua-chave-pix@exemplo.com
            </strong>

            <span className="text-zinc-500 text-xs mt-2">Valor</span>
            <strong className="text-zinc-100 text-sm">R$ XX,XX / mês</strong>
          </div>
        </div>

        {/* Instruções */}
        <div className="text-zinc-400 text-sm leading-relaxed">
          <p>
            Após realizar o pagamento, sua conta será liberada manualmente pela
            nossa equipe.
          </p>
          <p className="mt-2">
            Caso já tenha efetuado o pagamento, aguarde a confirmação.
          </p>
        </div>

        {/* Botão opcional */}
        <button
          disabled
          className="mt-4 bg-amber-600/60 text-zinc-900 font-semibold py-3 rounded-lg cursor-not-allowed"
        >
          Aguardando confirmação de pagamento
        </button>
      </div>
    </section>
  );
}
