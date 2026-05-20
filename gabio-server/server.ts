import { InfraDeComunicacao } from './comunicacao/infradecomunicacao';
import { ParsearMensagem } from './protocolo/protocolo';
import { Serializador } from './protocolo/serializarResposta';
import { RepositorioContas } from './regras-de-negocio/repositorio/repositorioContas';
import { ServicoBancario } from './regras-de-negocio/servicos/servicoBancario';

const PORT = Number(process.env.PORT) || 7001;

const repositorio = new RepositorioContas();
const servico = new ServicoBancario(repositorio);
const infra = new InfraDeComunicacao();

const parser = new ParsearMensagem();
const serializador = new Serializador();

infra.definirProcessador(async (mensagem: string) => {
  try {
    const operacao = parser.parsear(mensagem);
    const resposta = servico.executarOperacao(operacao);
    return serializador.sucesso(resposta);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return serializador.erro(message);
  }
});

infra.iniciarServidor(PORT);

console.log(`Servidor iniciado na porta ${PORT}`);