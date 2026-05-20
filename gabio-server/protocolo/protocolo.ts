import { Operacao, TipoRequisicao } from "../regras-de-negocio/operacoes/requisicao";

// Operações válidas do protocolo GBTP
const OPERACOES_VALIDAS: TipoRequisicao[] = ['BALANCE', 'DEPOSIT', 'WITHDRAW', 'TRANSFER'];

function parsearInteiroPositivo(nomeCampo: string, valorCampo: string): number {
    const numero = Number(valorCampo);

    if (
        valorCampo === '' ||
        !Number.isFinite(numero) ||
        !Number.isInteger(numero) ||
        numero <= 0
    ) {
        throw new Error(`${nomeCampo} inválido: "${valorCampo}". Deve ser um número inteiro e maior que zero.`);
    }

    return numero;
}

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
export class ParsearMensagem {
    parsear(mensagem: string): Operacao {
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

            if (campos.has(chave)) {
                throw new Error(`Campo duplicado na requisição: ${chave}`);
            }

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
        const accountId = parsearInteiroPositivo('ACCOUNT_ID', accountIdStr);

        // Extrair TO_ACCOUNT_ID (pode ser vazio para operações que não são TRANSFER)
        const toAccountIdStr = campos.get('TO_ACCOUNT_ID')!;
        let toAccountId = 0;

        if (operation === 'TRANSFER') {
            // Para TRANSFER, TO_ACCOUNT_ID é obrigatório
            toAccountId = parsearInteiroPositivo('TO_ACCOUNT_ID', toAccountIdStr);
        }
        // Para outras operações, TO_ACCOUNT_ID só pode ser vazio ou zero
        else {

            if (toAccountIdStr !== undefined && toAccountIdStr !== '' && toAccountIdStr !== '0') {
                throw new Error(`TO_ACCOUNT_ID deve estar vazio ou ser 0 para a operação ${operation}.`);
            }

            toAccountId = 0;
        }

        // Extrair e validar VALUE
        const valueStr = campos.get('VALUE')!;
        const value = Number(valueStr);
        // Valida se VALUE é um número válido
        if (valueStr === '' || !Number.isFinite(value)) {
            throw new Error(`VALUE inválido: "${valueStr}". Deve ser um número.`);
        }

        // Valida VALUE para BALANCE
        if (operation === 'BALANCE') {
            if (value !== 0) {
                throw new Error(`O campo VALUE deve ser zero para a operação ${operation}.`);
            }
        }

        // Valida VALUE para DEPOSIT, WITHDRAW e TRANSFER
        if (operation === 'DEPOSIT' || operation === 'WITHDRAW' || operation === 'TRANSFER') {
            if (value <= 0) {
                throw new Error(`O campo VALUE deve ser maior que zero para a operação ${operation}.`);
            }
        }

        return {
            operation,
            accountId,
            toAccountId,
            value
        };
    }
}
