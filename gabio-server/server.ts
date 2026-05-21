import { InfraDeComunicacao } from './comunicacao/infradecomunicacao';
import { processadorDeMensagens } from './comunicacao/processadorMensagem';

const PORT = Number(process.env.PORT) || 7001;

const infra = new InfraDeComunicacao();

infra.definirProcessador(processadorDeMensagens);

infra.iniciarServidor(PORT);

console.log(`Servidor iniciado na porta ${PORT}`);

