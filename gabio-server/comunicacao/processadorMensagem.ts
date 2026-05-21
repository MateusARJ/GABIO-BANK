import { ParsearMensagem } from '../protocolo/protocolo';
import { Serializador } from '../protocolo/serializarResposta';
import { RepositorioContas } from '../regras-de-negocio/repositorio/repositorioContas';
import { ServicoBancario } from '../regras-de-negocio/servicos/servicoBancario';

const repositorio = new RepositorioContas();
const servico = new ServicoBancario(repositorio);
const parser = new ParsearMensagem();
const serializador = new Serializador();

export async function processadorDeMensagens(mensagem: string): Promise<string> {

    try {

        const operacao = parser.parsear(mensagem);
        const resposta = servico.executarOperacao(operacao);
        return  serializador.sucesso(resposta);
    
    } catch (err) {

        const message = err instanceof Error ? err.message : String(err);
        return  serializador.erro(message);

    }

}