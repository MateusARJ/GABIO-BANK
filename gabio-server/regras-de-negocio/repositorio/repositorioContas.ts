// Repositorio de contas é responsavel por guardar nossas contas na memoria
import { Conta } from "../entidade/conta";
import { iRepositorioContas } from "../contratoRepositorio/iRepositorioContas";

export class RepositorioContas implements iRepositorioContas {
    // Vamos repartir a responsabilidade do entre servico + conta + repositorio
    // O sistema bancario vai ser responsavel por gerenciar as operacoes, enquanto o repositorio por orquestrar o que e feito
    private contas: Map<number, Conta> = new Map([
        [1001, new Conta(1001, 1000)],
        [1002, new Conta(1002,500)],
        [1003, new Conta(1003, 750)],
    ]);

    // Buscar os IDs (Funciona como indetificador geral, verificar se as contas existen antes de retornar)
    buscar(id: number): Conta | undefined {
        return this.contas.get(id);
    }

    /**
     * Responsabilidade: buscar o saldo da conta de origem quando a operacao for igual a "BALANCE"
     * @param id ID da conta de origem
     * @returns retorna o saldo atual caso contrario retorna 'undefined'
     */
    obterSaldo(id: number): number | undefined {
        return this.contas.get(id)?.getBalance();
    }

    /**
     * Responsabilidade: realiza o deposito na conta de origem quando o tipo de operacao for igual a "DEPOSIT"
     * @param id ID da conta de origem
     * @param valor valor que o cliente deseja depositar na conta
     * @returns retorna a conta atualizada com o valor final do saldo no caso de sucesso!
     */
    realizarDeposito(id: number, valor: number): Conta | undefined {
        const conta = this.buscar(id);

        if(!conta) {
            return undefined;
        }

        conta.alterarSaldo(conta.getBalance() + valor);
        return conta;
    }

    /**
     * Responsabilidade: realiza o saque na conta de origem quando o tipo de operacao for igual a "WITHDRAW"
     * @param id ID da conta de origem
     * @param valor valor que o cliente desejar retirar da conta de origem
     * @returns retorna a conta de origem com o valor atualizado apos o saque no caso de sucesso!
     */
    realizarSaque(id: number, valor: number): Conta | undefined {
        const conta = this.buscar(id);

        if(!conta) {
            return undefined;
        }

        conta.alterarSaldo(conta.getBalance() - valor);
        return conta;
    }

    /**
     * Responsabilidade: realiza a transferencia de um valor de uma conta para outra quando o tipo de operacao for igual a "TRANSFER" 
     * @param idOrigem ID da conta de origem
     * @param idDestino ID da conta de destino
     * @param valor valor que o cliente deseja transferir de uma conta para outra
     * @returns retorna a conta de origem apos a transferencia no caso de sucesso!
     */
    realizarTransferencia(idOrigem: number, idDestino: number, valor: number): Conta | undefined {
        const contaOrigem = this.buscar(idOrigem);
        const contaDestino = this.buscar(idDestino);

        if(!contaOrigem || !contaDestino) {
            return undefined;
        }

        contaOrigem.alterarSaldo(contaOrigem.getBalance() - valor);
        contaDestino.alterarSaldo(contaDestino.getBalance() + valor);

        return contaOrigem;
    }
}
