// Criando o contrato para a resposta
export interface Resposta {
    status: 'OK' | 'ERROR';
    message: string;
    balance: number;
}