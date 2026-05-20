import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

/**
 * Classe responsável por gerenciar a comunicação via WebSocket.
 * Permite iniciar um servidor WebSocket e definir um processador de mensagens.
 * O processador é uma função assíncrona que recebe uma mensagem string e retorna uma resposta string.
 */

export class InfraDeComunicacao {

    private processador: ((mensagem: string) => Promise<string>) | null = null;

    public iniciarServidor(porta: number): void {

        const servidorHttp = http.createServer((req, res) => {

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.end(
                'Servidor WebSocket em execução'
            );

        });

        const servidorWebSocket = new WebSocketServer({
            server: servidorHttp
        });

        servidorWebSocket.on('connection', (cliente: WebSocket) => {

            console.log('Cliente conectado');

            cliente.on('message', async (dados) => {

                try {

                    const mensagem = dados.toString();

                    // valido se a função de processamento foi definida
                    if (!this.processador){
                        console.error('Processador de mensagens não definido');
                        return;
                    };

                    const resposta = await this.processador(mensagem);

                    if (cliente.readyState === WebSocket.OPEN) {

                        cliente.send(resposta);
                    }

                } catch (erro) {

                    console.error('Erro ao processar mensagem:', erro);
                }

            });

            cliente.on('close', () => {

                console.log('Cliente desconectado');
            });

            cliente.on('error', (erro) => {

                console.error('Erro no socket:', erro);
            });

        });

        servidorHttp.listen(porta, () => {

            console.log(`Servidor WebSocket ouvindo na porta ${porta}`);

        });

        servidorHttp.on('error', (erro) => {

            console.error('Erro no servidor:', erro);

        });

    }

    public definirProcessador(callback: (mensagem: string) => Promise<string>): void {

        this.processador = callback;
    }

}


