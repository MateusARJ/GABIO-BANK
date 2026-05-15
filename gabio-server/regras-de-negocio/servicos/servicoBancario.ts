// Servico bancaria, é aqui onde todas as operações acontecem
import { Operacao } from "../operacoes/requisicao";
import { Resposta } from "../operacoes/resposta";
import { RepositorioContas } from "../repositorio/repositorioContas";

export class ServicoBancario {
    private repositorioContas: RepositorioContas;

    constructor(repositorioContas: RepositorioContas) {
        this.repositorioContas = repositorioContas;
    }

    executarOperacao(operacao: Operacao): Resposta {
        switch(operacao.operation) {
            case 'BALANCE':  
                return this.balance(operacao);
            case 'DEPOSIT':
                return this.deposit(operacao);
            case 'WITHDRAW':
                return this.withdraw(operacao);
            case 'TRANSFER':
                return this.transfer(operacao);
            default: 
                return {
                    status: 'ERROR',
                    message: 'Operação inválida.',
                    balance: 0
                }
        }
    }

    // BALANCE: Caso de uso onde o cliente deseja observar seu saldo atual
    public balance(op:Operacao): Resposta {
        const conta = this.repositorioContas.buscar(op.accountId);

        if(!conta) {
            return {
                status: 'ERROR',
                message: 'Conta de origem inexistente.',
                balance: 0
            }
        }

        return {
            status: 'OK',
            message: 'Saldo consultado com sucesso',
            balance: conta.getBalance()
        }
    }

    // DEPOSIT: Caso de uso onde o cliente deseja fazer um desposito
    public deposit(op: Operacao): Resposta {
        const conta = this.repositorioContas.buscar(op.accountId);

        if(!conta) {
            return {
                status: 'ERROR',
                message: 'Conta de origem inexistente.',
                balance: 0
            }
        }

        // Executando o DEPOSITO 
        conta.alterarSaldo(conta.getBalance() + op.value);

        return {
            status: 'OK',
            message: 'Depósito realizado com sucesso.',
            balance: conta.getBalance()
        }
    }

    // WITHDRAW: Caso de uso onde o cliente deseja fazer uma saque
    public withdraw(op: Operacao): Resposta {
        const conta = this.repositorioContas.buscar(op.accountId);

            if(!conta) {
            return {
                status: 'ERROR',
                message: 'Conta de origem inexistente.',
                balance: 0
            }
        }

        if(conta.getBalance() < op.value) {
            return {
                status: 'ERROR',
                message: 'Saldo insuficiente.',
                balance: conta.getBalance()
            }
        }

        // Executado o saque
        conta.alterarSaldo(conta.getBalance() - op.value);

        return {
            status: 'OK',
            message: 'Saque efetuado.',
            balance: conta.getBalance()
        }
    }

    // TRANSFER: Caso de uso onde o cliente deseja fazer um saque
    public transfer(op: Operacao): Resposta {
        const contaOrigem = this.repositorioContas.buscar(op.accountId);
        const contaDestino = this.repositorioContas.buscar(op.toAccountId);

        if(!contaOrigem) {
            return {
                status: 'ERROR',
                message: 'Conta de origem inexistente.',
                balance: 0
            }
        }

        if(!contaDestino) {
            return {
                status: 'ERROR',
                message: 'Conta de destino inexistente.',
                balance: 0
            }
        }

        if(contaOrigem.getBalance() < op.value) {
            return {
                status: 'ERROR',
                message: 'Saldo insuficiente.',
                balance: contaOrigem.getBalance()
            }
        }
        
        // Executando a transferencia da conta de ORIGEM --> conta de DESTINO
        contaOrigem.alterarSaldo(contaOrigem.getBalance() - op.value);
        contaDestino.alterarSaldo(contaDestino.getBalance() + op.value);

        return {
            status: 'OK',
            message: 'Transferência conluída.',
            balance: contaOrigem.getBalance()
        }

    }
}