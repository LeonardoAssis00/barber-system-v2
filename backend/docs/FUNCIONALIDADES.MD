1. Dados coletados

O cadastro possui:

name
email
password
shopName
slug

Portanto, o nosso backend precisará receber esses dados.

2. Regra da slug

Antes de criar a conta, o sistema transforma o texto digitado em um slug:

Barbearia do Bairro
        ↓
barbearia-do-bairro

E verifica diretamente no banco:

.from("barber_shops")
.select("id")
.eq("slug", finalSlug)

Isso nos revela uma regra importante:

A slug de uma barbearia precisa ser única.

3. Criação da barbearia

Depois que o usuário é criado, o sistema obtém:

const userId = data.user.id;

e cria uma entrada em:

barber_shops

com:

name
slug
owner_id
trial_started_at
trial_ends_at
is_paid
is_active

Isso confirma várias regras de negócio.

Proprietário
owner_id = userId

A barbearia possui um proprietário.

Período de teste

O sistema cria:

trial_started_at = agora
trial_ends_at = agora + 15 dias

Portanto:

Toda nova barbearia começa com um período de teste de 15 dias.

Estado financeiro

Inicialmente:

is_paid = false
Estado da barbearia

Inicialmente:

is_active = true

Então uma barbearia recém-criada fica ativa mesmo sem pagamento durante o período de teste.


             CADASTRO DO BARBEIRO

                  Dados
                    │
                    ▼
             Normaliza SLUG
                    │
                    ▼
          Verifica slug existente
                    │
              ┌─────┴─────┐
              │           │
           existe       disponível
              │           │
              ▼           ▼
            erro      Cria usuário
                            │
                            ▼
                     Supabase Auth
                            │
                            ▼
                         userId
                            │
                            ▼
                    Cria barber_shop
                            │
                 ┌──────────┴──────────┐
                 ▼                     ▼
            período 15 dias        ativa = true
                 │
                 ▼
          is_paid = false
                 │
                 ▼
          Atualiza profiles
                 │
                 ▼
       barber_shop_id = shop.id
                 │
                 ▼
          Cadastro concluído


          Cliente preenche:
    ↓
Nome
Slug/link da barbearia
E-mail
Senha
    ↓
Normaliza o slug
    ↓
Busca a barbearia em barber_shops
    ↓
Cria usuário no Supabase Auth
    ↓
Obtém o ID do usuário
    ↓
Cria/atualiza o profile
    ↓
Relaciona cliente → barbearia
    ↓
Redireciona para /agendar/{slug}


                    LOGIN
                      │
                      ▼
               Auth válido?
                      │
                      ▼
              profile existe?
                      │
                      ▼
               role = barber?
                  │       │
                 não     sim
                  │       │
                BLOQ      ▼
                       shop existe?
                           │
                           ▼
                       is_active?
                       │       │
                      não     sim
                       │       │
                    /payment   ▼
                         trial expirado?
                          │          │
                         sim        não
                          │          │
                          ▼          ▼
                       is_paid?    DASHBOARD
                       │     │
                      não   sim
                       │     │
                    /payment  │
                              ▼
                          DASHBOARD




mapa de autenticação até agora

                                              USUÁRIO
                       │
                       ▼
                 Supabase Auth
                       │
                       ▼
                    user.id
                       │
                       ▼
                   profiles
                       │
              ┌────────┴────────┐
              │                 │
          role=user         role=barber
              │                 │
              ▼                 ▼
        Cliente             Barbeiro
              │                 │
              ▼                 ▼
       /agendar/{slug}    regras de acesso
                              │
                    ┌─────────┴─────────┐
                    │                   │
                is_active          trial/is_paid
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       /dashboard/barber



                       # BarberSystem — Documentação do trabalho realizado em 17/09/2026

## 1. Objetivo do trabalho

O objetivo definido para esta etapa do BarberSystem é iniciar a migração da aplicação que atualmente depende diretamente do Supabase para uma arquitetura com **backend próprio**.

A decisão tomada foi **não fazer uma V2 completa do frontend neste momento**.

O foco atual é:

1. Mapear o comportamento existente.
2. Entender as responsabilidades atualmente executadas pelo Supabase.
3. Criar/conectar o backend próprio.
4. Preservar as regras atuais do sistema.
5. Gradualmente retirar do frontend as operações que hoje são feitas diretamente no Supabase.

A aplicação frontend existente será preservada durante essa transição.

---

# 2. Backend próprio já iniciado

O backend próprio já havia sido iniciado antes do mapeamento realizado nesta sessão.

Também foi configurado o ambiente PostgreSQL utilizando Docker.

O container do banco foi iniciado com sucesso:

```text
barber-system-postgres
```

Banco:

```text
PostgreSQL 17
```

Porta:

```text
5432
```

Estado verificado:

```text
Up
```

Portanto, o ambiente de banco PostgreSQL local já está funcionando.

Não devemos recriar essa estrutura nem iniciar novamente o backend do zero.

---

# 3. Arquitetura atual do frontend

O frontend atual ainda utiliza Supabase diretamente.

O fluxo atual é aproximadamente:

```text
React
  │
  ├── Supabase Auth
  │
  └── Supabase Database
          │
          ├── profiles
          ├── barber_shops
          ├── services
          ├── barber_slots
          └── bookings
```

O objetivo futuro é:

```text
React
   │
   │ HTTP
   ▼
Backend próprio
   │
   ▼
PostgreSQL
```

---

# 4. Entidades já identificadas

As principais tabelas utilizadas pelo sistema são:

## profiles

Representa o perfil do usuário.

Possui relação com a barbearia através de:

```text
barber_shop_id
```

O perfil também possui um papel (`role`), utilizado para diferenciar usuários do sistema.

Os dois fluxos identificados são:

```text
role = barber
role = user
```

---

## barber_shops

Representa a barbearia.

Entre os dados identificados estão:

```text
id
name
slug
owner_id
trial_started_at
trial_ends_at
is_paid
is_active
```

A `slug` é utilizada para identificar publicamente uma barbearia.

Exemplo conceitual:

```text
/agendar/barbearia-do-bairro
```

---

## services

Representa os serviços oferecidos pela barbearia.

Estrutura já identificada:

```text
id
barber_shop_id
name
price
duration
created_at
```

Os serviços pertencem a uma barbearia através de:

```text
barber_shop_id
```

No sistema atual, a criação é feita através de INSERT e a exclusão através de DELETE por `id`.

---

## barber_slots

Representa os horários/disponibilidades da barbearia.

Também possui:

```text
barber_shop_id
```

fazendo a associação com a barbearia.

---

## bookings

Representa os agendamentos.

Entre os campos já observados estão:

```text
id
date
time
status
client_name
service_id
barber_shop_id
```

`service_id` referencia o serviço escolhido.

O dashboard do barbeiro também busca:

```text
services.name
services.price
```

através da relação com o serviço.

---

# 5. Regra de isolamento entre barbearias

Esta é uma das regras mais importantes do projeto.

Cada usuário deve estar associado a uma barbearia específica através do:

```text
profiles.barber_shop_id
```

Consequentemente, clientes de uma barbearia não devem ter acesso aos dados de outra.

O mesmo vale para o barbeiro.

O frontend atual já utiliza filtros como:

```text
barber_shop_id = shop.id
```

Porém, na futura arquitetura, essa segurança deverá ser responsabilidade do **backend**, e não apenas de filtros enviados pelo frontend.

O frontend não deve conseguir simplesmente informar outro `barber_shop_id` e acessar dados de outra empresa.

---

# 6. Cadastro do barbeiro

Arquivo analisado:

```text
src/pages/auth/BarberRegister.jsx
```

O cadastro recebe:

```text
name
shopName
slug
email
password
```

A slug é normalizada no frontend.

Depois ocorre:

### 1. Verificação da slug

O sistema consulta:

```text
barber_shops
```

para verificar se a slug já está em uso.

### 2. Criação do usuário

Atualmente:

```text
supabase.auth.signUp()
```

com:

```text
full_name
role = barber
```

### 3. Criação da barbearia

É criado um registro em:

```text
barber_shops
```

com:

```text
name
slug
owner_id
trial_started_at
trial_ends_at
is_paid = false
is_active = true
```

### 4. Período de teste

O sistema atualmente cria:

```text
trial_started_at = momento do cadastro
trial_ends_at = 15 dias depois
```

### 5. Associação do perfil

Depois:

```text
profiles.barber_shop_id = shop.id
```

O fluxo termina encaminhando o usuário para:

```text
/login
```

---

# 7. Cadastro do cliente

Arquivo analisado:

```text
src/pages/auth/UserRegister.jsx
```

O cliente informa:

```text
fullName
slug
email
password
```

A slug pode ser informada como:

```text
slug
```

ou através do link público da barbearia.

O frontend normaliza o valor.

Depois:

### 1. Localiza a barbearia

Busca:

```text
barber_shops
```

através da:

```text
slug
```

Se a barbearia não existir, o cadastro é interrompido.

### 2. Cria o usuário

Atualmente utiliza:

```text
supabase.auth.signUp()
```

### 3. Cria/atualiza o profile

O profile recebe:

```text
id = userId
full_name = fullName
role = user
barber_shop_id = shop.id
```

### 4. Redirecionamento

Depois do cadastro:

```text
/agendar/{slug}
```

Portanto, a regra definida anteriormente fica confirmada:

> O cliente precisa conhecer a slug da barbearia para criar uma conta vinculada àquela barbearia.

---

# 8. Autenticação

Arquivos analisados:

```text
src/context/AuthContext.jsx
src/context/AuthProvider.jsx
```

`AuthContext.jsx` apenas cria o contexto:

```text
createContext({})
```

A implementação está em:

```text
AuthProvider.jsx
```

O provider mantém:

```text
user
profile
loading
```

A sessão atual é recuperada através do Supabase Auth.

Depois de encontrar o usuário, o sistema busca o perfil através de:

```text
profiles
```

junto com:

```text
barber_shops
```

O resultado é disponibilizado para o restante da aplicação através do:

```text
AuthContext.Provider
```

O contexto fornece atualmente:

```text
user
profile
loading
signIn
signOut
```

---

# 9. Relação usuário → profile → barbearia

Foi identificado que atualmente existem duas referências importantes:

```text
user.id
   │
   ├── barber_shops.owner_id
   │
   └── profiles.id
             │
             └── profiles.barber_shop_id
                         │
                         ▼
                    barber_shops.id
```

Essa estrutura deverá ser analisada quando o backend assumir a responsabilidade pela autenticação e autorização.

Não devemos simplesmente reproduzir a estrutura sem entender quais relações são necessárias.

---

# 10. Dashboard do barbeiro

Arquivo analisado:

```text
src/pages/dashboard/barber/DashBoardBarber.jsx
```

Esse é atualmente o principal componente do dashboard do barbeiro.

Foi constatado que os seguintes arquivos existem, porém alguns estão vazios:

```text
src/pages/dashboard/barber/
├── BarberAgenda.jsx       0 bytes
├── BarberBookings.jsx     0 bytes
├── BarberHome.jsx         0 bytes
├── BarberPayments.jsx     2360 bytes
├── BarberServices.jsx     0 bytes
└── DashBoardBarber.jsx    7183 bytes
```

Também foi pesquisado `BarberHome` e não foram encontradas referências no código.

Portanto, não devemos assumir que esses componentes vazios fazem parte do fluxo atual.

---

# 11. Funcionamento do DashBoardBarber

O dashboard obtém:

```text
profile
```

através do:

```text
AuthContext
```

e identifica a barbearia através de:

```text
profile?.barber_shops?.[0]
```

O componente busca diretamente no Supabase:

### Serviços

```text
services
```

filtrando por:

```text
barber_shop_id
```

### Agenda

```text
barber_slots
```

filtrando por:

```text
barber_shop_id
```

### Agendamentos

```text
bookings
```

filtrando por:

```text
barber_shop_id
```

e buscando também os dados do serviço relacionado.

---

# 12. Cancelamento de agendamento

O barbeiro pode cancelar um agendamento.

Atualmente o frontend executa:

```text
UPDATE bookings
SET status = 'canceled'
```

com filtro por:

```text
id
barber_shop_id
```

Depois o estado local é atualizado.

Na arquitetura futura, essa operação deverá ser executada por uma rota protegida do backend.

O backend deverá verificar a identidade do usuário e garantir que o agendamento pertence à barbearia daquele usuário.

---

# 13. Link público da barbearia

O dashboard monta o link:

```text
/agendar/{shop.slug}
```

O barbeiro pode:

* visualizar o link;
* copiar o link;
* abrir o link em uma nova aba.

A `slug` portanto possui três funções importantes no sistema:

1. Identificação pública da barbearia.
2. Entrada do cliente no fluxo de cadastro.
3. Acesso à página pública de agendamento.

---

# 14. Componentes do dashboard que ainda precisam ser considerados

O `DashBoardBarber.jsx` utiliza:

```text
ServiceForm
ServiceList
AgendaForm
AgendaList
BookingList
```

Esses componentes são importantes porque algumas operações do banco provavelmente estão implementadas neles.

Portanto, embora o dashboard já esteja suficientemente mapeado para iniciarmos o backend, esses componentes representam operações que deverão ser migradas posteriormente.

---

# 15. Decisão arquitetural atual

A decisão tomada hoje foi:

**Não reconstruir o BarberSystem inteiro agora.**

Também não vamos criar uma V2 completa neste momento.

O objetivo é:

```text
Backend próprio
      ↓
preservar comportamento atual
      ↓
migrar operações gradualmente
      ↓
frontend passa a consumir a API
```

A migração deve ocorrer de maneira controlada.

---

# 16. Estado atual do projeto

Neste momento:

```text
Frontend atual
       │
       └── ainda utiliza Supabase diretamente

Backend próprio
       │
       └── já iniciado

PostgreSQL
       │
       └── Docker funcionando
           PostgreSQL 17
           porta 5432
```

O mapeamento realizado hoje já identificou as principais regras de negócio necessárias para começar a implementação do backend.

---

# 17. Próxima etapa

A partir deste ponto, não é necessário continuar solicitando arquivos que já foram analisados.

O próximo trabalho deve ser feito **sobre o backend que já existe**, e não recriando sua estrutura.

A sequência será:

```text
1. Revisar o estado atual do backend já criado
2. Conferir conexão com PostgreSQL
3. Conferir Prisma/schema existente, caso já criado
4. Definir o modelo das entidades
5. Implementar autenticação
6. Implementar usuários/perfis
7. Implementar barber_shops
8. Implementar services
9. Implementar barber_slots
10. Implementar bookings
11. Criar as regras de autorização por barber_shop_id
12. Começar a substituir as chamadas Supabase do frontend pela API
```

A regra principal durante a implementação será:

> **Não mudar o comportamento funcional do BarberSystem sem necessidade. O objetivo desta etapa é substituir a infraestrutura do backend, preservando as regras que a aplicação já possui.**
