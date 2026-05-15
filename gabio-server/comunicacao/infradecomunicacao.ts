import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';

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
                    if (!this.processador) return;

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

// como usar:

// Primeiro, importe a classe InfraDeComunicacao no ponto principal do seu backend. Depois, crie uma instância dela usando new InfraDeComunicacao(). Em seguida, use o método definirProcessador() para informar qual função será responsável por processar as mensagens recebidas. Essa função deve receber uma string e retornar uma Promise<string> com a resposta que será enviada ao cliente. Após definir o processador, chame o método iniciarServidor() passando a porta desejada, como 3000. A partir desse momento, a infraestrutura começa a aceitar conexões WebSocket, receber mensagens dos clientes, encaminhar essas mensagens para o processador definido e devolver automaticamente a resposta retornada pelo processador.

