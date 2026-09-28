# APOCALIPSE — GDD Complementar: Zumbis, Bosses e Tutorial

**Documento companheiro do `GDD.md` e do `GDD_EXPANSAO.md`.** Cobre tudo definido após a criação da `ARVORE_CACOS.md` — sistema completo de zumbis (tipos, sub-mutações, dupla-categoria, raridades), sistema de bosses não-intrusivos, e filosofia de tutorial. Nada aqui conflita com os documentos anteriores; expande o que estava em aberto.

---

## 1. Sistema de Zumbis

### 1.1 Filosofia de design

O zumbi não pode se tornar segundo plano. Em dado momento da campanha o conflito entre grupos humanos cresce e toma o primeiro plano — os zumbis, que eram o terror central, correm o risco de virar ruído de fundo. O sistema de tipos e sub-mutações existe para garantir que **o zumbi sempre ofereça perigo real**, não só pressão de fundo.

Dois tipos específicos garantem isso estruturalmente: o **Farejador** (sub-mutação) que deriva inconscientemente em direção ao jogador mesmo no offscreen, e o **Berserker** que à noite representa uma ameaça de outra ordem. Enquanto existirem esses dois, nenhuma zona é completamente segura e nenhuma noite é rotina.

**Decomposição não ocorre.** Esperar que os zumbis morram por degradação não é uma estratégia — o jogo não recompensa isolamento passivo indefinido.

---

### 1.2 Tipos base

Nove tipos. Cada um tem um **papel principal** — o que ele pressiona no loop de sobrevivência — e uma **mecânica central** que o define sem depender de stat inflado.

---

**Desmembrado**
Zumbi com um ou mais membros perdidos. Pode ser natural (já estava assim quando o jogador chegou) ou resultado de combate do próprio jogador.

- Sem braço(s): menos dano, sem capacidade de arremessar objetos
- Sem perna(s): mais lento ou se arrasta; menor perfil visual no cone de visão top-down; involuntariamente mais silencioso por não conseguir caminhar normalmente
- **Papel:** ameaça residual + contador de história de zona
- **Mecânica central:** variação de mobilidade e perfil conforme o membro perdido

*Nota de design:* desmembrados naturais (não causados pelo jogador) carregam a história daquela zona. Podem ter cacos no corpo — bilhete de despedida, mensagem inacabada. São o P1 da espinha em forma de inimigo: o fato de que algo violento aconteceu aqui antes do jogador chegar.

*Desmembrado como primitiva de evento:* um desmembrado encontrado numa zona informa sobre o que aconteceu lá antes. É uma peça do gradiente de estado (§3 do GDD_EXPANSAO).

---

**Corredor**
Zumbi que corre. Velocidade levemente abaixo do sprint do jogador — o jogador consegue escapar, mas sem folga.

- **Papel:** pressão de fuga
- **Mecânica central:** o loop mais importante deste tipo não é o combate — é o que vem *depois* da fuga. Correr gera barulho. Barulho atrai outros. O corredor é o gatilho; o estado que o jogador entra após escapar é o problema real.
- Sinergia direta com o sistema de energia: corredor → jogador gasta energia fugindo → jogador precisa descansar → jogador fica vulnerável. A dívida é mais perigosa que o inimigo.

---

**Inteligente**
IA levemente diferente dos outros tipos. Capaz de usar o ambiente de formas que outros não usam.

- Abre **portas destrancadas e não-barricadas** sem precisar forçar — inclui portas pesadas simples; exclui portas explicitamente barricadas ou trancadas com chave
- Pode arremessar objetos para atrasar ou machucar o jogador — um objeto jogado contra uma parede **gera barulho**, podendo atrair outros zumbis indiretamente
- **Papel:** elimina zonas seguras passivas
- **Mecânica central:** o inteligente pressiona o sistema de construção/barricada (planejado no GDD original). Sem ele, barricar é conveniência. Com ele, é necessidade com prazo de validade.

*Sinergia com Forte:* inteligente abre o que está destrancado; forte quebra o que está barricado. Juntos, nenhuma barreira funciona sem atenção ativa.

---

**Forte**
Fisicamente resistente e poderoso.

- Mais HP que o padrão
- Dano aumentado por ataque
- Quebra barricadas e portas com mais facilidade — e **faz barulho ao fazer isso**
- **Papel:** pressão sobre estruturas; torna construção necessária e temporária
- **Mecânica central:** a porta caindo é o anúncio da chegada. O forte é o inimigo que ensina que nenhuma posição é permanente.

*Impossível:* Forte + Silencioso. Destruição de barricada gera barulho por natureza — a combinação é incoerente fisicamente.

---

**Virulento**
Zumbi onde a doença está em estado mais ativo internamente — concentração maior do agente ativador.

- Chance de infecção por mordida: 40–60% (vs. 20% base)
- Arranhão com este tipo tem chance pequena de infecção (normalmente arranhão não infecta)
- **Papel:** força distância e eliminação rápida; prioridade de alvo
- **Mecânica central:** cria comportamento oposto ao melee padrão — o jogador quer matar de longe, rápido, com mínimo contato. Muda completamente a abordagem de combate quando identificado.

*Nota de lore:* o Virulento é a expressão mais visível do P2 (latência) no gameplay. A doença neste indivíduo está "mais acordada" — sem que o jogador possa saber o porquê sem investigar. Nome diegético: **Virulento** (vocabulário médico que sobreviventes adotariam naturalmente sem precisar de explicação técnica).

*Sobre mordida vs. arranhão:* a distinção depende de animação e hitbox que ainda não existem. Design intent: mordida = contato total, chance base. Arranhão = contato parcial (jogador parcialmente escapou), chance reduzida — exceto no Virulento onde o arranhão já tem chance significativa. Pendente de implementação.

---

**Silencioso**
Não faz barulho. Não apenas quieto — **evita ativamente fazer barulho**. Não atravessa vidro, não derruba objetos, contorna obstáculos em vez de empurrar.

- **Papel:** horror de surpresa; remove o canal sonoro de detecção
- **Mecânica central:** o jogo inteiro treina o jogador a usar o som como radar (grunhidos, passos, ruído de perseguição). O Silencioso remove esse canal sem avisar. A única detecção disponível é visual (dentro do cone) ou pelo dano recebido.

*O que o torna único:* não é necessariamente mais forte — é mais assustador por ser detectável só quando já é tarde.

*O efeito de ausência:* o Silencioso que está numa zona **remove som** do ambiente. A ausência repentina de qualquer ruído de zumbi é o sinal de alerta — o jogo que ensina a desconfiar do silêncio tanto quanto do barulho.

*Professor involuntário:* o primeiro encontro com um Silencioso é o tutorial de "olhe com os olhos, não com os ouvidos." Não há texto. O jogador aprende pelo trauma.

---

**Griteiro**
Faz barulho de propósito — grunhidos altos, batidas em superfícies, sons que atraem outros zumbis.

- Funciona como **fonte de barulho autônoma e móvel** no mapa
- Outros zumbis derivam em direção ao som dele; o Griteiro deriva em direção ao jogador
- Se não eliminado rapidamente, acumula uma horda crescente atrás de si que segue até onde o jogador estiver
- **Papel:** atrator de horda ambulante; escalada forçada
- **Mecânica central:** eliminar um Griteiro exige combate (barulho) — mas não eliminar gera mais barulho ainda. Armadilha de escalada sem saída silenciosa.

*Impossível com:* Silencioso (contradição direta de comportamento).

---

**Berserker**
Ameaça noturna de outra ordem. Não é um tipo de zumbi comum escalado — é uma categoria separada com ciclo próprio.

- **De dia:** dormente. Imóvel no chão, indistinguível de um corpo morto entre tantos outros. Se o jogador passa por uma zona de dia e conta corpos que não reagem como os outros, está mapeando a ameaça noturna.
- **À noite:** ativo. Forte, rápido, faz barulho, persegue. Anda sozinho — não em grupo, não coordenado. Compete com outros Berserkers por presas.
- **Papel:** ameaça noturna de outra escala; razão para o ciclo dia/noite ser relevante até tarde na campanha
- **Mecânica central:** o Berserker dormente resolve o conflito com o GDD original (que estabelece zumbis mais lentos à noite). De dia a zona tem mais zumbis ativos mas previsíveis. À noite tem menos zumbis ativos mas se topar com um Berserker acordado é outra ordem de problema. São dois tipos de risco por período, não o mesmo risco em escalas diferentes.

*O Berserker como mapa:* a densidade de corpos imóveis durante o dia é informação. Um jogador atento que passa por uma zona e nota corpos que não se movem com os outros sabe onde vai ser perigoso à noite. Sem UI, sem aviso — só leitura de ambiente.

*Motivação para sair à noite:* não existe motivação forçada. O jogador que nunca sai à noite tem o survival inteiro disponível de dia. A noite existe como camada opcional com risco e recompensa próprios. Dois vetores orgânicos:
1. **Recurso em zona com Berserkers** — de dia é arriscado acordar os dormentes por acidente; à noite eles estão ativos mas localizáveis. Cada abordagem tem custo e informação diferentes.
2. **Side-quest noturna** — NPC pede encontro à noite num local específico. O jogador descobre Berserkers por experiência, não por aviso.

*Reconciliação com o GDD:* o GDD original trava que à noite zumbis ficam mais lentos (70%) e menos perceptivos. O Berserker não contradiz isso — ele é **dormente de dia**, categoria separada que acorda à noite. Os zumbis comuns continuam mais lentos à noite; o Berserker é a exceção que faz a noite perigosa por outra razão.

**Frequência noturna:** 1 em cada 10–15 zumbis encontrados à noite é um Berserker ativo.

---

### 1.3 Sub-mutações

Sub-mutações são modificadores que qualquer tipo-base pode carregar, com exceções físicas óbvias. São geradas na criação do zumbi e permanentes — não recalculadas em tempo de execução.

**Quatro sub-mutações:**

---

**Quadrúpede**
O zumbi se move em quatro membros.
- Mais rápido que a versão bípede do mesmo tipo
- Perfil diferente no cone de visão top-down — mais baixo, pode ser confundido com objeto no chão até estar próximo
- *Não aplica a:* Desmembrado (motivo físico óbvio)

---

**Ouvinte**
Raio de detecção sonora significativamente maior que o padrão.
- Detecta o jogador (mesmo em sneaking) a distâncias que outros não detectariam
- *Aplica a:* todos os tipos, incluindo Desmembrado

---

**Farejador**
A sub-mutação de maior impacto no sistema offscreen.
- **Comportamento:** a cada 3 movimentos que o zumbi faz, 2 são inconscientemente na direção do jogador — contanto que o jogador esteja dentro de um raio específico
- **Fora do raio:** comportamento idle normal
- **O raio é sensível ao som:** expande quando o jogador faz barulho, contrai no silêncio. Sneaking reduz o raio efetivo; barulho o amplia. Isso mantém o sneaking com valor específico contra este sub-tipo.
- **Efeito offscreen:** um Farejador numa zona que o jogador está passando vai derivar em direção a ele mesmo sem linha de visão. No heartbeat de mundo, isso significa que Farejadores em zonas vizinhas se movem levemente na direção do cluster do jogador ao longo do tempo.
- *Nome diegético:* **Farejador** — sugere detecção por algo além do visível, sem explicar o mecanismo.
- *Não aplica a:* Desmembrado sem pernas (se arrasta, a mecânica de derivação não tem mobilidade pra expressar)

---

**Mimético**
Fica imóvel — deitado no chão, aparentemente morto. Ativa por proximidade ou som alto próximo.
- Indistinguível de um corpo morto sem a mecânica de observação de corpo
- Num mapa cheio de corpos (desmembrados que o jogador matou, sobreviventes mortos), é invisível passivamente
- *Conexão com a lore:* a doença existe em estado dormente (P2 da espinha). O Mimético é a expressão mais literal disso no comportamento — está "adormecido" funcionalmente, como a doença estava adormecida em milhares. O Berserker diurno é um Mimético cíclico; o Mimético acorda por gatilho de proximidade, não por ciclo.
- *Aplica a:* todos os tipos

---

### 1.4 Dupla-categoria

Um zumbi pode ser de dois tipos base simultaneamente, contanto que os comportamentos não sejam divergentes.

**Combinações impossíveis (divergentes):**

| Combinação | Motivo |
|-----------|--------|
| Silencioso + Griteiro | Contradição direta de comportamento |
| Forte + Silencioso | Destruição de barricada gera barulho por natureza |
| Desmembrado de perna + Corredor | Físico — sem perna não há corrida |

**Combinações raras mas possíveis (exemplos):**

| Combinação | O que cria |
|-----------|-----------|
| Corredor + Silencioso | Rápido e sem aviso sonoro — o pior dos dois mundos |
| Corredor + Inteligente | Corre até você E abre a porta pra onde você fugiu |
| Forte + Inteligente | Abre o destrancado E quebra o barricado |
| Silencioso + Virulento | Aparece sem aviso E infecta com mais facilidade |
| Griteiro + Corredor | Atrai horda enquanto persegue ativamente |
| Corredor + Forte | Fisicamente contraintuitivo mas possível; borderline — balancear depois |

---

### 1.5 Sistema de raridade

Probabilidades na **geração** do zumbi — não dinâmicas, não recalculadas. Um zumbi nasce com seus traços e os mantém.

| Perfil | Frequência |
|--------|-----------|
| Zumbi comum (só tipo base) | ~85,5% |
| Tipo base + sub-mutação | ~9,5% |
| Dupla-categoria (sem sub-mutação) | ~4,5% |
| Dupla-categoria + sub-mutação | ~0,5% (1 em 200) |

**Berserker especificamente:**
- Frequência noturna: 1 em 10–15 zumbis encontrados à noite
- Com sub-mutação: 1 em 100 Berserkers
- Dupla-categoria + sub-mutação: evento extremamente raro — memorável quando encontrado, não deve ser spawning comum

**Distribuição de tipos na população geral:** não definida numericamente — deixada para balanceamento. O que está definido é a hierarquia de raridade relativa: Berserker ativo é mais raro que tipo duplo comum; tipo duplo + sub-mutação é o encontro mais raro do sistema regular.

---

### 1.6 Tabela completa

| Tipo base | Sub-mutações possíveis | Dupla com | Frequência relativa |
|-----------|----------------------|-----------|---------------------|
| Desmembrado (braço) | Ouvinte, Mimético | Virulento, Silencioso | Comum |
| Desmembrado (perna) | Ouvinte, Mimético | Virulento, Silencioso | Comum |
| Corredor | Quadrúpede, Ouvinte, Farejador, Mimético | Silencioso, Virulento, Inteligente, Griteiro, Forte* | Comum |
| Inteligente | Quadrúpede, Ouvinte, Farejador, Mimético | Corredor, Silencioso, Virulento, Forte | Incomum |
| Forte | Quadrúpede, Ouvinte, Farejador, Mimético | Inteligente, Virulento, Corredor*, Griteiro | Incomum |
| Virulento | Quadrúpede, Ouvinte, Farejador, Mimético | Corredor, Silencioso, Forte, Inteligente, Griteiro | Incomum |
| Silencioso | Quadrúpede, Ouvinte, Farejador, Mimético | Corredor, Forte, Inteligente, Virulento | Raro |
| Griteiro | Quadrúpede, Ouvinte, Farejador | Corredor, Forte, Virulento | Incomum |
| Berserker | Todos (raro) | Qualquer (muito raro) | Noturno: 1/10–15 |

*Borderline — balancear depois.*

---

### 1.7 Como o jogador conhece os tipos

O jogador nunca recebe uma classificação explícita. Aprende pelos três canais que atravessam o jogo inteiro:

**Via caco:** diário de sobrevivente descrevendo "um que não fazia barulho nenhum", "um que correu mais que consegui", "um que abriu a porta como se soubesse o que estava fazendo." Sem nome, sem categoria — só o relato de quem sobreviveu.

**Via oral:** NPC que menciona algo numa conversa, de passagem, com o tom de quem não quer lembrar. Jogador tem que perguntar pra ouvir o resto (pull).

**Via ambiente:** o primeiro Silencioso. O primeiro Berserker à noite. O primeiro encontro com um Virulento que resulta em infecção inesperada. O jogo não pausa pra apresentar — o encontro acontece, o jogador aprende, o mundo segue indiferente.

O Berserker sub-mutado pode nunca ser encontrado diretamente num run. O jogador provavelmente vai saber que existe — por relato oral, por caco, por ter estado no lugar errado e sobrevivido — sem ter enfrentado um. Isso é suficiente.

---

## 2. Sistema de Bosses

### 2.1 Princípio

**Não existem bosses intrusivos.** O jogo não pausa, não apresenta, não força confronto. A diferença entre um inimigo memorável e um boss comum não é a força do inimigo — é **quem decide o momento do encontro**.

Boss intrusivo: o jogo decide, o jogador reage a um evento scriptado.
Boss não-intrusivo: o jogador entra num espaço, toma uma ação, o mundo reage. O encontro é consequência, nunca evento programado.

**Nenhum boss é obrigatório.** O jogador que nunca pega side-quests nunca encontra esses encontros por design. O survival puro permanece intacto.

---

### 2.2 Três categorias de boss

---

**Subjects (subject-0 e subject-1 — o casal)**

Os primeiros pacientes. Primeiros a ter a latência despertada. São a horda — não morrem por ela, estão no topo da cadeia. Únicos da espinha que agem no presente (os outros 6 pontos são arqueologia; o casal é predador ativo).

- Duráveis por natureza diegética, não por proteção narrativa
- Sem barra de vida, sem introdução, sem evento de encontro
- O jogador pode desviar, enfrentar ou correr — a escolha é dele
- Aparecem em qualquer momento posterior ao P4 (quando o jogador tem ou não tem o contexto muda o peso do encontro, não a mecânica)

*Regra-Sif (Dark Souls):* mesma luta pros dois jogadores. O conhecimento muda o peso, nunca a mecânica. Desinformado: obstáculo forte. Informado: tragédia — aquilo era a mulher que um homem destruiu o mundo pra salvar. Fugir vira decisão emocional, não tática.

*Como existem no mundo:* podem ter dizimado um acampamento que o jogador encontra vazio. Ecos de sobreviventes aterrorrizados falam de dois que se movem juntos e não morrem. O jogador topa com os efeitos antes de topar com eles.

---

**Boss de side-quest — o NPC transformado**

Side-quest de busca por uma pessoa. Ao chegar: o NPC já está transformado.

- Não é um boss de combate — é um boss de decisão: matar pra pegar o item/mensagem que carrega, ou tentar contornar?
- O zumbi resultante é levemente mais resistente que o padrão — não por stat inflado, mas pra criar peso. Matar este custa mais. Era uma pessoa. A missão começou porque alguém se importava.
- A mensagem/item que ele carrega é o caco mais trágico possível: informação produzida por alguém que já não existe pra recebê-la.
- Se a missão era encontrá-lo vivo: o jogador já falhou antes de pegar o item. A entrega ao NPC vivo é o fechamento de um loop que já estava partido.

*Três campos:*
- Gatilho: jogador aceita a missão e chega ao local onde o NPC deveria estar
- Cancelamento: o NPC pode ter sido eliminado antes pelo offscreen (horda, outro grupo) — missão nunca foi completável; o local está vazio; sem aviso
- Cadeia: missão entregue → NPC vivo recebe a mensagem de alguém morto; jogador presencia a reação; possíveis flags de mundo disparadas

---

**Boss de gatilho ambiental — o Forte emergente**

Um item num espaço. Ao pegar: uma barricada cede, uma porta quebra, algo que estava contido é liberado.

- O zumbi que emerge é um Forte levemente acima do padrão — mais resistente, não mecânica nova
- O jogador atento pode perceber antes de pegar: sons abafados do outro lado, barricada levemente deslocada, marcas de pressão no batente. Tem a opção de se preparar.
- O jogador desatento pega e aprende da maneira mais cara
- Sem punição arbitrária — o mundo deu os sinais. Ler sinais é o jogo inteiro.

*Três campos:*
- Gatilho: jogador pega o item / aciona o gatilho no espaço
- Cancelamento: o espaço pode estar já destruído antes de o jogador chegar (o Forte já saiu, o item continua lá mas o "boss" já foi); ou o item pode ser ignorado — nada acontece, o Forte permanece contido
- Cadeia: Forte eliminado → área agora aberta, recursos acessíveis; Forte não eliminado → zona de risco ativo; jogador fugiu → Forte patrulha a zona como habitante permanente

---

### 2.3 Tabela de bosses

| Tipo | Como aparece | Quem decide | Obrigatório |
|------|-------------|-------------|-------------|
| Subjects (casal) | Encontro livre no mundo, pós-P4 | O mundo — podem estar em qualquer zona | Não |
| NPC transformado | Via missão de busca | O jogador — ao aceitar e seguir | Não |
| Forte emergente | Via ação do jogador no espaço | O jogador — ao pegar o item | Não |

Nenhum usa barra de vida. Nenhum pausa o jogo. A diferença entre eles e um zumbi comum é **peso e contexto**, não mecânica separada.

---

## 3. Tutorial e Onboarding

### 3.1 Princípio

O jogador é inteligente o suficiente para aprender a jogar sem que tudo caia convenientemente na frente dele. O tutorial não explica o jogo — apresenta os controles físicos uma vez e deixa o mundo ensinar o resto.

**Dois tipos de tutorial com lógicas diferentes:**

| Tipo | O que ensina | Como entrega |
|------|-------------|--------------|
| Tutorial de controle | O que o jogador *pode fazer* fisicamente | Aparece uma vez, some |
| Tutorial de sistema | Como o mundo *funciona* | O mundo responde às ações; nunca explicado |

O segundo nunca é ensinado diretamente — o jogador deduz pelas consequências. Andou rápido, fez barulho, atraiu zumbi. Andou devagar, passou despercebido. O sistema foi aprendido sem uma palavra.

---

### 3.2 A abertura

**Cutscene muito vaga.** Não explica nada de forma completa — só estabelece um fato: *os mortos levantam*. Intencionalmente rasa, intencionalmente ambígua. É o P1 da espinha em forma de abertura.

Ao final da cutscene ou junto a ela: o cartaz de saúde pública (CO-B da árvore de cacos) aparece em cena. É o primeiro caco do jogo. Não é destacado, não é sinalizado como importante. Está lá porque estaria lá. O diário do jogador o registra automaticamente. O jogador que presta atenção percebe que o diário existe e que o mundo tem memória. O que ignora e continua sobrevivendo nunca soube que havia um sistema narrativo lá.

*O primeiro caco como tutorial invisível:* o CO-B é o onboarding do sistema de lore sem ser apresentado como tal. É pull na direção certa.

---

### 3.3 Controles

- Ao assumir o controle, os controles básicos aparecem na tela **uma vez**
- Somem após alguns segundos ou após o jogador usá-los
- Disponíveis a qualquer momento nas **configurações** — sem penalidade por consultar
- Ao encontrar o primeiro zumbi e ser atacado: o botão de ataque (M1) pode ser reforçado **durante aquele combate específico**, desaparecendo após

Sem tutorial de mecânica avançada. Sem pop-ups de "você aprendeu: sneaking!" Sem dicas contextuais automáticas além dos controles básicos.

---

### 3.4 HUD de descobertas

O jogador carrega um registro do que já aprendeu a fazer — receitas, construções, habilidades com skill-books.

**Regras do HUD de descobertas:**
- Itens aparecem **conforme descobertos** — não há lista completa visível
- **Não existe total explícito** de receitas disponíveis. O jogador vê o que sabe fazer, nunca quantas coisas ainda não descobriu
- Conquistas (se o jogo for lançado em plataforma que as suporte) podem registrar totais — mas isso é camada opcional de completismo, não parte do HUD central
- Receitas liberadas por skill-books aparecem no HUD; o skill-book em si custa energia pra usar (lore de qualquer tipo é grátis; aprender habilidade é esforço tributado — §11 do GDD_EXPANSAO)

*A distinção entre mapa de progresso e diário de descobertas:* o HUD mostra "você sabe fazer bandagem, barricada improvisada, estimulante caseiro" — sem o "e mais 9 que você ainda não achou." A diferença é entre progresso por checklist e descoberta genuína.

---

### 3.5 Como o mundo ensina

Alguns sistemas que o jogador aprende por consequência, nunca por texto:

| Sistema | Como é aprendido |
|---------|-----------------|
| Som bidirecional | Fez barulho → zumbi apareceu de longe sem ter visto o jogador |
| Sneaking | Andou quieto → passou por grupo de zumbis sem alertar → recompensa óbvia |
| Silencioso | Levou ataque sem aviso sonoro → paranoia de que pode haver mais |
| Virulento | Mordida → infectado inesperadamente → % de infecção claramente diferente |
| Berserker dormente | Passou por corpo de dia sem reação → à noite estava ativo na mesma zona |
| Farejador | Zumbi que estava longe e foi derivando em sua direção sem linha de visão |
| Barricada vs. Inteligente | Porta destrancada foi aberta sem força → barricada necessária |

Cada um desses é um encontro de aprendizado que o jogo nunca anuncia. O mundo foi consistente; o jogador deduziu a regra.

---

## 4. Changelog

- **Sessão 2 (jun/2026):** criação do documento. Cobre tudo definido após `ARVORE_CACOS.md` — sistema completo de zumbis (9 tipos, 4 sub-mutações, dupla-categoria, raridades), 3 categorias de boss não-intrusivo, filosofia e implementação de tutorial/onboarding.
