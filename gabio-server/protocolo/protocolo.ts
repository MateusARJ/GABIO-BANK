import { Operacao, TipoRequisicao } from "../regras-de-negocio/operacoes/requisicao";
import { Resposta } from "../regras-de-negocio/operacoes/resposta";

// Operações válidas do protocolo GBTP
const OPERACOES_VALIDAS: TipoRequisicao[] = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'];

/**
 * Faz o parsing de uma mensagem GBTP textual e converte para o objeto Operacao.
 *
 * Formato esperado da mensagem:
 *   OPERATION:BALANCE
 *   ACCOUNT_ID:1234
 *   TO_ACCOUNT_ID:
 *   VALUE:0
 *
 * Cada linha segue o padrão CHAVE:VALOR, separadas por nova linha (\n).
 *
 * @param mensagem - string contendo a mensagem GBTP recebida do cliente
 * @returns Operacao - objeto com os campos parseados da requisição
 * @throws Error - caso a mensagem esteja mal formatada ou contenha valores inválidos
 */
export function parsearMensagem(mensagem: string): Operacao {
    // Separar a mensagem em linhas e remover linhas vazias
    const linhas = mensagem.split('\n').map(linha => linha.trim()).filter(linha => linha.length > 0);

    // Criar um mapa CHAVE -> VALOR a partir das linhas
    const campos: Map<string, string> = new Map();
    for (const linha of linhas) {
        // Separar apenas no primeiro ":" para permitir valores que contenham ":"
        const indiceSeparador = linha.indexOf(':');
        if (indiceSeparador === -1) {
            throw new Error(`Linha mal formatada (falta separador ":"): "${linha}"`);
        }
        const chave = linha.substring(0, indiceSeparador).trim();
        const valor = linha.substring(indiceSeparador + 1).trim();
        campos.set(chave, valor);
    }

    // Validar que todos os campos obrigatórios estão presentes
    const camposObrigatorios = ['OPERATION', 'ACCOUNT_ID', 'TO_ACCOUNT_ID', 'VALUE'];
    for (const campo of camposObrigatorios) {
        if (!campos.has(campo)) {
            throw new Error(`Campo obrigatório ausente: ${campo}`);
        }
    }

    // Extrair e validar OPERATION
    const operationStr = campos.get('OPERATION')!;
    if (!OPERACOES_VALIDAS.includes(operationStr as TipoRequisicao)) {
        throw new Error(`Operação inválida: "${operationStr}". Operações válidas: ${OPERACOES_VALIDAS.join(', ')}`);
    }
    const operation = operationStr as TipoRequisicao;

    // Extrair e validar ACCOUNT_ID
    const accountIdStr = campos.get('ACCOUNT_ID')!;
    if (accountIdStr === '' || isNaN(Number(accountIdStr))) {
        throw new Error(`ACCOUNT_ID inválido: "${accountIdStr}". Deve ser um número.`);
    }
    const accountId = Number(accountIdStr);

    // Extrair TO_ACCOUNT_ID (pode ser vazio para operações que não são TRANSFER)
    const toAccountIdStr = campos.get('TO_ACCOUNT_ID')!;
    let toAccountId = 0;

    if (operation === 'TRANSFER') {
        // Para TRANSFER, TO_ACCOUNT_ID é obrigatório
        if (toAccountIdStr === '' || isNaN(Number(toAccountIdStr))) {
            throw new Error(`TO_ACCOUNT_ID inválido para TRANSFER: "${toAccountIdStr}". Deve ser um número.`);
        }
        toAccountId = Number(toAccountIdStr);

        // Validar que a conta de origem é diferente da conta de destino
        if (accountId === toAccountId) {
            throw new Error('A conta de origem deve ser diferente da conta de destino.');
        }
    } else {
        // Para outras operações, TO_ACCOUNT_ID pode ser vazio ou zero
        toAccountId = toAccountIdStr === '' ? 0 : Number(toAccountIdStr);
    }

    // Extrair e validar VALUE
    const valueStr = campos.get('VALUE')!;
    if (valueStr === '' || isNaN(Number(valueStr))) {
        throw new Error(`VALUE inválido: "${valueStr}". Deve ser um número.`);
    }
    const value = Number(valueStr);

    // Validar que o valor não é negativo
    if (value < 0) {
        throw new Error(`VALUE não pode ser negativo: ${value}`);
    }

    // Validar que o valor a ser transferido ou sacado seja menor ou igual ao saldo da conta, se for maior retorna saldo insuficiente.
    if (operation === 'WITHDRAW' || operation === 'TRANSFER') {
        if (value > Number(campos.get('BALANCE')!)) {
            throw new Error(`Saldo insuficiente para a operação ${operation}.`);
        }
    }

    // Validar que DEPOSIT, WITHDRAW e TRANSFER possuem valor maior que zero
    if ((operation === 'DEPOSIT' || operation === 'WITHDRAW' || operation === 'TRANSFER') && value <= 0) {
        throw new Error(`VALUE deve ser maior que zero para a operação ${operation}.`);
    }

    return {
        operation,
        accountId,
        toAccountId,
        value
    };
}

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
export function serializarResposta(resposta: Resposta): string {
    // Formatar o saldo com duas casas decimais
    const balanceFormatado = resposta.balance.toFixed(2);

    return [
        `STATUS:${resposta.status}`,
        `MESSAGE:${resposta.message}`,
        `BALANCE:${balanceFormatado}`
    ].join('\n');
}