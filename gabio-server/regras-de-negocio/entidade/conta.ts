// Criando o modelo de conta 
export class Conta {
    private id: number;
    private balance: number;

    constructor(id: number, balance: number) {
        this.id = id;
        this.balance = balance;
    }

    // Checar o ID (getId)
    public getId(): number {
        return this.id;
    }

    // BALANCE: Checar o saldo atual da conta
    public getBalance(): number {
        return this.balance;
    }

    // Todos os outros metodos vão usar esse formato
    public alterarSaldo(novoSaldo: number): void {
        this.balance = novoSaldo;
    }
}