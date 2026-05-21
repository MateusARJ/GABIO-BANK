import { Conta } from "../entidade/conta";

// Para implementar um repositorio de contas devem seguir esse contrato
export interface iRepositorioContas {
    buscar(id: number): Conta | undefined;
    obterSaldo(id: number): number | undefined;
    realizarDeposito(id: number, valor: number): Conta | undefined;
    realizarSaque(id: number, valor: number): Conta | undefined;
    realizarTransferencia(idOrigem: number, idDestino: number, valor: number): Conta | undefined;
}