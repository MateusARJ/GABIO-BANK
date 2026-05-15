// Criando os tipos de requisição feitas para o servidor: BALANCE, DEPOSIT, WITHDRAW, TRANSFER
export type TipoRequisicao = 'BALANCE' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';

// Cada requisição deve seguir esse contrato
export interface Operacao {
    operation: TipoRequisicao;
    accountId: number;
    toAccountId: number;
    value: number;
}