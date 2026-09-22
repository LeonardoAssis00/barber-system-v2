# BarberSystem v2 — Atualização de Ambiente e Banco de Dados

## 1. Objetivo desta etapa

Esta etapa marca o início da construção da infraestrutura própria do **BarberSystem v2**, com o objetivo de reduzir a dependência do Supabase e desenvolver uma arquitetura baseada em backend próprio.

A infraestrutura definida nesta fase utiliza:

* Node.js
* TypeScript
* Fastify
* Prisma ORM
* PostgreSQL
* Docker
* Next.js como futura camada de aplicação

O banco de dados será inicialmente executado localmente através do Docker.

---

# 2. Histórico cronológico de desenvolvimento

## Etapa 1 — Definição do BarberSystem v2

Foi tomada a decisão de continuar o desenvolvimento do BarberSystem como projeto principal, porém utilizando uma arquitetura mais próxima de uma aplicação profissional.

A principal mudança em relação ao projeto original é a criação de um **backend próprio**, substituindo progressivamente as responsabilidades atualmente realizadas pelo Supabase.

Também foi definido que o desenvolvimento será realizado de forma incremental e documentada.

### Objetivos definidos

* Entender o funcionamento atual do BarberSystem.
* Mapear as funcionalidades fornecidas pelo Supabase.
* Criar um backend próprio.
* Utilizar PostgreSQL como banco de dados.
* Utilizar Prisma como ORM.
* Manter o projeto documentado.
* Entender a responsabilidade de cada arquivo e componente.
* Evitar depender de ferramentas de IA para desenvolver o sistema automaticamente.

A IA, incluindo ferramentas como Claude Code, será utilizada apenas como **ferramenta auxiliar para consulta, explicação e resolução de dúvidas**, mantendo o desenvolvimento e entendimento do projeto sob controle do desenvolvedor.

---

## Etapa 2 — Configuração do ambiente Docker

Durante a preparação do ambiente foi identificado um problema no Windows relacionado ao suporte à virtualização necessário para o funcionamento do Docker Desktop.

Foi configurado o **WSL 2** e instalada a distribuição Ubuntu.

Após a configuração, o WSL passou a funcionar corretamente:

```text
NAME      STATE     VERSION
Ubuntu    Running   2
```

Com o WSL configurado, o Docker Desktop passou a funcionar normalmente.

---

## Etapa 3 — Criação do PostgreSQL

Foi criado o arquivo:

```text
docker-compose.yml
```

com a configuração do PostgreSQL 17.

O banco foi definido para funcionar dentro de um container Docker.

### Configuração

```yaml
services:
  postgres:
    image: postgres:17
    container_name: barber-system-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: barber
      POSTGRES_PASSWORD: barber_dev
      POSTGRES_DB: barber_system
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

O container foi iniciado com:

```bash
docker compose up -d
```

Resultado:

```text
Container barber-system-postgres Started
```

Posteriormente foi confirmado que o container estava em execução através de:

```bash
docker ps
```

---

## Etapa 4 — Primeira instalação do Prisma

Foi realizada a instalação inicial do Prisma:

```bash
npm install prisma @prisma/client
```

Nesse momento foram instaladas versões diferentes das atualmente utilizadas, incluindo uma versão Release Candidate do Prisma 8.

A execução do `prisma init` gerou uma estrutura baseada nessa versão mais recente.

Durante a configuração foi identificado que essa versão não era adequada para a estrutura que estava sendo utilizada no projeto.

---

## Etapa 5 — Padronização do Prisma

Foi tomada a decisão de utilizar a versão estável:

```text
prisma 7.10.0
@prisma/client 7.10.0
```

Foi realizada a instalação:

```bash
npm install prisma@7.10.0 @prisma/client@7.10.0
```

Após a troca de versão, permaneceu no projeto um arquivo de configuração gerado pela versão anterior:

```text
prisma.config.ts
```

Esse arquivo causava o erro:

```text
TypeError: (0 , _config.definePrismaConfig) is not a function
```

O arquivo antigo foi removido.

Depois disso:

```bash
npx prisma --version
```

passou a funcionar corretamente, confirmando:

```text
prisma               : 7.10.0
@prisma/client       : 7.10.0
Node.js              : v24.16.0
```

---

## Etapa 6 — Inicialização correta do Prisma

Com o Prisma 7 configurado, foi executado novamente:

```bash
npx prisma init
```

O Prisma criou:

```text
prisma/
└── schema.prisma

prisma7.config.ts
.env
.gitignore
```

Também foram criadas as estruturas auxiliares relacionadas às ferramentas de desenvolvimento.

O arquivo `prisma7.config.ts` passou a utilizar:

```ts
import "dotenv/config";

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

---

## Etapa 7 — Correção da conexão do banco

O `.env` criado pelo Prisma inicialmente possuía uma URL relacionada ao Prisma Postgres local.

Como o projeto já possuía um PostgreSQL próprio executando no Docker, essa configuração não seria utilizada.

A variável foi alterada para:

```env
DATABASE_URL="postgresql://barber:barber_dev@localhost:5432/barber_system"
```

Essa configuração utiliza os dados definidos no `docker-compose.yml`.

---

## Etapa 8 — Teste da comunicação Prisma → PostgreSQL

Foi executado:

```bash
npx prisma db pull
```

O Prisma identificou corretamente:

```text
Datasource "db": PostgreSQL database "barber_system",
schema "public" at "localhost:5432"
```

Isso confirmou que a conexão entre o Prisma e o PostgreSQL estava funcionando.

O comando terminou com o erro:

```text
P4001 The introspected database was empty
```

### Interpretação

O erro ocorreu porque o banco ainda não possui tabelas.

Portanto:

* Docker está funcionando.
* PostgreSQL está funcionando.
* O container está acessível.
* O banco `barber_system` existe.
* O Prisma consegue se conectar ao banco.
* A variável `DATABASE_URL` está correta.
* O banco ainda está vazio.

O erro não exige nenhuma correção neste momento.

Não foi criada uma tabela artificial apenas para permitir que o `db pull` fosse executado.

---

# 3. Estado atual da arquitetura

A infraestrutura atual pode ser representada da seguinte maneira:

```text
Windows 11
    │
    ▼
WSL 2
    │
    ▼
Docker Desktop
    │
    ▼
PostgreSQL 17
    │
    │ localhost:5432
    ▼
barber_system
    │
    ▲
    │
Prisma 7.10.0
    │
    ▼
Backend BarberSystem v2
```

O banco encontra-se atualmente **vazio e pronto para receber a estrutura do sistema**.

---

# 4. Próxima etapa

A próxima etapa não será simplesmente criar tabelas.

Primeiro será realizado o **mapeamento técnico do BarberSystem atual**.

Serão identificadas as responsabilidades atualmente realizadas pelo Supabase, incluindo:

* autenticação;
* usuários;
* perfis;
* barbearias;
* serviços;
* horários disponíveis;
* agendamentos;
* relacionamento entre usuários e barbearias;
* período de teste;
* ativação da assinatura;
* controle de acesso;
* regras de segurança;
* políticas de acesso aos dados.

Depois desse levantamento, cada responsabilidade será transformada em uma estrutura correspondente no novo backend.

O `schema.prisma` será construído a partir desse entendimento.

---

# 5. Princípio de desenvolvimento adotado

O BarberSystem v2 será desenvolvido seguindo uma sequência incremental:

```text
Mapear sistema atual
        ↓
Entender responsabilidades do Supabase
        ↓
Definir arquitetura
        ↓
Modelar banco de dados
        ↓
Criar migrations
        ↓
Criar backend
        ↓
Implementar autenticação
        ↓
Implementar regras de negócio
        ↓
Criar API
        ↓
Integrar frontend
        ↓
Testar
        ↓
Documentar
```

A prioridade será **entender antes de implementar**.

Cada etapa deverá explicar:

1. O que está sendo criado.
2. Por que está sendo criado.
3. Como funciona.
4. Qual arquivo é responsável por aquilo.
5. Como ele se relaciona com as demais partes do sistema.
6. Como testar se está funcionando.

Dessa forma, o BarberSystem v2 não será apenas um sistema que funciona, mas também um projeto cujo código e arquitetura podem ser compreendidos e mantidos posteriormente.



Ainda faltam informações importantes, principalmente:

como o barbeiro é cadastrado;
como o cliente é cadastrado;
como o role diferencia barbeiro e cliente;
como o profile é criado;
como uma barber_shop é criada;
quais dados ficam em profiles;
quais dados ficam em barber_shops;
quais regras existem durante cadastro/login.