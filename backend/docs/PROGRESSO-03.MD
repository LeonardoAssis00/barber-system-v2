# PROGRESSO-03 — LOGIN E AUTENTICAÇÃO DO BARBEIRO

## 1. IDENTIFICAÇÃO DA ETAPA

**Projeto:** Barber System V2
**Etapa:** 02 — Login e autenticação do barbeiro
**Status:** Em desenvolvimento
**Backend:** Node.js + TypeScript + Fastify
**Banco de dados:** PostgreSQL
**ORM:** Prisma
**Autenticação:** JWT
**Hash de senha:** Argon2

---

# 2. OBJETIVO DA ETAPA

Dar continuidade à estrutura de autenticação do Barber System V2, implementando o login do barbeiro e iniciando o mecanismo de autenticação baseado em JWT (JSON Web Token).

O objetivo desta etapa é permitir que um barbeiro cadastrado consiga informar seu e-mail e senha, validar suas credenciais e receber um token JWT que posteriormente será utilizado para acessar recursos protegidos do sistema.

---

# 3. SITUAÇÃO INICIAL

Ao iniciar esta etapa, o sistema já possuía:

* servidor Fastify funcionando;
* conexão com PostgreSQL através do Prisma;
* cadastro de usuários;
* cadastro de barbearias;
* cadastro de perfis;
* hash das senhas utilizando Argon2;
* validação de e-mail já cadastrado;
* validação de slug da barbearia;
* criação automática do período de teste de 15 dias;
* transação para criação dos dados relacionados ao barbeiro.

A autenticação, entretanto, ainda não possuía uma rotina de login nem geração de token.

---

# 4. CONFIGURAÇÃO DO JWT

Foi instalada a biblioteca `@fastify/jwt` para permitir a utilização de JWT no Fastify.

Pacote instalado:

```text
@fastify/jwt@10.2.2
```

Também foi adicionada uma chave secreta ao arquivo `.env` para utilização na assinatura dos tokens:

```env
JWT_SECRET="barber-system-dev-secret"
```

Essa chave está sendo utilizada apenas durante o desenvolvimento. Em um ambiente de produção deverá ser utilizada uma chave secreta forte e mantida de forma segura.

---

# 5. CONFIGURAÇÃO DO FASTIFY

O plugin JWT foi registrado no arquivo:

```text
src/app.ts
```

Configuração utilizada:

```ts
app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET!,
});
```

Com isso, a aplicação passa a possuir acesso aos recursos de JWT disponibilizados pelo Fastify.

---

# 6. SERVIÇO DE AUTENTICAÇÃO

Foi criado o arquivo:

```text
src/services/auth.service.ts
```

Responsável pela lógica de login do barbeiro.

O serviço recebe:

* e-mail;
* senha.

Primeiramente, o usuário é localizado no banco através do e-mail.

Caso o usuário não exista, é retornada a mensagem genérica:

```text
E-mail ou senha inválidos.
```

Essa mesma mensagem é utilizada quando a senha está incorreta, evitando informar ao cliente se determinado e-mail está ou não cadastrado.

---

# 7. VALIDAÇÃO DA SENHA

Após localizar o usuário, a senha informada no login é comparada com o hash armazenado no banco utilizando a função:

```text
verifyPassword()
```

Essa função utiliza o Argon2.

O fluxo é:

```text
Senha informada pelo usuário
            ↓
      verifyPassword()
            ↓
Hash armazenado no banco
            ↓
      Senha válida?
```

A senha original não é armazenada no banco de dados.

---

# 8. GERAÇÃO DO JWT

Após a validação correta das credenciais, o backend gera um JWT através do Fastify.

O token recebe atualmente as seguintes informações:

```ts
{
    sub: user.id,
    email: user.email
}
```

O campo `sub` representa o identificador do usuário autenticado.

Nenhuma senha ou `passwordHash` é incluída no token.

O serviço retorna:

```json
{
    "token": "..."
}
```

---

# 9. NOVA ROTA IMPLEMENTADA

Foi adicionada a rota:

```text
POST /auth/login
```

Ela recebe:

```json
{
    "email": "email_do_usuario",
    "password": "senha_do_usuario"
}
```

Quando as credenciais são válidas, a API retorna o JWT.

Quando as credenciais são inválidas, a API retorna:

```text
HTTP 401
```

com a mensagem:

```json
{
    "message": "E-mail ou senha inválidos."
}
```

---

# 10. TESTE DO CADASTRO

Para validar que o banco continuava funcionando após a implementação do JWT, foi realizado um novo cadastro através da rota:

```text
POST /auth/register/barber
```

Foi utilizado um usuário de teste.

Dados utilizados:

```text
Nome: Leonardo Teste 2
E-mail: leonardo.teste2@teste.com
Senha: 12345678
Barbearia: Barbearia Teste 2
Slug: barbearia-teste-2
```

O cadastro foi realizado com sucesso.

A API retornou:

```json
{
    "message": "Barbeiro cadastrado com sucesso.",
    "barber": {
        "id": "3986fb3d-f228-4e86-90a3-81aff5048722",
        "email": "leonardo.teste2@teste.com",
        "name": "Leonardo Teste 2",
        "shop": {
            "id": "ba010b4a-5899-4151-b98d-21328099575c",
            "name": "Barbearia Teste 2",
            "slug": "barbearia-teste-2"
        }
    }
}
```

Esse teste confirmou que o cadastro implementado na etapa anterior continua funcionando.

---

# 11. TESTE DE VALIDAÇÃO DE SLUG

Antes do cadastro bem-sucedido, foi realizada uma tentativa utilizando o slug:

```text
barbearia-teste
```

O backend retornou:

```json
{
    "message": "Este slug já está em uso."
}
```

Isso confirmou que os dados cadastrados anteriormente permaneciam no banco de dados e que a validação de slug continuava funcionando.

---

# 12. TESTE DO LOGIN

Após o cadastro do novo usuário, foi realizado o teste:

```text
POST /auth/login
```

Utilizando:

```text
E-mail: leonardo.teste2@teste.com
Senha: 12345678
```

O backend retornou um JWT com sucesso.

Resposta obtida:

```json
{
    "token": "JWT_GERADO_PELO_BACKEND"
}
```

O token gerado possui, entre suas informações, o identificador do usuário através do campo `sub`.

O identificador retornado no JWT correspondeu ao usuário criado durante o teste:

```text
3986fb3d-f228-4e86-90a3-81aff5048722
```

Isso confirmou o funcionamento integrado de:

```text
PostgreSQL
    ↓
Prisma
    ↓
Busca do usuário
    ↓
Argon2
    ↓
Validação da senha
    ↓
JWT
    ↓
Token retornado pela API
```

---

# 13. RESULTADO ATUAL DA ETAPA

Até este ponto, estão funcionando:

* [x] Instalação do `@fastify/jwt`
* [x] Configuração do `JWT_SECRET`
* [x] Registro do plugin JWT no Fastify
* [x] Criação do serviço de autenticação
* [x] Busca do usuário pelo e-mail
* [x] Verificação da senha utilizando Argon2
* [x] Mensagem genérica para credenciais inválidas
* [x] Geração do JWT
* [x] Inclusão do ID do usuário no campo `sub`
* [x] Rota `POST /auth/login`
* [x] Teste real de cadastro
* [x] Teste real de login
* [x] Confirmação de geração do token

---

# 14. PRÓXIMO PASSO

A autenticação ainda não está completa.

Até o momento, o backend consegue **gerar um JWT**, mas ainda falta utilizar esse token para proteger as rotas da aplicação.

O próximo objetivo será implementar a verificação do JWT nas rotas protegidas.

Fluxo esperado:

```text
Cliente
   ↓
Login
   ↓
JWT recebido
   ↓
Cliente envia JWT nas próximas requisições
   ↓
Backend verifica o JWT
   ↓
Token válido?
   ├── Sim → permite acesso
   └── Não → rejeita requisição
```

Será criada inicialmente uma rota protegida de teste para validar esse mecanismo antes de utilizá-lo nas funcionalidades reais do Barber System.

---
# 15. TESTES DE AUTENTICAÇÃO REALIZADOS

Após a implementação do middleware de autenticação JWT, foram realizados testes para validar diferentes situações de acesso.

## 15.1 Acesso sem JWT

Foi realizada uma requisição para:

```text
GET /auth/me
```

sem o envio do cabeçalho `Authorization`.

O backend retornou:

```text
HTTP 401 Unauthorized
```

com o código:

```text
FST_JWT_NO_AUTHORIZATION_IN_HEADER
```

Esse resultado confirmou que uma rota protegida não pode ser acessada sem autenticação.

---

## 15.2 Acesso com JWT inválido

Foi realizada uma tentativa de acesso utilizando um valor que não correspondia a um JWT válido.

O backend retornou:

```text
HTTP 401 Unauthorized
```

com o código:

```text
FST_JWT_AUTHORIZATION_TOKEN_INVALID
```

Esse teste confirmou que o middleware não aceita tokens malformados.

---

## 15.3 Acesso com JWT válido

Após realizar o login com credenciais válidas, o token JWT gerado foi enviado através do cabeçalho:

```text
Authorization: Bearer <token>
```

A requisição para:

```text
GET /auth/me
```

foi autorizada e retornou:

```text
HTTP 200
```

A resposta também apresentou os dados armazenados no JWT através de `request.user`, incluindo:

* `sub`, correspondente ao ID do usuário;
* `email`;
* `iat`, correspondente ao momento da emissão do token.

Esse teste confirmou que o backend consegue validar o JWT e identificar o usuário autenticado.

---

## 15.4 Login com senha incorreta

Foi realizado um teste utilizando um e-mail cadastrado e uma senha incorreta.

O backend retornou:

```json
{
    "message": "E-mail ou senha inválidos."
}
```

com resposta HTTP `401`.

Esse comportamento confirma que a validação da senha através do Argon2 está funcionando.

Também é utilizada uma mensagem genérica para credenciais inválidas, evitando diferenciar um e-mail inexistente de uma senha incorreta.

---

# 16. RESULTADO DA AUTENTICAÇÃO

Com os testes realizados, o mecanismo básico de autenticação do backend está funcionando.

O fluxo atual é:

```text
Cadastro
   ↓
Usuário armazenado no PostgreSQL
   ↓
Senha armazenada como hash Argon2
   ↓
Login
   ↓
Validação da senha
   ↓
Geração do JWT
   ↓
Cliente envia JWT
   ↓
Middleware verifica o JWT
   ↓
Usuário autenticado identificado
```

---

# 17. PENDÊNCIAS DA ETAPA 02

* [x] Instalar `@fastify/jwt`.
* [x] Configurar `JWT_SECRET`.
* [x] Criar serviço de login.
* [x] Validar senha utilizando Argon2.
* [x] Gerar JWT.
* [x] Criar middleware de autenticação.
* [x] Criar rota protegida de teste.
* [x] Testar acesso sem JWT.
* [x] Testar JWT inválido.
* [x] Testar JWT válido.
* [x] Identificar o usuário através do `sub`.
* [x] Testar login com senha incorreta.

### Próximos passos

* [ ] Utilizar o ID do usuário autenticado para consultar seus dados no banco.
* [ ] Criar uma rota autenticada que utilize o usuário real do banco de dados.
* [ ] Avaliar a separação entre autenticação e autorização.
* [ ] Definir como as diferentes funções do sistema serão protegidas.
* [ ] Posteriormente aplicar a autenticação às funcionalidades reais do Barber System.
