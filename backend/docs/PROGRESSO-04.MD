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
## 14. Implementação do PUT /services/:id

Com as operações de cadastro e consulta concluídas, foi implementada a funcionalidade de atualização de serviços.

Foi criada no arquivo:

```text
backend/src/services/service.service.ts
```

a função:

```text
UpdateService
```

Essa função recebe:

* ID do serviço;
* novo nome;
* novo preço;
* ID do usuário autenticado.

Antes de realizar a atualização, são feitas verificações para garantir que o usuário possui um perfil válido, possui uma barbearia vinculada e que o serviço pertence à sua própria barbearia.

Somente após essas verificações o serviço é atualizado no PostgreSQL através do Prisma.

---

## 15. Criação da rota PUT /services/:id

Foi criada a rota:

```text
PUT /services/:id
```

A rota utiliza o middleware de autenticação JWT.

O ID do usuário autenticado é obtido através de:

```text
request.user.sub
```

O ID do serviço é obtido através dos parâmetros da URL:

```text
request.params.id
```

Os novos dados do serviço são recebidos através do corpo da requisição.

A rota envia essas informações para a função `UpdateService`, responsável pelas regras de atualização e autorização.

---

## 16. Teste de atualização do serviço

Após a implementação da rota, foi realizada a compilação do projeto através do comando:

```text
npx tsc --noEmit
```

O projeto foi compilado sem erros.

Em seguida, foi realizado um teste autenticado utilizando um serviço pertencente à barbearia do usuário.

O serviço inicialmente possuía os dados:

```text
Nome: Corte de cabelo
Preço: 30
```

Foi realizada uma requisição PUT para alterar os dados para:

```text
Nome: Corte de cabelo masculino
Preço: 35
```

A requisição foi concluída com sucesso e o backend retornou a confirmação da atualização.

---

## 17. Verificação da persistência da atualização

Após a atualização, foi realizada novamente uma requisição:

```text
GET /services
```

O serviço retornado apresentou os novos dados:

```text
Nome: Corte de cabelo masculino
Preço: 35
```

Esse teste confirmou que a alteração foi persistida corretamente no PostgreSQL através do Prisma.

---

## 18. Teste de proteção da rota PUT

Também foi realizado um teste acessando:

```text
PUT /services/:id
```

sem fornecer um token JWT.

O backend retornou:

```text
HTTP 401 Unauthorized
```

com a mensagem:

```text
No Authorization was found in request.headers
```

Esse teste confirmou que a operação de atualização está protegida pelo middleware de autenticação e não pode ser executada por usuários não autenticados.

---

## 19. Teste de autorização entre barbearias

Foi realizado um teste adicional para verificar se um usuário autenticado poderia alterar um serviço pertencente a outra barbearia.

Para isso, foram utilizados dois barbeiros diferentes, cada um vinculado à sua própria barbearia.

O primeiro usuário tentou alterar um serviço pertencente à segunda barbearia.

Apesar de possuir um token JWT válido, a operação foi recusada pelo backend, que retornou:

```text
Serviço não pertence à sua barbearia.
```

Esse teste confirmou que o sistema não verifica somente a autenticação do usuário, mas também verifica a propriedade do serviço antes de permitir sua alteração.

Dessa forma, um barbeiro autenticado não pode modificar serviços pertencentes a outra barbearia.

---

## 20. Resultado atual do módulo

Após a implementação do PUT, o módulo de serviços possui as seguintes operações:

```text
POST /services
GET /services
PUT /services/:id
```

O backend consegue:

* cadastrar serviços;
* consultar os serviços da barbearia do usuário autenticado;
* atualizar serviços;
* identificar automaticamente a barbearia do usuário;
* impedir operações sem autenticação;
* impedir que um usuário altere serviços de outra barbearia;
* persistir os dados no PostgreSQL através do Prisma.

Os testes realizados confirmaram o funcionamento das operações e das principais regras de segurança do módulo.

---

## 21. Próximo passo

A próxima funcionalidade planejada para o módulo de serviços será:

```text
DELETE /services/:id
```

Essa operação deverá permitir a exclusão de um serviço pertencente à barbearia do usuário autenticado.

Assim como nas operações anteriores, a funcionalidade será implementada de forma incremental, realizando primeiro a regra de negócio, depois a rota, os testes de autenticação e autorização e, por fim, a verificação da exclusão no banco de dados.

Após a conclusão das operações de serviços, será realizada a documentação da etapa e o versionamento das alterações no Git antes do início do próximo módulo do backend.
