# Etapa 01 — Cadastro e Base de Autenticação do Barbeiro

## Objetivo

Criar a primeira parte do backend próprio do Barber System, começando pelo cadastro do barbeiro e pela estrutura inicial de autenticação.

## O que foi implementado

- Configuração do Fastify e servidor na porta `3333`.
- Conexão com PostgreSQL através do Prisma.
- Criação das tabelas:
  - `User`
  - `Profile`
  - `BarberShop`
- Configuração do Prisma Client com `@prisma/adapter-pg`.
- Hash de senhas utilizando `argon2`.
- Serviço `registerBarber()` para cadastro do barbeiro.
- Criação de `User`, `BarberShop` e `Profile` dentro de uma única transação.
- Verificação de e-mail já cadastrado.
- Verificação de `slug` já utilizado.
- Criação automática do período de teste de 15 dias.
- Criação da rota:
  - `POST /auth/register/barber`
- Criação da rota de verificação:
  - `GET /health`

## Estrutura criada

```text
src/
├── lib/
│   └── prisma.ts
├── routes/
│   ├── auth.ts
│   └── health.ts
└── services/
    ├── barber.service.ts
    └── password.service.ts