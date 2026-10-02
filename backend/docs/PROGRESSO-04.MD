# PROGRESSO-04 — MÓDULO DE SERVIÇOS DA BARBEARIA

## 1. Início do módulo

Após a conclusão da autenticação do barbeiro, foi iniciado o desenvolvimento do primeiro módulo de negócio do backend: o gerenciamento dos serviços oferecidos pela barbearia.

O banco de dados já possuía o modelo `Service`, relacionado à entidade `BarberShop`.

O modelo possui os seguintes dados principais:

* `id`
* `barberShopId`
* `name`
* `price`
* `createdAt`

A estrutura permite que uma barbearia possua diversos serviços.

---

## 2. Criação do Service

Foi criado o arquivo:

```text
backend/src/services/service.service.ts
```

O objetivo desse arquivo é concentrar a regra de negócio responsável pela criação de um serviço.

A função recebe:

* nome do serviço;
* preço;
* ID do usuário autenticado.

O `barberShopId` não é recebido diretamente do cliente.

---

## 3. Identificação da barbearia através do usuário autenticado

Foi adotada uma abordagem na qual o usuário autenticado é utilizado para identificar a barbearia à qual o serviço pertence.

O fluxo implementado é:

```text
JWT
 ↓
User ID
 ↓
Profile
 ↓
BarberShop ID
 ↓
Service
```

Dessa forma, o cliente não precisa informar o `barberShopId` na requisição.

Essa abordagem evita que o cliente escolha arbitrariamente uma barbearia para cadastrar um serviço.

---

## 4. Criação da rota POST /services

Foi criado o arquivo:

```text
backend/src/routes/services.ts
```

A rota implementada foi:

```text
POST /services
```

A rota utiliza o middleware de autenticação JWT antes de executar a operação.

O corpo da requisição utilizado no teste foi:

```json
{
  "name": "Corte de cabelo",
  "price": 30
}
```

O `barberShopId` não foi enviado na requisição.

---

## 5. Tipagem do JWT

Durante a implementação da rota, o TypeScript apresentou um erro relacionado à propriedade `sub` de `request.user`.

Para solucionar o problema de tipagem, foi criada a declaração:

```text
backend/src/types/fastify-jwt.d.ts
```

A declaração informa ao TypeScript que o JWT utilizado pelo sistema possui:

```text
sub: string
email: string
```

Após a correção, foi executado:

```text
npx tsc --noEmit
```

O comando foi concluído sem erros, confirmando que o projeto estava compilando corretamente.

---

## 6. Registro da rota no Fastify

A nova rota foi registrada no arquivo:

```text
backend/src/app.ts
```

O Fastify passou a registrar:

```text
serviceRoutes
```

permitindo que a aplicação reconheça o endpoint:

```text
POST /services
```

---

## 7. Teste do cadastro de serviço

Após a implementação, foi realizado um teste utilizando um usuário autenticado.

O login foi realizado com sucesso e o token JWT retornado foi utilizado para acessar a rota protegida.

Foi enviada uma requisição para:

```text
POST /services
```

com os dados:

```json
{
  "name": "Corte de cabelo",
  "price": 30
}
```

O cadastro foi realizado com sucesso.

O backend retornou:

* serviço criado;
* ID do serviço;
* nome do serviço;
* preço;
* ID da barbearia;
* data de criação.

O serviço criado recebeu o ID:

```text
da0cd09b-2637-461c-839a-4f83837a55b5
```

e foi vinculado à barbearia:

```text
ba010b4a-5899-4151-b98d-21328099575c
```

Essa barbearia corresponde à barbearia do usuário autenticado utilizado no teste.

---

## 8. Resultado da etapa

O primeiro endpoint do módulo de serviços foi implementado e testado com sucesso.

Até este ponto, o backend consegue:

* autenticar o barbeiro através de JWT;
* identificar o usuário autenticado;
* localizar o perfil do usuário;
* identificar a barbearia vinculada ao perfil;
* cadastrar um serviço;
* vincular automaticamente o serviço à barbearia correta;
* persistir o serviço no PostgreSQL através do Prisma.

O endpoint atualmente implementado é:

```text
POST /services
```

---

## 9. Implementação do GET /services

Após a implementação do cadastro de serviços, foi desenvolvida a funcionalidade de consulta dos serviços pertencentes à barbearia do usuário autenticado.

Foi criada a função:

```text
backend/src/services/service.service.ts

10. Criação da rota GET /services

Foi criada a rota:

GET /services

Assim como o cadastro de serviços, a consulta utiliza o middleware de autenticação JWT.

O ID do usuário autenticado é obtido através de:

request.user.sub

e enviado para a função GetServices.

A função realiza a consulta no PostgreSQL através do Prisma, retornando somente os serviços vinculados à barbearia do usuário autenticado.

11. Teste do GET /services

Após iniciar o PostgreSQL através do Docker e o servidor Fastify, foi realizado um novo login para obtenção de um token JWT.

Em seguida, foi realizada uma requisição autenticada para:

GET /services

A requisição foi concluída com sucesso e retornou o serviço anteriormente cadastrado:

Nome: Corte de cabelo
Preço: 30

O resultado também apresentou o ID do serviço, o ID da barbearia e a data de criação.

Esse teste confirmou que a consulta está sendo realizada corretamente no PostgreSQL através do Prisma.

12. Teste de proteção da rota

Também foi realizado um teste acessando:

GET /services

sem enviar o cabeçalho de autorização.

O backend retornou:

HTTP 401 Unauthorized

com a mensagem:

No Authorization was found in request.headers

Esse teste confirmou que a rota está protegida pelo middleware JWT e não permite acesso sem autenticação.

13. Resultado atual do módulo

Após esta etapa, o módulo de serviços possui as seguintes operações implementadas:

POST /services
GET /services

O backend consegue:

cadastrar serviços;
identificar automaticamente a barbearia do usuário autenticado;
listar os serviços da barbearia;
impedir acesso às operações sem autenticação;
persistir e consultar os dados no PostgreSQL através do Prisma.
14. Próximo passo

As próximas funcionalidades planejadas para o módulo de serviços serão:

PUT /services/:id
DELETE /services/:id

Essas operações permitirão atualizar e excluir serviços pertencentes à barbearia do usuário autenticado.

O módulo continuará sendo desenvolvido e testado de forma incremental antes da integração com o frontend.

---

## 9. Próximo passo

A próxima funcionalidade planejada para o módulo será:

```text
GET /services
```

Essa rota deverá retornar os serviços pertencentes à barbearia do usuário autenticado.

Posteriormente serão implementadas as operações de atualização e exclusão dos serviços.

O módulo seguirá sendo desenvolvido e testado de forma incremental antes da integração com o frontend.
