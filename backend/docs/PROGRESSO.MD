# Barber System — Progresso Inicial do Backend

## 1. Objetivo desta etapa

Esta etapa iniciou a criação de um backend próprio para o Barber System.

O sistema atualmente possui um frontend desenvolvido em React.js que utiliza o Supabase para autenticação e persistência de dados. O objetivo do novo backend é substituir gradualmente essa dependência, criando uma API própria responsável pelas regras de negócio, autenticação, acesso aos dados e comunicação com o banco de dados.

Neste primeiro momento, o foco foi preparar o ambiente de desenvolvimento e confirmar que a estrutura básica do backend funciona corretamente.

---

## 2. Localização do Backend

O backend foi criado dentro do projeto atual do Barber System, mantendo o frontend existente no diretório principal.

Estrutura atual:

```text
barber-system-main/
├── src/                  # Frontend React existente
├── ...
└── backend/              # Novo backend
    ├── node_modules/
    ├── package-lock.json
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   └── server.ts
    └── dist/
        └── server.js
```

O frontend não foi movido ou alterado nesta etapa.

---

## 3. Ferramentas instaladas

Foram verificadas e preparadas as principais ferramentas necessárias para o desenvolvimento:

* Node.js — versão 24.16.0
* npm — versão 11.13.0
* Git — versão 2.54.0
* Docker Desktop — versão 29.8.0
* Docker Compose — versão 5.5.1
* Visual Studio Code — versão 1.124.2

O Docker será utilizado posteriormente para executar o PostgreSQL durante o desenvolvimento.

---

## 4. Inicialização do projeto Node.js

Dentro da pasta `backend`, foi executado:

```bash
npm init -y
```

Esse comando criou o arquivo:

```text
backend/package.json
```

O arquivo `package.json` é responsável por armazenar informações do projeto e suas dependências.

O projeto também foi configurado para utilizar módulos ES (`"type": "module"`).

---

## 5. TypeScript

O TypeScript foi instalado como dependência de desenvolvimento:

```bash
npm install -D typescript
```

Também foi criado o arquivo:

```text
backend/tsconfig.json
```

Configuração atual:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

### Função do `tsconfig.json`

Esse arquivo define como o TypeScript deve tratar o código do backend.

As configurações principais são:

* `rootDir: "src"` — indica onde fica o código-fonte.
* `outDir: "dist"` — define onde serão colocados os arquivos JavaScript compilados.
* `target: "ES2022"` — define a versão JavaScript utilizada na compilação.
* `strict: true` — ativa verificações mais rigorosas do TypeScript.
* `module: "NodeNext"` — configura a utilização de módulos compatíveis com o Node.js.

O código é escrito em:

```text
src/
```

e, após a compilação, o JavaScript correspondente é gerado em:

```text
dist/
```

---

## 6. Primeiro arquivo do servidor

Foi criado:

```text
backend/src/server.ts
```

Esse é o arquivo responsável atualmente pelo ponto de entrada do servidor.

O conteúdo atual é:

```ts
import fastify from "fastify";

const app = fastify({
  logger: true,
});

app.get("/", async () => {
  return {
    message: "Barber System Backend funcionando!",
  };
});

app.listen({ port: 3333 }).then(() => {
  console.log("Servidor rodando em http://localhost:3333");
});
```

### Responsabilidade atual do `server.ts`

Neste momento, ele possui três funções:

1. Cria uma aplicação Fastify.
2. Define uma rota de teste `GET /`.
3. Inicia o servidor na porta `3333`.

Esse arquivo ainda é simples propositalmente. Conforme o backend crescer, as rotas e regras de negócio serão organizadas em arquivos separados.

---

## 7. Fastify

O Fastify foi instalado através de:

```bash
npm install fastify
```

Ele será utilizado como framework HTTP do backend.

Sua função será receber as requisições realizadas pelo frontend, encaminhá-las para as funcionalidades correspondentes e retornar as respostas da API.

Neste momento, ele possui apenas uma rota de teste:

```text
GET /
```

que retorna:

```json
{
  "message": "Barber System Backend funcionando!"
}
```

---

## 8. Processo de compilação e execução

O TypeScript é compilado através de:

```bash
npx tsc
```

Após a compilação, o arquivo:

```text
src/server.ts
```

é transformado em:

```text
dist/server.js
```

O servidor é executado com:

```bash
node dist/server.js
```

O servidor fica disponível em:

```text
http://localhost:3333
```

O funcionamento foi testado com sucesso através do navegador, confirmando que o backend está respondendo corretamente.

---

## 9. Organização inicial da aplicação

Após validar o funcionamento básico do Fastify, a aplicação foi reorganizada para separar responsabilidades.

A estrutura dentro de `src` passou a ser:

```text
src/
├── app.ts
├── server.ts
└── routes/
    └── health.ts

### Concluído

* [x] Criar pasta `backend`
* [x] Inicializar projeto Node.js
* [x] Configurar ES Modules
* [x] Instalar TypeScript
* [x] Criar `tsconfig.json`
* [x] Criar `src/server.ts`
* [x] Instalar Fastify
* [x] Criar servidor HTTP
* [x] Criar rota `GET /`
* [x] Configurar porta `3333`
* [x] Compilar TypeScript
* [x] Executar o JavaScript compilado com Node.js
* [x] Testar o servidor pelo navegador

### Ainda não implementado

Nesta etapa ainda não foram criados:

* PostgreSQL
* Prisma
* autenticação própria
* usuários
* clientes
* barbeiros
* serviços
* horários
* agendamentos
* regras de autorização
* integração com o frontend
* migração dos dados do Supabase

Essas funcionalidades serão implementadas gradualmente nas próximas etapas.

---

## 10. Próxima etapa

Antes de começar a implementar as funcionalidades do Barber System, o backend deverá receber uma organização interna adequada.

A próxima etapa será estruturar a aplicação para separar responsabilidades, evitando concentrar todas as rotas e regras no `server.ts`.

A estrutura será construída gradualmente, mantendo a aplicação funcionando a cada etapa.
