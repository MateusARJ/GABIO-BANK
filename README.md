# Gábio Bank — GBTP (Gabio Bank Transaction Protocol)

Análise e Desenvolvimento de Sistemas<br>
Disciplina: Redes de Computadores<br>
Professor: Iallen Gábio<br>
Alunos:<br>

Mailson - Regras de negócio<br>
Mateus - Protocolo<br>
Eric - Servidor<br>

## Introdução

Este repositório contém a implementação do servidor e dos componentes para o protocolo de aplicação GBTP (Gabio Bank Transaction Protocol), desenvolvido como atividade da disciplina de Redes de Computadores.

## Objetivo do Projeto

O objetivo é consolidar conceitos de protocolos da camada de aplicação, através de uma aplicação cliente–servidor simples que permite consultar saldo, realizar depósitos, saques e transferências entre contas usando um protocolo textual personalizado chamado GBTP.

## Estrutura do Repositório

- `gabio-client/` — cliente web (HTML + TypeScript) que se comunica por WebSocket (não incluído aqui na implementação atual do servidor).
- `gabio-server/` — servidor Node.js + TypeScript que processa mensagens GBTP e mantém contas em memória.
- `package.json` — scripts de build/execução.

## O Protocolo GBTP

GBTP é um protocolo textual inspirado no formato chave:valor (semelhante ao CNET). Mensagens são compostas por pares `CHAVE:VALOR`, cada par em sua própria linha, separados por `\n`. Todas as requisições e respostas usam o mesmo conjunto de campos para facilitar o parsing.

Formato de requisição (sempre estas 4 linhas, ordem não sensível se o parser for implementado assim):

- `OPERATION:<tipo>` — Tipo da operação: `BALANCE`, `DEPOSIT`, `WITHDRAW`, `TRANSFER`.
- `ACCOUNT_ID:<id>` — ID numérico da conta de origem.
- `TO_ACCOUNT_ID:<id_destino>` — ID numérico da conta destino (somente para `TRANSFER`; para outras operações pode ficar vazio).
- `VALUE:<valor>` — Valor numérico da operação (pode ser `0` para `BALANCE`).

Exemplo de requisição (consulta de saldo):

```
OPERATION:BALANCE
ACCOUNT_ID:1001
TO_ACCOUNT_ID:
VALUE:0
```

Formato de resposta:

- `STATUS:<OK|ERROR>` — Resultado do processamento.
- `MESSAGE:<texto>` — Mensagem descritiva.
- `BALANCE:<valor>` — Saldo atual da conta principal (quando aplicável). Sempre enviado quando possível.

Exemplo de resposta (sucesso):

```
STATUS:OK
MESSAGE:Saldo consultado com sucesso
BALANCE:1000.00
```

Exemplo de resposta (erro):

```
STATUS:ERROR
MESSAGE:Conta de destino inexistente
BALANCE:225.00
```

### Operações suportadas

- `BALANCE`: retorna o saldo atual da conta (`VALUE` deve ser 0).
- `DEPOSIT`: adiciona `VALUE` ao saldo da `ACCOUNT_ID`.
- `WITHDRAW`: subtrai `VALUE` do saldo da `ACCOUNT_ID` (falha se saldo insuficiente).
- `TRANSFER`: move `VALUE` de `ACCOUNT_ID` para `TO_ACCOUNT_ID` (valida existência e diferença entre contas; falha se saldo insuficiente).

### Regras de validação

- Todos os campos (`OPERATION`, `ACCOUNT_ID`, `TO_ACCOUNT_ID`, `VALUE`) devem estar presentes na requisição.
- `ACCOUNT_ID` e `TO_ACCOUNT_ID` devem ser inteiros quando presentes.
- `VALUE` deve ser numérico e não-negativo.
- Operações `DEPOSIT`, `WITHDRAW` e `TRANSFER` exigem `VALUE > 0`.
- Em `TRANSFER`, `TO_ACCOUNT_ID` é obrigatório e deve ser diferente de `ACCOUNT_ID`.
- Falhas de validação retornam `STATUS:ERROR` com `MESSAGE` explicando o motivo; quando possível, inclui o `BALANCE` atual da conta de origem.

## Implementação do Servidor

O servidor está implementado em TypeScript dentro de `gabio-server/`. Principais componentes:

- `gabio-server/comunicacao/infradecomunicacao.ts` — camada de transporte WebSocket; aceita conexões e delega o processamento de mensagens a um callback configurado.
- `gabio-server/protocolo/protocolo.ts` — parser das mensagens GBTP (`ParsearMensagem` com método `parsear`).
- `gabio-server/protocolo/serializarResposta.ts` — serializador de respostas (`Serializador` com `sucesso` e `erro`).
- `gabio-server/regras-de-negocio/repositorio/repositorioContas.ts` — repositório em memória de contas (mapa de `id -> Conta`) com operações de depósito/saque/transferência.
- `gabio-server/regras-de-negocio/servicos/servicoBancario.ts` — lógica do domínio que aplica validações e regras de negócio.
- `gabio-server/server.ts` — ponto de entrada: instancia infra, parser, serializador, repositório e serviço; configura o processador de mensagens e inicia o servidor WebSocket.

### Contas iniciais

O repositório inicia com três contas fictícias:

- `1001` — saldo `1000.00`
- `1002` — saldo `500.00`
- `1003` — saldo `750.00`

## Como executar

Pré-requisitos: Node.js (versão compatível com as dependências) e npm.

Instalar dependências e compilar TypeScript:

```bash
npm install
npm run build
```

Iniciar o servidor (após build):

```bash
npm start
```

Por padrão o servidor escuta a porta `3000` (pode ser alterada via variável de ambiente `PORT`).

## Como testar (exemplos)

Conecte um cliente WebSocket a `ws://localhost:3000` e envie uma mensagem GBTP completa (com quebras de linha). Exemplos:

1) Consulta de saldo:

```
OPERATION:BALANCE
ACCOUNT_ID:1001
TO_ACCOUNT_ID:
VALUE:0
```

Resposta esperada (exemplo):

```
STATUS:OK
MESSAGE:Saldo consultado com sucesso
BALANCE:1000.00
```

2) Depósito:

```
OPERATION:DEPOSIT
ACCOUNT_ID:1001
TO_ACCOUNT_ID:
VALUE:200.00
```

Resposta esperada:

```
STATUS:OK
MESSAGE:Depósito realizado com sucesso.
BALANCE:1200.00
```

3) Saque com saldo insuficiente (exemplo):

```
OPERATION:WITHDRAW
ACCOUNT_ID:1002
TO_ACCOUNT_ID:
VALUE:1000.00
```

Resposta esperada:

```
STATUS:ERROR
MESSAGE:Saldo insuficiente.
BALANCE:500.00
```

4) Transferência:

```
OPERATION:TRANSFER
ACCOUNT_ID:1001
TO_ACCOUNT_ID:1003
VALUE:150.00
```

Resposta esperada (sucesso):

```
STATUS:OK
MESSAGE:Transferência concluída.
BALANCE:850.00
```

Observação: as mensagens e respostas exatas dependem do estado atual das contas em memória.

## Ferramentas úteis para testes manuais

- `wscat` ou `websocat` para testes via terminal.
- um pequeno cliente HTML/TypeScript que abra um `WebSocket` e envie as mensagens (ex.: `gabio-client`).

Exemplo de uso com `wscat` (instale globalmente):

```bash
npm install -g wscat
wscat -c ws://localhost:3000
# então cole a mensagem GBTP com quebras de linha (pode ser necessário colar como uma linha com \n dependendo do cliente)
```

## Notas sobre extensão e avaliação

- O parser e o serializador estão separados para facilitar testes unitários.
- O repositório atual mantém dados apenas em memória; para persistência, substitua `RepositorioContas` por uma implementação que use um banco de dados.
- Validações adicionais (limites por operação, autenticação, registro de histórico) podem ser adicionadas no `ServicoBancario`.