// Repositorio de contas é responsavel por guardar nossas contas na memoria
import { Conta } from "../entidade/conta";

export class RepositorioContas {
    private contas: Map<number, Conta> = new Map([
        [1001, new Conta(1001, 1000)],
        [1002, new Conta(1002,500)],
        [1003, new Conta(1003, 750)],
    ]);

    // Buscar os IDs 
    buscar(id: number): Conta | undefined {
        return this.contas.get(id);
    }

    // Verificar se a conta existe
    existe(id: number): boolean {
        return this.contas.has(id);
    }
}