import { Resposta } from "../regras-de-negocio/operacoes/resposta";

/**
 * Serializa um objeto Resposta para o formato textual GBTP.
 *
 * Formato de saída:
 *   STATUS:OK
 *   MESSAGE:Saldo consultado com sucesso
 *   BALANCE:250.00
 *
 * @param resposta - objeto Resposta retornado pelo ServicoBancario
 * @returns string - mensagem GBTP formatada para envio ao cliente
 */
export class Serializador {
    sucesso(resposta: Resposta): string {
        return [
            `STATUS:${resposta.status}`,
            `MESSAGE:${resposta.message}`,
            `BALANCE:${resposta.balance.toFixed(2)}`
        ].join("\n");
    }

    erro(message: string): string {
        return [
            `STATUS:ERROR`,
            `MESSAGE:${message}`,
            `BALANCE:0.00`
        ].join("\n");
    }
}


