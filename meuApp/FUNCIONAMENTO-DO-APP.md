# Orbitt — O que cada parte do app faz

Este documento explica **o que está sendo feito em cada parte do app** e **como cada fluxo funciona**.

---

## 1. Entrada do app e decisão de tela

**Arquivo:** `app/_layout.tsx`  
**O que faz:** Layout raiz do app. Define um Stack com três telas possíveis: `(auth)`, `(tabs)` e `modal`. Usa tema claro/escuro do sistema e esconde o header em todas.

**Arquivo:** `app/index.tsx`  
**O que faz:** É a **primeira tela** que roda ao abrir o app.

1. Mostra um loading (bolinha laranja) enquanto decide para onde enviar o usuário.
2. **Sempre inicia “limpo”:** remove usuário logado e eventos selecionados do armazenamento (para não persistir entre aberturas).
3. Depois verifica se existe um usuário salvo:
   - **Tem usuário** → redireciona para `/(tabs)` (área logada: Início, Eventos, Favoritos, Mensagens, Perfil).
   - **Não tem usuário** → redireciona para `/(auth)/login` (tela de login).

Ou seja: ao abrir o app, a pessoa sempre começa deslogada e é mandada para o login; depois do login, vai para as abas.

---

## 2. Fluxo de autenticação (login e cadastro)

**Arquivo:** `app/(auth)/_layout.tsx`  
**O que faz:** Define o stack de telas de autenticação: `login`, `register` e `profile-setup`, todas sem header.

### 2.1 Login — `app/(auth)/login.tsx`

**O que faz:**

- Campos: “Email, celular ou CPF” e “Senha”.
- **Entrar:** chama `findUserByIdentifierAndPassword(identifier, password)` no `auth-storage`. Se achar um usuário, salva como “usuário atual” com `setCurrentUser(user)` e navega para `/(tabs)`. Se não achar, mostra “Email/CPF ou senha incorretos”.
- **Cadastre-se:** navega para `/(auth)/register`.

Os usuários são buscados na lista salva em AsyncStorage (chave `@orbit_users`); o “identificador” pode ser e-mail ou CPF (normalizado, só números).

### 2.2 Cadastro — `app/(auth)/register.tsx`

**O que faz:**

- Coleta: primeiro nome, sobrenome, e-mail, **data de nascimento** (máscara DD/MM/AAAA e validação), CPF, senha e confirmação de senha.
- Data de nascimento: só números, máscara formata em DD/MM/AAAA; valida dia/mês/ano e se a data existe e não é futura.
- **Avançar:** valida tudo; se estiver ok, chama `savePendingRegistration(...)` e navega para `/(auth)/profile-setup`. Os dados ficam temporariamente em AsyncStorage (`@orbit_pending_registration`); o usuário ainda não foi criado.

### 2.3 Completar perfil — `app/(auth)/profile-setup.tsx`

**O que faz:**

- Só abre se existir `getPendingRegistration()`; senão redireciona para o register.
- O usuário adiciona **até 8 fotos** (galeria) e o texto **“Sobre mim”**.
- **Salvar:** valida que tem pelo menos uma foto e “Sobre mim” preenchido. Cria um `StoredUser` com os dados do pending + fotos (copiadas para pasta do app no dispositivo) + about. Chama `saveUser(user)`, `clearPendingRegistration()`, `clearSelectedEvents()` (novo usuário começa sem eventos), `setCurrentUser(user)` e navega para `/(tabs)`.

Assim, o cadastro só termina depois do perfil com fotos e descrição; a partir daí a pessoa está logada e na área principal.

---

## 3. Armazenamento de usuários e sessão

**Arquivo:** `lib/auth-storage.ts`  
**O que faz:**

- **Usuários:** lista em AsyncStorage `@orbit_users` (array de `StoredUser`: id, nome, e-mail, data de nascimento, CPF, senha, fotos, about).
- **Cadastro em andamento:** `@orbit_pending_registration` (dados do register antes de criar o usuário).
- **Quem está logado:** `@orbit_current_user` (um único usuário).
- Funções principais: `getCurrentUser()`, `setCurrentUser()`, `saveUser()`, `updateUser()`, `findUserByIdentifierAndPassword()`, `savePendingRegistration()`, `getPendingRegistration()`, `clearPendingRegistration()`.

Tudo é local no dispositivo (AsyncStorage); não há backend.

---

## 4. Área principal (abas) — layout das tabs

**Arquivo:** `app/(tabs)/_layout.tsx`  
**O que faz:** Define a **barra de abas** (tab bar) com 5 abas visíveis:

1. **Início** (ícone Orbitt) → `index`
2. **Eventos** → `explore`
3. **Favoritos** → `favorites`
4. **Mensagens** → `chat`
5. **Perfil** → `profile`

Outras telas existem mas **não aparecem na tab bar** (`href: null`): `scheduled-events`, `event-detail`, `chat-conversation`, `edit-profile`, `security-and-terms`. Elas são abertas por navegação (push/replace) a partir das abas.

---

## 5. Aba Início — `app/(tabs)/index.tsx`

**O que faz:** Tela principal de “descoberta” de perfis.

- Carrega **eventos selecionados** do usuário (`getSelectedEvents()`) e **notificações** (`getNotifications(user.id)`).
- **Se não tiver nenhum evento cadastrado:** mostra a tela “Você não possui nenhum evento cadastrado” com dois círculos de fundo e botões “Adicionar evento programado +” e “Adicionar evento em tempo real +”. O primeiro leva para `scheduled-events`.
- **Se tiver eventos:** filtra uma lista **fixa de perfis fictícios** (`MOCK_PROFILES`) e mostra só os que têm pelo menos um evento em comum com os eventos selecionados pelo usuário (local + dia, ex.: “VILAK” + “Sábado”).
- Para cada perfil é possível:
  - **Arrastar para a direita (like):** chama `addMatch(user.id, { id, name, photoUri })` e mostra o modal de match; pode “Falar” (vai para o chat) ou fechar.
  - **Arrastar para a esquerda:** “rejeitar” — só passa para o próximo perfil (não salva nada).
  - **Seta para cima:** abre o perfil em tela cheia (modal) com fotos e detalhes.
- Header: logo Orbitt, ícone de notificações (abre modal de notificações) e ícone de filtro (sem ação ainda).
- Os “matches” ficam salvos em `lib/match-storage.ts` (por usuário logado), e são usados na aba Mensagens.

Resumo: Início = escolher eventos → ver perfis que combinam com esses eventos → dar like (match) ou rejeitar; like vira conversa na aba Mensagens.

---

## 6. Eventos selecionados — `lib/event-storage.ts`

**O que faz:** Guarda no AsyncStorage (`@orbit_selected_events`) a lista de **eventos que o usuário escolheu** (local + dia da semana).

- Cada item tem: `id`, `eventId`, `venueName`, `day`.
- Funções: `getSelectedEvents()`, `addSelectedEvents(eventId, venueName, days)`, `removeSelectedEvent(id)`, `clearSelectedEvents()` (usado ao abrir o app e ao finalizar cadastro).

É uma lista global por dispositivo (não por usuário); por isso ao logar/abrir o app limpamos para não “herdar” eventos de outro uso.

---

## 7. Aba Eventos — `app/(tabs)/explore.tsx`

**O que faz:** Tela de **“Meus eventos”** e cadastro de novos.

- Carrega `getSelectedEvents()` e notificações.
- **Se não tiver eventos:** mesma tela vazia do Início (círculos + “Adicionar evento programado +” e “Adicionar evento em tempo real +”). “Adicionar evento programado” → `scheduled-events`.
- **Se tiver eventos:** lista os eventos selecionados em “chips” (nome do local + dia); cada um tem um “−” para remover (`removeSelectedEvent`). Abaixo, botão “Adicionar evento +” (leva a `scheduled-events`) e seção “Evento em tempo real” (botão ainda sem ação real).

Ou seja: aqui a pessoa **gerencia** os eventos em que está interessada; esses eventos definem quais perfis aparecem no Início.

---

## 8. Eventos programados (catálogo) — `app/(tabs)/scheduled-events.tsx`

**O que faz:** Lista **fixa** de locais (bares/baladas) com busca e filtro (Todos / Bar / Balada).

- Ao tocar em um evento, navega para `event-detail` passando o `id` do evento.
- Botão voltar: `router.replace('/(tabs)/explore')`.

Não grava nada sozinho; só leva ao detalhe do evento.

---

## 9. Detalhe do evento — `app/(tabs)/event-detail.tsx`

**O que faz:** Mostra um local com nome, estilo, agenda da semana (dias) e botão “Salvar”.

- Carrega os eventos já selecionados e marca quais dias daquele local já estão salvos.
- O usuário marca/desmarca dias e toca em **Salvar**. Chama `addSelectedEvents(id, venue.name, days)` com os dias marcados e volta para `explore`.

Assim, “cadastrar evento” = escolher local + dias na tela de detalhe e salvar; isso alimenta a lista em Eventos e o filtro de perfis no Início.

---

## 10. Aba Mensagens — `app/(tabs)/chat.tsx`

**O que faz:** Lista de **matches** (pessoas com quem deu like no Início).

- Carrega `getMatches(user.id)` ao focar na tela e quando recebe `notifyChatListRefresh()` (ex.: após desfazer match ou bloquear na conversa).
- **Se não tiver matches:** mostra “Você não possui matches ainda” e botão “Clique aqui para encontrar pessoas” → `router.push('/(tabs)')` (Início).
- **Se tiver matches:** mostra uma linha horizontal de avatares e, abaixo, a lista de **conversas**. Cada item leva para `chat-conversation` com `id`, `name` e `photoUri` do match.

Matches vêm de `lib/match-storage.ts` (adicionados no Início ao dar like).

---

## 11. Conversa — `app/(tabs)/chat-conversation.tsx`

**O que faz:** Tela de chat com **uma** pessoa (match).

- Recebe `id` e `name` (e opcionalmente `photoUri`) pela navegação.
- Carrega e salva mensagens em `lib/message-storage.ts` (por usuário + matchId). Se não houver mensagens, cria uma mensagem inicial “Oi, tudo bem?” do outro.
- Ao enviar mensagem: `addMessage(...)` e `updateMatchLastMessage(...)` para atualizar a prévia na lista de conversas.
- Menu (ícone “i”): **Desfazer Match** e **Bloquear**:
  - Ambos chamam `removeMatch(userId, matchId)`, `clearMessages(userId, matchId)` e `notifyChatListRefresh()` e em seguida `router.replace('/(tabs)/chat')`.
  - O perfil some da lista de conversas e a conversa é fechada; a lista é atualizada via `chat-list-refresh`.

---

## 12. Aba Perfil — `app/(tabs)/profile.tsx`

**O que faz:** Mostra o **perfil do usuário logado**.

- Carrega `getCurrentUser()` ao focar.
- Exibe: foto (ou iniciais), nome completo, **idade** (calculada pela data de nascimento em DD/MM/AAAA), selo verificado, “Seu perfil está X% completo” (barra), texto “Sobre mim”, card **Orbitt — Grátis vs Plus** (comparativo: o que só o Plus tem — ver quem curtiu, perfil em destaque, super likes, suporte) e botão “Atualizar”, e botão “Sair e voltar ao login”.
- **Editar perfil** → `edit-profile`.
- **Ícone de escudo (segurança)** → `security-and-terms`.
- **Sair:** `setCurrentUser(null)`, `clearSelectedEvents()`, `router.replace('/(auth)/login')`.

Idade é calculada no próprio componente a partir de `user.birthDate` (string DD/MM/AAAA).

---

## 13. Editar perfil — `app/(tabs)/edit-profile.tsx`

**O que faz:** Permite alterar **fotos** (até 8) e **“Sobre mim”**.

- Carrega o usuário atual e suas fotos; ao salvar, monta novo array de `photoUris` (copiando novas fotos para a pasta do app quando não for web), chama `updateUser(updated)` e volta para o perfil com `router.replace('/(tabs)/profile')`.

Não edita nome, e-mail, data de nascimento etc.; só fotos e about.

---

## 14. Segurança e Termos — `app/(tabs)/security-and-terms.tsx`

**O que faz:** Tela informativa com texto sobre **segurança de dados** (armazenamento local, fotos, mensagens, direitos) e **termos de uso** (aceitação, uso permitido, conduta, alterações). Botão voltar: `router.replace('/(tabs)/profile')`.

---

## 15. Favoritos — `app/(tabs)/favorites.tsx`

**O que faz:** Aba de favoritos; no estado atual do código costuma ser uma tela simples ou placeholder (não grava favoritos em storage separado como os matches). Pode ser expandida depois para salvar perfis “favoritados” no Início.

---

## 16. Resumo do fluxo de dados

| Onde | O que é feito |
|------|----------------|
| **app/index.tsx** | Limpa sessão e eventos; redireciona para login ou (tabs). |
| **auth-storage** | Usuários, cadastro pendente, usuário atual (AsyncStorage). |
| **event-storage** | Lista de eventos selecionados (local + dia); usada no Início para filtrar perfis e em Eventos para exibir/remover. |
| **match-storage** | Lista de matches por usuário; usada no Início (add ao like) e em Mensagens (lista + conversa). |
| **message-storage** | Mensagens por (userId, matchId); usada na conversa; pode ser limpa ao desfazer match/bloquear. |
| **chat-list-refresh** | Notificação para a lista de conversas recarregar (após desfazer match/bloquear). |
| **notification-storage** | Notificações por usuário; usadas no ícone de sino no Início e em Eventos. |

---

## 17. Ordem lógica para “passar pelo app”

1. **Abrir app** → `index` → deslogado → **Login**.
2. **Cadastro:** Login → Cadastre-se → **Register** (dados + data nascimento) → **Profile-setup** (fotos + sobre mim) → **Tabs**.
3. **Início:** sem eventos → tela “cadastrar evento” → **Eventos** → Adicionar evento → **Scheduled-events** → escolher local → **Event-detail** → marcar dias → Salvar → volta a **Eventos** e ao **Início** com perfis.
4. **Início com eventos:** ver perfis → like → match → **Mensagens** → abrir conversa → **Chat-conversation** (mensagens; desfazer match/bloquear remove da lista e sai da conversa).
5. **Perfil:** ver/editar perfil, Segurança e Termos, plano Grátis/Plus, Sair (volta ao Login).

Se quiser, na próxima podemos focar em **um fluxo só** (por exemplo só cadastro ou só eventos) e detalhar tela a tela com nomes de funções e arquivos.
