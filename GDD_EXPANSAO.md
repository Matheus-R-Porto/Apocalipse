# APOCALIPSE — GDD de Expansão: Motor de História & Mundo

**Documento companheiro do `GDD.md`.** O `GDD.md` cobre o que já foi implementado no servidor local (passos 0–6). Este documento cobre o que foi **definido em design** para a narrativa, o mundo e os sistemas que os sustentam — esteja ou não construído ainda. Tudo aqui é fonte de verdade até ser reaberto explicitamente.

**Regra de leitura:** quando uma ideia nova conflitar com algo deste documento, o conflito tem que ser apontado antes de prosseguir. A base de comparação é o `GDD.md` **mais** tudo que está aqui.

**Status da sessão:** A, C (parcial), legibilidade, survival, mapa, diálogo, criação de personagem e a **via material da espinha (P1–P7)** estão fechados. Pendente: vias divina / conspiração / contágio / recusa; cacos concretos do P1; item E (números da espinha).

---

## 0. Glossário rápido

| Termo | Significado |
|-------|-------------|
| **Caco** | Fragmento de informação no mundo (bilhete, K7, transmissão, fala de NPC, cena). |
| **Espinha** | Os 7 pontos da verdade central. O que não pode se perder por completo. |
| **Verdade-do-autor** | A verdade canônica real (na bíblia privada). O jogador nunca a tem 100%. |
| **Verdade difusa** | Fato exprimível de várias formas, sobrevive distribuído (vai na espinha). |
| **Verdade pontual** | Nome/número singular (Cicada, 3301, subject-0/1). Tesouro opcional, perecível. |
| **Lente** | A visão de mundo de quem produziu um caco (material, divina, etc.). |
| **Ledger** | Registro global de feitos do jogador (flags do StorySystem). |
| **Heartbeat** | Tick lento de mundo (minutos, não frames) que move o mundo offscreen. |
| **Simulação diferida** | O mundo offscreen não roda ao vivo; é resolvido na revisita. |
| **Primitiva / gradiente / evento** | Peças que compõem o estado de uma zona (ver §3). |

---

## 1. Princípios-raiz (regem tudo)

Estes são os axiomas. Toda decisão de conteúdo deve respeitá-los.

1. **O mundo não se importa com o jogador (Rain World).** O mundo acontece com ou sem ele. A indiferença é verdadeira — não é cenário decorativo. O jogador é **testemunha, nunca peça**: não tem relação com a origem do apocalipse, não é o escolhido, não é imune-especial. A verdade que ele monta é sobre **estranhos**.

2. **Tudo é tendência, nunca regra.** Rádio tende a confiável, lugar farto tende a seguro, etc. — mas **violações deliberadas** existem e são o que impede o jogador de resolver a epistemologia com um atalho. Exceções **raras na frequência, devastadoras no impacto** (comum na mente do jogador, raro no mundo).

3. **Verdade coerentista.** O jogador julga um caco por **encaixe** com outros cacos, não por correspondência com a realidade (que ele nunca vê direto). Coerência é o único sinal disponível; veracidade só o designer conhece. O buraco entre as duas é o jogo inteiro.

4. **Toda fonte é sincera e nenhuma é completa — e nenhuma sabe disso.** Ninguém sinaliza a própria incerteza; todos transmitem sua versão parcial com a convicção de quem tem o todo. **Inclusive o jogador.** Não há observador externo lúcido. Por isso o jogo **nunca** dá uma confirmação de "VOCÊ DESCOBRIU A VERDADE".

5. **O específico decai em difuso (seta do tempo).** Tudo nasce pontual, fresco, com autoria, e envelhece virando atmosfera anônima. Rege os três sistemas-irmãos: **fragmento, diário e topografia**.

6. **Consequência é permanente, resolução é ponderada (não random).** Os feitos do jogador mexem nos **pesos**; o acaso escolhe dentro do plausível. A gravidade do jogador é forte **localmente** e **decai íngreme com a distância** (ver §2).

7. **Nada essencial mora atrás de uma única fonte perecível.** A espinha é distribuída e redundante. Perder um caco nunca derruba a compreensão central.

8. **Forma briga com conteúdo.** A verdade frequentemente chega na embalagem menos confiável (relatório frio, bilhete tremido), e a mentira na mais convincente. A verdade compete em **desvantagem retórica**.

---

## 2. Mundo offscreen — simulação diferida + heartbeat

**Como dizer ao claude code:** *"O mundo resolve preguiçosamente, mas resolve tempo-autônomo + meus atos, nunca só meus atos."* Nunca "simula tudo ao vivo" (derrete o framerate).

### Arquitetura
- **Chunk / célula:** unidade espacial. Carrega o que está em volta do jogador.
- **Simulação diferida (lazy/offscreen):** zonas fora da tela não rodam. Quando o jogador chega (1ª vez ou revisita após T tempo), o resolver computa **duas coisas**:
  1. **Tempo-autônomo** — o que o heartbeat *teria feito* na ausência (hordas migraram, NPC morreu, comida apodreceu). Existe sempre, inclusive onde o jogador nunca agiu.
  2. **Ripples dos feitos** — o que os atos do jogador empurram (via ledger).
- **Heartbeat de mundo:** tick lento (minutos). Dirige tanto grandes mudanças distantes quanto micro-deltas próximos (a "ilusão de vida"). O autônomo **pode sobrescrever** a consequência esperada do jogador (você preparou um refugiado na zona 2, mas uma horda autônoma já varreu a zona 1 — você não recebe nem o refugiado).
- **Ledger de feitos:** é o **StorySystem do GDD** (flags booleanas). Feito do jogador é só mais uma flag. Não inventar sistema novo — estender esse.
- **Resolução = tabela de pesos** (mesma ideia de loot table).

### Curva de gravidade (item A — TRAVADO)
- Feito do jogador **domina** na zona onde ele agiu e nas **vizinhas imediatas**.
- A cada anel pra fora, o peso autônomo sobe.
- Após ~2 anéis, o mundo decide praticamente sozinho.
- **Decaimento íngreme, não suave** (sobrevivente em pânico não viaja longe; o momentum do apocalipse é maior que qualquer indivíduo).

### Consequência aceita: o mundo se esvazia sozinho
Offscreen + mortalidade + recursos finitos = **o conteúdo perdível é o default, não a exceção**. Sobreviventes que o jogador nunca conheceu morrem na ausência dele. A maior parte da narrativa, qualquer jogador individual nunca verá — e isso é o tema (entropia; você chega sempre tarde demais).

### O jogador é uma força de entropia
Andando pelo mundo, o jogador **rebaixa** zonas (de fartas a saqueadas) só de passar, mexer e fazer barulho. Indistinguível, para o próximo sobrevivente, de uma horda que passou. O tema virado mecânica.

---

## 3. Estado de zona — gradiente + eventos (item C)

Duas camadas ligadas pela seta do tempo (§1.5).

### Camada 1 — Gradiente de ocupação (estado difuso)
Um eixo único, 0–100%, resolvido na chegada. Responde *"quão mexido/seguro/farto é este lugar?"*. **Gradiente como tendência, não caixas rígidas** — perigo e veracidade são eixos que normalmente correlacionam mas **podem desacoplar** (ex.: horda num lugar 100%, cacos falsos num lugar farto).

| Nível | Leitura típica |
|-------|----------------|
| **100%** | Praticamente intocado, poucos/nenhum zumbi, recursos variados (por bioma), possível lore/side-quest. *Mas* um lugar bom demais é suspeito. |
| **75%** | Poucos rastros, alguns zumbis (talvez vieram por som de alguém), menos recursos. |
| **50%** | Rastros evidentes, alguém passou (recente ou não), poucos recursos; notas tendem a ser de sobreviventes. |
| **25%** | Muitos rastros, gente se abrigou aqui, recursos escassos, mais zumbis (talvez morreram aqui); cacos sobre os sobreviventes. |
| **0%** | Destruído/tomado por zumbis, recursos quase inexistentes (exceção: laboratório-clímax). **Também engloba o "intocado-suspeito"** — limpo demais, base ou armadilha. |

**O anel:** 0% e 100% se tocam. O intocado-verdadeiro (com a poeira do apocalipse) e o intocado-suspeito (limpo de propósito) **parecem iguais e são opostos**. Até a boa sorte é suspeita. As % são **subjetivas** — o jogador reconhece parte do padrão, nunca tem certeza.

**Três campos do gradiente:**
- *Gatilho:* ocupação resolvida na chegada (ledger + heartbeat + tempo de ausência + distância).
- *Mutação:* não é fixa — uma zona 100% não-visitada pode decair pra 25% offscreen; o jogador só vê o snapshot da entrada (e o diário pode estar desatualizado).
- *Cadeia:* a ocupação que o jogador **causa** vira input da ocupação das vizinhas.

### Camada 2 — Eventos empilháveis (incidentes pontuais)
Zero ou mais, independentes, colados sobre o gradiente. Respondem *"o que aconteceu de pontual aqui?"* (corpo recente, fogueira reaproveitada, sinal de luta).

**Teste de qual camada:** tem lugar exato + momento → evento. É a atmosfera geral → gradiente.

**Três campos dos eventos:**
- *Gatilho:* entrar/reentrar rola os eventos, pesados por ledger + heartbeat + tempo + distância.
- *Cancelamento:* um evento pode não aparecer porque o mundo o consumiu antes (o corpo fresco já foi devorado e virou mancha/gradiente).
- *Cadeia:* o evento (ou o que o jogador causa) realimenta o gradiente da zona e das vizinhas.

**A fronteira entre as camadas é o tempo:** todo incidente nasce evento (pontual, fresco, com autoria) e morre gradiente (difuso, velho, anônimo).

### Toda primitiva/evento precisa de:
1. **Ser legível no vocabulário real do jogo** (quadrados, itens largados, corpos, tiles danificados, texto curto). Se só funciona em prosa, não existe.
2. **Carregar um rastro causal de baixa visibilidade** embutido (o investigador liga à própria ação; o jogador comum vê só "uma cena").
3. **Empilhar** sem se contradizer.

### Conjunto de primitivas-base (Tier 0, testável já)
1. **Revolvido/Saqueado** — recursos sumiram; itens sem valor largados na direção da saída.
2. **Intocado** — prêmio silencioso da furtividade; o rastro é a *ausência* de rastro.
3. **Passagem de horda** — dano que entra por um lado e sai por outro; o lado de entrada aponta pra fonte do barulho.
4. **Morto recente** — corpo fresco (não-zumbi), carrega loot e às vezes caco escrito; a forma da morte é lida na cena.
5. **Esvaziado** — zumbis que deviam estar não estão; a explicação está *fora* da zona (espelho do "horda passou" da vizinha).
6. **Presença sobrevivente** *(precisa de NPC)* — refugiado/ocupante/oportunista; rastro = de onde veio + postura.

> Primitivas de **ausência** (intocado, esvaziado) têm risco de passar por "mundo normal". Mantê-las legíveis é responsabilidade do design de tell.

---

## 4. Legibilidade de consequência

Quando uma ação do jogador causa um efeito offscreen (ex.: a barulheira derruba uma ponte), ele liga causa a efeito?

- **Primeira jogatina:** silêncio quase total. Migalhas existem mas quase inexistentes — só pro investigador que procura.
- **Entre jogatinas:** o jogador dedicado, observando, deduz a **tendência** (nunca a lei).
- A migalha é uma **camada embutida na primitiva** (presença confiável, visibilidade baixa — modelo FromSoft), não um objeto colocado à mão evento por evento.

**Como se aprende (tudo ponderado):**
- O que converge com o uso repetido é a **frequência** (lei dos grandes números) — não a certeza individual. A 10% de chance, em 1 milhão de runs, ~100 mil quedas; o número fica pinado, o sorteio individual não.
- O jogador real vive em N=10, N=30. Em amostra pequena a frequência observada é ruidosa e enviesada — então o "conhecimento" dele sobre as regras é **ele mesmo não-confiável** (estende a unreliability do lore pra mecânica).
- **A separação dos pesos** decide se o padrão é pegável: 85 vs 15 → direção aprendível em ~5 runs; 55 vs 45 → invisível no ruído. A separação **segue a curva de gravidade (§2)**: forte perto (crackável), fraca longe (perdida no ruído).
- **Piso autônomo:** mesmo na furtividade total, a ponte às vezes cai sozinha. Nunca preto-no-branco. Lição que o jogador aprende: *"barulho condena com força; furtividade protege quase sempre, mundo permitindo."*

**Distinção:** o **lore** deve ser incognoscível por inteiro; a **mecânica de causa-efeito** deve ser aprendível como tendência pelo jogador dedicado (senão é injusto).

---

## 5. Survival

### Energia (stat separado de Fome — TRAVADO)
Unir energia e fome cria o exploit "como muito → reseto cansaço". Comida e descanso curam coisas diferentes.

- **Trava de acesso é só a fome:** só pode comer se tiver fome. Energia que passa de 100% é clampeada a 100%.
- **Energia por comida é permitida e desejável** — gera o dilema do desperdício (faminto + energia cheia + só tem o energético bom = gasta recurso bom na hora errada; isso é conteúdo, não bug). O gargalo da fome impede spam naturalmente (você não controla quando tem fome).
- **Classificação de alimento (carrega a intenção, sem tabela rígida):**
  - **Nutritivo** — gasta fome à altura da energia que dá (trava rápido, sem spam).
  - **Estimulante** (café, energético, adrenalina) — quase nenhuma fome, muita energia, mas via **dívida com crash** (queda abaixo do normal quando a dívida vence; não é só o buff acabando).
  - **Proibido:** alto-energia + baixa-fome + sem-crash. Esse fura o gargalo. Não pode existir.
- **Comida só sustenta energia até um patamar medíocre; descanso é o único caminho pro topo.**
- **Efeito de borda:** comer pra raspar energia empurra pra **saturação** (barra invisível planejada). Outra dívida.

### Vigília (horas acordado — modificador, não pool)
- Vigília **não drena** energia, ela **encarece** energia (multiplica o custo de toda ação). É o juro acumulado da dívida do estimulante. Só **dormir** zera.
- **Tell obrigatório** (vigília invisível encarecendo em silêncio = obscuridade, não dificuldade). Canal: o próprio corpo (não há mundo pra ler). Em ordem:
  - **Sintomas sentidos** (recomendado, puxa pro horror): tela escurece/embaça, passos pesados, mira treme, micro-alucinações na privação extrema.
  - **Registro no diário** (mínimo barato): "não durmo faz dias, minhas mãos tremem".
- **Recupera energia:** comida (pouco, teto baixo), estimulantes (com dívida). **Não troca uma noite de sono** — é dever do sobrevivente achar lugar seguro pra dormir. (Dormir = exposição: cego e surdo enquanto o mundo simula offscreen.)

### Alucinação (da privação extrema)
- **Muda o tom, não machuca.** Pode imitar uma **ameaça** (vulto, passo sem fonte), **nunca** um caco (bilhete que não existe, NPC que some). Falsificar lore = injustiça epistêmica; assombrar a percepção = atmosfera. Mais uma camada de não-saber (agora não confia nos próprios olhos).

### Infecção
- 20% por mordida (GDD). Sem mitigação, condena iniciante por azar — por isso existe a **semi-cura** (ver §11, item D).
- A latência (espinha P2) pode ter implicação mecânica: o personagem talvez já seja portador latente. **Decisão pendente** (lore-só vs. mecânica de horror corporal).

---

## 6. Diário (item A — TRAVADO)

**Apoio de memória, não arquivo.** Impede ser um oráculo da verdade.

- Guarda **só o essencial, sem fazer distinção** entre falso e verdadeiro.
- **Não é Ctrl-C/Ctrl-V — é resumo do que o personagem entendeu** ("forja" a memória). Guarda o necessário, não tudo.
- **Regra do resumo:** comprime a **prosa**, nunca descarta uma **afirmação distinta**. Pode jogar fora motivos e elaboração ("X é seguro por A, B, C" → "X considerado seguro"), mas toda claim separada sobrevive — inclusive a contradição e o rabisco da margem.
- **Voz:** lembrança subjetiva e falível do personagem, **fiel em grande parte** mas pode estar enganada ("me pareceu seguro, pelo que li"). Pode comprimir e sentir medo/afeto; **não pode concluir** qual claim contraditório é o verdadeiro (estenógrafo ansioso, nunca detetive).
- **Memória NÃO é infiel/distorcida** (isso quebraria a triangulação — o jogador precisa de pontos fixos pra raciocinar). Paranoia apontada pro mundo = tensão; apontada pra própria cabeça = injustiça. A fonte mente; o registro da fonte não treme.

**Correção (só o que o jogador desmente PESSOALMENTE):**
- O diário só risca o que a realidade desmentiu na frente do jogador (a ponte que disseram segura e estava destruída). **Nunca** apaga por outro boato contradizer (isso o tornaria detector de verdade).
- Informação **prática** se autocorrige pela experiência; informação **mítica** fica incerta pra sempre (não dá pra observar "o vírus veio do laboratório X"). O diário protege o mistério grande sozinho.
- **Texto da correção registra observação, não veredito retroativo:**
  - Mundo mudou: *"Ponte GBA tomada por oportunistas quando cheguei. Devia ter imaginado."* (fato + afeto)
  - Fonte mentiu: *"Fui à Ponte GBA. Nunca foi segura."* (observação)
  - Proibido: *"eu sabia que não era"* (reescreve conhecimento que o personagem não tinha; apaga a própria responsabilidade pela queda).

**O que entra:** só o **explícito** (bilhete lido, rádio captado) — curto. **Não** registra narrativa ambiental nem o *significado* de uma cena (quarto revirado, corpo posicionado) — isso fica na cabeça do jogador. Memória pro que é texto; atenção pro que é mundo.

**Espinha isenta de resumo:** caco central não vira gist vago — mantém texto cheio, ou descartá-lo larga o objeto no chão (recuperável).

---

## 7. Diálogo — quatro categorias

Diálogo existe, é importante, mas **enxuto** e não-intrusivo (Dark Souls: a história acontece; se o jogador não para pra observar, não sabe que está acontecendo). Sem árvore de diálogo, sem caixa com retrato, sem cutscene, sem voice-over.

| Categoria | Direção | Regra |
|-----------|---------|-------|
| **1. Lore / mundo externo informativo** | **Pull** | Jogador inicia, sempre. NPC nunca chega falando pra *informar*. |
| **2. Estado interno do corpo** | **Push** | Automático, por **transição** de limiar (não por estado contínuo), raro. Voz do corpo (fome, cansaço, dor). |
| **3. Hostilidade com agência** | **Push** | Entidade agindo contra o jogador. Fala curta, motivada (motivo possivelmente falso), **nunca informativa**. |
| **4. Broadcast ambiental** | **Não-dirigido** | Emissão pro mundo (rádio Cicada). Existe com ou sem o jogador; ele só calhou de estar no alcance. |

**Princípio que separa 1 de 3:** *um NPC pode chegar falando pra te confrontar, nunca pra te informar.* Se a fala te ensina sobre o mundo, é pull empurrado (proibido). Se comunica o que ele sente/vai fazer, é push legítimo.

**Princípio do push:** o mundo dá push quando **reage a uma ação tua** (hostil = rancoroso; frio = Cicada interessada). Proibido o push **não-causado** (NPC aleatório te entregando lore).

**Respostas do jogador:** vocabulário simples e direto — *sim / não / não sei / talvez / depois / agora*. Serve pra **aceitar/recusar quest**, **nunca pra contestar acusação**. Contra a acusação falsa, o jogador **não tem voz de defesa** — a única "defesa" é o **ato** (baixar a arma, poupar) e deixar o NPC interpretar o gesto.

**Renderização:** texto curto flutuante no canvas (sem caixa/retrato) e/ou descrição de item. Sem UI nova.

### Acusação falsa armada
NPC rancoroso ataca por uma forja que engoliu ("Você matou meu irmão"). Acredita 100%, você talvez nem saiba do quê. Ninguém para pra esclarecer — a injustiça é o conteúdo.

---

## 8. Morte como caco que o jogador planta sobre si

Toda morte **assina** uma história no chão. A variável que importa não é "quão brutal" — é **quanta evidência sobra e o que ela diz**. Três métodos:

| Método | Rastro | Efeito |
|--------|--------|--------|
| **Normal** | Corpo identificável, autoria humana clara; *quem* não, a menos que algo te ligue. | Assina autoria genérica. |
| **Brutal (puro)** | Cena que grita "alguém perigoso fez isto". | Assina monstro: reduz ataque aberto, mas atrai **falsa-aliança** (ver abaixo). |
| **Tortura por info** | Extrai um caco do NPC + cena de monstro. | Caco com **veracidade real 0.6 / comprometido 0.4**, sem etiqueta visível (ver abaixo). |
| **Terceirizado** | Zumbi/animal/armadilha; evidência aponta pro mundo. | Único jeito de matar **sem assinar** — mas falha se houve testemunha viva. |

**Três campos:**
- *Gatilho:* método X → planta `caco_de_cena(método, local, vítima)`.
- *Cancelamento:* o mundo edita o rastro antes de alguém ler (horda devora o corpo → vira indistinguível de terceirizado; testemunha não-vista sobrevive → contradiz a cena forjada).
- *Cadeia:* quem acha ajusta a opinião — direto se testemunhou, lossy/distorcido se só achou o corpo.

### Tortura — detalhe
- **Não dá verdade garantida** (seria o único oráculo do jogo). Entrega **0.6 verdadeiro / 0.4 comprometido** (parcial/enganoso/armadilha — não "falso" binário). É a **taxa real**, **não uma etiqueta visível**: o caco entra no pool parecendo igual a qualquer outro; o jogador só descobre por coerência ou teste. A tendência-à-verdade é intuível na cauda, nunca por caso.

### Brutalidade — trade-off auto-balanceado
Menos gente te ataca de frente, mas quem chega esconde melhor o motivo (oportunistas fingindo aliança por medo). Reduz hostilidade aberta, **aumenta traição velada**. Você não fica mais seguro — troca um perigo legível por um ilegível.

### Duas vias de descobrir "quem armou pra mim"
- **Tortura** — rápida, suja, caco 0.6/0.4, te marca de monstro.
- **Poupar e reencontrar** — lenta, incerta (o NPC pode morrer offscreen antes), mas o caco vem com contexto e arrependimento, mais interpretável.

---

## 9. Reputação

- **Feito = flag booleana permanente** (`massacrou_zona2 = true`). Cabe no StorySystem, nunca volta.
- **Reputação = função calculada na hora:** `f(feitos, distância_do_feito, tempo_decorrido, quais_fragmentos_chegaram_a_esse_NPC)`. O **ato** é permanente; a **crença** sobre ele é derivada e muda sem nenhuma flag reverter.
- **Reputação É FORJÁVEL.** O jogador pode ser odiado por algo que não fez (oportunista forja e pendura nele). NPC influencia NPC; o jogador também pode mentir sobre os outros. Pegada RPG de mesa.
- **Duas leis de propagação diferentes:**
  - **Consequência física** decai íngreme com a distância (curva A).
  - **Reputação** propaga por **alcance de fragmento** — pode saltar longe (um rádio te nomeia) mas chega distorcida/lossy. Uma zona distante pode te **conhecer** sem ser fisicamente **afetada**.
- **Boato NPC→NPC** resolve-se só quando o jogador encontra o NPC (nunca tick global de fofoca rodando o tempo todo).

### Escolha testemunhada (canal não-lossy)
Poupar/matar/como-matar é um canal **direto** de formação de opinião (testemunho em primeira mão), em contraste com a reputação por boato (lossy). Poupar quem te acusou falsamente pode limpar teu nome; matá-lo **confirma a forja aos olhos do mundo**. A escolha não é moral abstrata — é **epistêmica**: edita qual versão de você o mundo acredita.
- *Gatilho:* poupar (flag de não-atacar).
- *Cancelamento:* ele morre offscreen antes de a consequência render (poupou, mas o mundo não; ninguém avisa).
- *Cadeia:* sobreviveu e te viu poupá-lo → aliado/correção/reavaliação silenciosa. Matou → confirma a fama.

---

## 10. Mapa & topologia

Mundo relativamente grande (ordens de magnitude além do build de uma tela; depende de mapa maior + streaming por chunk).

### Biomas (cores do esboço)
| Cor | Bioma | Ameaça |
|-----|-------|--------|
| Azul | Água (rios, mar, lagos) | Travessia (custo) |
| Verde claro | Floresta simples / plana (campings) | Misto: zumbis + animais; casas de campo com recursos |
| Verde escuro | Floresta densa | **Animais selvagens** (não detectam por som como zumbi — IA diferente); "seguro de zumbi" não é "seguro" |
| Amarelo | Área rural (fazendas, sítios) | Poucos zumbis, mas fazendeiro tem arma → barulho → zumbi |
| Laranja | Praia (perto d'água) | — |
| Cinza | Cidades (2 médias no topo = início; 1 megalópole + 1 pequena no fundo) | Muitos zumbis |
| Preto | 3 pontes + estradas | Ponto crítico (ver abaixo) |

### Estrutura crítica: 2 clusters + 3 pontes
- O mapa é cortado por água. Topo (início, 2 cidades médias) liga ao fundo (megalópole + cidade pequena) por **3 pontes apenas**.
- Pontes **caem** (horda, oportunista, barulheira do jogador). Estado alcançável: as 3 caem e os clusters ficam severados.
- **A água é atravessável (parede de recurso, não parede dura):**
  - **Nado** — gasta energia.
  - **Barco** (remo/lancha — lancha implica combustível; barco ancorado simula offscreen, pode ser roubado/destruído).
  - **Roupa de mergulho** — travessia barata mesmo esgotado. **É a válvula de escape do sistema** — garante que um jogador depletado com as 3 pontes caídas ainda saia.
- A travessia tem que ser sempre **possível** (cara, arriscada), **nunca bloqueada** — senão "ignorável" vira "negado por geografia".

### Progressão
Início no topo + megalópole no fundo cria uma **progressão linear implícita** num mundo aberto (a megalópole como "deep area" estilo Dark Souls; a ponte como portão). **100% ignorável** — o jogador pode ficar numa cidade pequena/camping e jogar survival puro.

### Coordenadas por rádio
Podem ser geográficas ou por referência local ("rua tal, ao lado do KFC").

### Teto tecnológico (TRAVADO)
Início dos anos 80. **Sem celular, sem internet, sem GPS.** Telefone fixo primitivo, rádios (médios fixos + de bolso de curto alcance), K7, TV analógica. **Esta época é o que torna a informação plausivelmente frágil** (escassa, lenta, física) — o primeiro anacronismo (um celular) destruiria a premissa.
- **Mídia degradável = perecibilidade diegética:** papel mofa, fita estica, tinta desbota. A verdade é perdível por **entropia de mídia**, não só por gente morrer. O caco mais importante pode estar num K7 chiado, ilegível em partes (forma briga com conteúdo).

---

## 11. Criação de personagem (híbrido — TRAVADO)

O protagonista **não é perfeito em tudo** — é uma profissão (mecânico, cozinheiro, eletricista...), talvez nenhuma, e aprende o resto.

- **Modelo híbrido:** questionário de origem (quem você foi → sabor + **chaves de acesso**) + distribuição livre de pontos (o que você desenvolveu → quebra estereótipo, evita "policial = forte").
- **A origem dá acesso/habilidade, NUNCA ramos de história.** Sem trilha narrativa exclusiva (furaria "narrativa não-forçada"). Qualquer um pode aprender a mesma perícia depois por skill-book.
- **O protagonista é estrutural-zero na origem do apocalipse** (princípio §1.1). Blinda contra a deriva pro "escolhido". O casal-origem é tragédia de estranhos, não melodrama pessoal.
- **Porta aberta (não construir agora):** como o jogo nunca confirma o passado do personagem, até a própria origem pode ser material narrativo incerto.

### Habilidade gateia acesso, nunca interpretação
A perícia decide se o jogador **consegue a informação bruta** (limpar um rádio chiado, consertar, decifrar), **nunca o que ela significa**. A interpretação é sempre do jogador. O leigo não pega *aquele* caco; a verdade difusa chega por outros canais (nada essencial atrás de uma única chave).

### Skill-books (aprendizado diegético)
- Livros, fitas K7, etc. Aprender custa **energia** (é esforço mecânico tributado). **Ler lore é grátis** (descoberta não-variável). Uma transmissão pode ter as duas camadas: parte-lore (grátis) + parte-cripto (custa energia decodificar).
- Skill-book **acelera/aprofunda**, mas o básico de cada coisa é aprendível por tentativa-e-erro também (senão progressão vira loteria de loot perecível).

---

## 12. A VERDADE CANÔNICA (item D) — bíblia privada

> A **verdade-do-autor**. O jogador NUNCA a tem 100%. Mantida aqui para coerência; o que entra no jogo é só o subconjunto com portador físico plausível.

### A origem (cena que nenhum sobrevivente do jogo testemunhou)
Um **cientista**, desesperado, buscava reviver a **amada** (morta de uma doença não-catalogada), com apoio de uma empresa: a **Cicada**. Ele acreditou ter achado a "cura" e testou no corpo dela. Ela voltou — mas o corpo já em decomposição levantou e o atacou de imediato. Não era morto nem vivo, não era fraco, não era humano nem animal. Devorou o cientista parcialmente.

A Cicada observou. Descobriu que a "cura" na verdade **despertou uma doença não-catalogada que estava adormecida** — e agora se espalhava pelo ar daquela sala não-vedada, contaminando (ou melhor, *expondo o gatilho* a) todos os presentes. A doença despertada parecia diferente da original; estava **adormecida em 3301 casos documentados** inicialmente — pessoas, incluindo cientistas da Cicada, que tiveram **reação leve** (mal-estar, tontura, náusea momentânea) no instante do despertar da mulher.

Os testes continuaram até o **exército intervir** para apagar evidências — e foi esse apagamento que causou a catástrofe. Os dois sujeitos, **subject-0** (a amada — primeiro despertar) e **subject-1** (o cientista — segundo, mordido por ela; fica em aberto se esposa ou amante), foram liberados. "Conservados" pelo vírus e pelos estudos da Cicada, estavam diferentes — mais rápidos, mais fortes, agressivos. Atacaram todos no local; os militares não estavam fortemente armados. O vírus se espalhou. Como o subject-0, todo **infectado** (quem tinha a doença adormecida) que é arranhado/mordido tem a doença despertada — no melhor caso sobrevive ~5 dias (cansaço, fadiga, fome, sede, mal-estar) até morrer e, horas depois, levantar.

### Cicada-3301 (homenagem com justificativa diegética)
Referência deliberada ao enigma real. O número **3301** é diegético: os 3301 casos iniciais de reação.

### As três engrenagens que NÃO são clichê (não cortar):
1. **A doença pré-existia, dormente, em milhares.** O horror vem de dentro, já estava lá. Não é "vírus se espalha" — é "o gatilho ativa o que já estava em todo mundo".
2. **A "cura" é a causa.** Origem trágica e humana — amor e desespero, não maldade nem acidente burocrático.
3. **Cicada observou em vez de impedir.** Frio e específico. (Cicada não causou — assistiu e catalogou.)

### Verdade difusa vs. pontual
- **Difusa** (vai na espinha, garantida por distribuição): ressurreição deu errado → praga latente despertada → encobrimento.
- **Pontual** (tesouro opcional, perecível, point-of-failure): os nomes/números — Cicada, 3301, subject-0/1. Cripto pode gatear o pontual, **nunca o difuso**.

---

## 13. As facções — cada uma é uma lente

**Princípio:** cada grupo é uma **lente sobre a verdade-do-autor; nenhum a possui inteira.** São três jeitos humanos de lidar com uma verdade insuportável: **ocultar, ignorar, mitificar**. A contradição entre as fontes é o coerentismo difícil — a ambiguidade *emerge*, não é forçada.

| Facção | Lente | Postura |
|--------|-------|---------|
| **Cicada** | Material — sabe e esconde | Viu a origem (mas não sabe de tudo — foi pega de surpresa). Verdade ocultada por interesse. |
| **Caveira** | Não-liga pra causa | Verdade ignorada por irrelevância — pra eles importa sobreviver. |
| **Máscaras** | Divina — inventa sentido | Verdade substituída por fé. A infecção é castigo/milagre divino. |
| **Grupo acolhedor** | Ordem pragmática | Disposto a sobreviver com liderança e ordem, sem individualismo extremo, fé cega nem manipulação. Não-ingênuo. |

### Dizimar facções
Qualquer grupo pode ser dizimado pelo jogador (base fixa ou móvel). **Mas a verdade sobrevive:**
- A maioria dos cacos tem **versão escrita/gravada** (conversão oral→escrito na morte: o caco que um NPC importante carrega, se ele morre, vira escrito — guardado no corpo, ou uma flag o torna *encontrável* num lugar onde já existia).
- **Ecos:** sobreviventes não-filiados que sabem de um grupo morto. A verdade está distribuída em testemunhas externas, não só em membros.
- Grupo dizimado vira **gradiente** (atmosfera, rumor, marca), mas eventos-de-cenário ainda o usam — inflexionados (vingança, medo, fuga).
- **Caco sincero-mas-errado:** quando um grupo morre, os cacos da crença dele sobrevivem **descontextualizados** (a teologia das Máscaras vira "a praga é castigo" anônimo, contaminando o pool como possível verdade). A morte apaga não só pessoas mas o **enquadramento** que tornava a informação legível. *(Decisão: descontextualizado, não preservando "era crença deles".)*

### Caveira (núcleo + adjetivo)
- Existe como grupo, mas **para o exterior não se nomeiam** e agem individualistas (infiltram, ganham confiança, plantam desconfiança, roubam, culpam, somem). Individualistas até entre si — deixam alguém morrer pra sobreviver.
- **Dificilmente morre:** dizimar a base não acaba com quem estava fora. Um "Caveira" reaparece em eventos-de-cenário, te conhecendo pelo que fez (vingança, medo, fuga, ataque). Grupo = matável; **comportamento = permanente** (a próxima pessoa desesperada reinventa).
- Como se infiltram disfarçados em outros grupos, o oportunista-forjador está **em qualquer lugar** — o filtro geográfico "perto de Caveira, desconfie" morre sozinho.

### Cicada (a única lente que olha de volta)
- **Menor do que aparenta** (anti-anagnórise): não é o arquiteto onipotente — é competente-mas-incompleta, fria, assustada, sobrevivente. **Mas inteligente e manipuladora** ("os Caveira de fraque": se passa de deus, usa quem acredita nisso). Covarde (não impediu) **e** esperta (manipula) ao mesmo tempo.
- **Duas faces, descobríveis independentemente:** Cicada-histórica (catalogou e não impediu) + Cicada-presente (mesma liderança, ainda investigando, agora também sobrevivendo). A **fusão das duas é o golpe**.
- **Sabe por inferência tardia:** não vigilância em tempo real. Infere depois (cruzando com o jogador ou ecos). Vigilância incerta — o jogador nunca sabe se souberam, quando, o quanto. Espreita, não reage.
- **Manipula por curadoria de verdade, não mentira:** as transmissões dela são verdadeiras o bastante pra serem úteis (coordenadas, dicas reais). Ela **seleciona** verdades que servem aos objetivos dela (move os sobreviventes pra onde quer). Raramente mente no rádio (queimaria a credibilidade do canal).
- **Contato:** deixa um canal de ser contatada (pull pro lado dela — acioná-lo é se expor). Pode contatar por broadcast (não-dirigido) ou mensagem escrita (talvez criptografada, exige skill-book).
- **Objetivo (teto):** busca algo — talvez só sobreviver, talvez algo mais tenebroso. **Manter íntimo e perturbador** (usar/entender o subject-0, a fronteira morte-vida), nunca épico (dominar o mundo) — escalada épica ofusca o horror íntimo.

### Broadcast = gatilho público (sistema próprio)
- A Cicada (e outros) joga informação ao vento; o jogador calha de estar no alcance. **Reforça "o mundo existe sem você"** (a transmissão repete no vazio).
- A coordenada que você ouviu, **outros ouviram** → informação vira **competição**. Chegar primeiro, achar dez sobreviventes que também ouviram, achar a guerra que o chamado provocou, chegar tarde e achar corpos — a mesma transmissão gera cenas diferentes conforme *quando* você responde e *quem mais* respondeu.
- **Broadcast = gatilho público** (liga em todos no alcance) vs. **caco escrito = privado** (só quem segura, lê).
- **Rádio bidirecional** (de bolso) carrega o trade-off do barulho: emitir = se localizar (qualquer um na frequência ouve, inclusive quem você não quer). Decisão, não conveniência.

### Os subjects (subject-0 + subject-1) — o casal
- **Primeiros pacientes. São a horda — não morrem por ela.** Duráveis por natureza (diegético, não blindagem autoral). Não furam a indiferença — estão no topo da cadeia que ela alimenta.
- **Bosses não-intrusivos:** sem barra de vida; inimigos genuinamente fortes que o jogador encontra e **escolhe desviar/enfrentar/correr**. O jogo nunca manda matá-los; encontrá-los é acontecimento, não objetivo.
- **Únicos da espinha que agem no presente** (os outros 6 pontos são arqueologia; o casal é predador ativo no heartbeat — dizima acampamentos, gera ecos aterrorizados).
- **Regra-Sif:** mesma luta pros dois jogadores; o **conhecimento muda o peso, nunca a mecânica**. O encontro NÃO pode exigir a lore pra funcionar como gameplay (senão gateia narrativa). Desinformado: obstáculo forte. Informado: tragédia — aquilo era a mulher que um homem destruiu o mundo pra salvar; toda ação dói, não há via redentora (não há cura pra algo tão além). **Fugir vira decisão emocional** (não consigo ser quem mata aquilo), não tática.

### O cientista desertor (Saída B — fonte rica e parcialmente venenosa)
Um ex-membro da Cicada que desertou levando a semi-cura. **Não é narrador onisciente** — carrega três coisas, cada uma enviesada:
- **P7 (semi-cura): confiável** — ele a tem de fato.
- **P4 (intenção): a versão fria/errada da Cicada** — "era um sujeito de teste, um experimento". Ele **sinceramente não sabe** que foi ressurreição por amor (a Cicada via o cientista original como paciente, não como viúvo).
- **P6 (Cicada): enviesado por rancor** — sabe que ela é menor/manipuladora, mas pode exagerar a maldade dela.
- **O beat:** quem confia nele por causa do P7 (a cura funciona!) **herda a cegueira dele sobre o P4**. A fonte mais credível do jogo é o veículo involuntário da mentira mais importante. *Matar a verdade do P4 não precisa de vilão — só de uma fonte confiável que crê na versão desumanizada.* A verdade humana está guardada onde a Cicada nunca olhou: na vida privada do homem, não nos arquivos dele.

### Semi-cura (mitigação, não cura)
- **Vocabulário: "adormecer/silenciar", nunca "curar".** Re-adormece o que a mordida despertou; o jogador "curado" ainda é portador, só silenciado. Nenhuma segurança é real, só adiada.
- **Autônoma (não-obrigatória):** a receita existe (difícil, custosa), vazou de boca em boca / por documento de fugitivo. Seringas parciais existem, com **efeito colateral (queda de energia)** — mais uma dívida na teia (alívio agora, custo depois). A Cicada não é gargalo obrigatório da mitigação.

---

## 14. A ESPINHA — estrutura (fluxo ramificante)

### Forma (TRAVADA)
A espinha é uma **cadeia fato → pergunta → respostas-em-leque**:
- O **ponto 1** é um fato visto que **dispara a pergunta** (não tem interpretações próprias).
- O **ponto 2** é a primeira pergunta ("por que levantam?") e abre o **leque** de respostas.
- A **resposta que o jogador acredita determina qual pergunta ele faz a seguir** (busca ativa dirigida pela via — "o labirinto").
- **MAS os cacos não respeitam vias:** o mundo distribui cacos de todas as vias em todo lugar. O jogador constantemente esbarra em respostas divergentes — incluindo a verdadeira — para perguntas que nem fez. **Território garantido por distribuição, não por âncora.**
- A verdade, quando encontrada, compete em **desvantagem** contra a crença já formada — podendo ser **rejeitada no momento da descoberta** (o jogador na via divina ouve a explicação material e descarta como heresia; teve a verdade nas mãos e a jogou fora).

### Garantia: território, não fato
Cada ponto é um **feixe de cacos-versão** (cada versão filtrada por uma lente, escrita por uma pessoa). O feixe é redundante o bastante pra ser difícil perder o ponto inteiro; cada caco-versão é individualmente perecível, enviesado, às vezes contraditório com outras versões do mesmo ponto. O jogador quase sempre cruza *alguma* versão de cada ponto; quase nunca *todas*; nunca recebe um árbitro. **Garante-se contato com o território, jamais posse do fato.**

### Graus de fratura variáveis
A espinha não é uniforme. Vai de **fato observável estável** (P1, todos concordam que mortos andam) a **interpretação irreconciliável** (P4, ninguém concorda no porquê). Número de lentes e profundidade de sub-fratura **variam por ponto** — gasta-se autoração onde há fratura, economiza onde há consenso. **Sub-ramo só nasce de uma pergunta que divide a lente internamente** (ex.: na lente divina do P4, "o agente é santo ou demônio?").

### As lentes-família (eixo de cada ponto)
Sempre incluindo a **material/verdadeira como competidora em desvantagem** (senão a verdade não mora em nenhuma fratura, só na bíblia):
- **Material** — a verdade; fria, fragmentária, pouco persuasiva. *Lente: Cicada, ex-cientista.*
- **Contágio** — "vem de fora"; a mentira óbvia, sustentada pela percepção direta; a maioria. *Afasta da origem.*
- **Conspiração secular** — "alguém fez de propósito"; paranoia política; acerta "humano e deliberado", erra o resto.
- **Divina (fé)** — significado total; sub-fratura interna. *Lente: Máscaras.*
- **Recusa/pragmática** — não-explicação. **Lente de comportamento, quase não gera caco** (indiferença não documenta). É a maioria que não escreve história — e isso explica por que a verdade é fragmentária.

### Terror = afeto, não explicação
O **terror** não é uma família; é a **temperatura** de uma crença. Distingue as lentes pelo afeto: material → frieza analítica (na escrita); contágio → terror difuso ou recusa; conspiração → terror com raiva; divina → temor reverente (com consolo). **O jogador reconhece a via pelo tom emocional do caco antes do conteúdo.**

### Duas camadas de cada caco
- **Tom de escrita** = assinatura da via de quem registrou.
- **Carga de terror na compreensão** = o que se sente ao *entender*. A latência (P2) tem o maior **gap**: escrita gélida, compreensão devastadora ("a ameaça é meu próprio corpo, não há de quem fugir"). Por isso a verdade material é **rejeitada por autodefesa psicológica**, não só por ser contraintuitiva.

### Proveniência em camadas (regra geral)
- **Primário** — fonte direta, fria, no vocabulário de quem viveu (ordem militar, K7 Cicada, diário do cientista). Raro, frágil, frio, **preciso**.
- **Secundário+** — cópia/relato de quem achou o primário e o re-narrou pela própria via. Comum, mais durável (recopiado), mais **legível**, **degradado em precisão**.
- **Duas entropias** sobre a verdade: do **meio** (mídia apodrece) + da **transmissão** (cada portador distorce — telefone-sem-fio). A segunda corrompe *conteúdo*, não só legibilidade.
- **A investigação real é rastrear secundário→primário.** O obstinado desconfia do que é fácil de ler (facilidade = passou por mãos) e caça o original cru. Arqueologia de proveniência, não coleta de fatos.

### Detectabilidade da auto-ilusão (varia por ponto)
Existe onde há **cruzamento** (dois fios pra comparar internamente), falta onde há **fato isolado**. Quando existe, a detecção **rende dúvida, não verdade** (tira da mentira confortável e joga na incerteza honesta). A lucidez não consola — só remove a falsa paz.

---

## 15. A VIA MATERIAL — P1 a P7 (COMPLETA)

> A via que persegue a verdade. As outras três vias (divina, conspiração, contágio, recusa) percorrem o mesmo grafo por lentes diferentes — pendentes (ver §16).

### P1 — O fato visto: os mortos levantam
Observável, impossível de perder. **Não se interpreta, se testemunha.** Função: **disparar a pergunta** ("por que?"). Durabilidade infinita.

### P2 — A pergunta: por que levantam?
Abre o leque. Resposta material: **latência despertada** — "já estava em nós; algo acordou". A doença não se transmite primariamente, ela **ativa**. Latente em milhares (3301+) desde antes; a mordida **acorda**, não planta; o gatilho original foi químico/ambiental, não viral-por-contato.
- **Tom de escrita:** frio. **Carga de terror na compreensão: máxima** (terror sem porta — a ameaça é você). É **o que mais aterroriza**, e isso é parte do porquê é **rejeitada** (autodefesa: é mais suportável crer em arma/castigo/contágio, que te deixam *fora* da doença).
- **Desvantagem:** contradiz o que os olhos parecem mostrar (a mordida-vira-zumbi grita "contágio"). Inferível só por evidência anômala (alguém que virou trancado, sozinho, sem ferimento). Rara não porque o caco é escondido — porque a conclusão é difícil de engolir.
- → abre a pergunta-3: **"o que/quem despertou?"**

### P3 — O que despertou?
Resposta material: **intervenção humana, técnica, deliberada** — um experimento que liberou algo no ar de um lugar não-vedado. **Mas a via empaca entre duas sub-respostas:**
- **3-mat-A (verdade):** agente produzido numa tentativa de **reverter a morte** — deliberado no ato, acidental no resultado.
- **3-mat-B (erro intuitivo):** **arma biológica** — alguém projetou pra matar. Mesma família (humano, técnico), erra a intenção. **Funde com a conspiração secular.**
- **Gargalo trágico:** a via material **sozinha não chega à verdade** — chega a "foi humano, deliberado" e tende a parar em **"arma"** (a leitura intuitiva). A frieza que a levou tão longe é o que a impede do último passo, porque o último passo (por quê?) é **amor e desespero**, não mecanismo. **Quem fica puro-materialista até o fim morre em "arma".**

### P4 — Qual a intenção? (o coração trágico)
A verdade: **ressurreição por amor** — um viúvo (ou amante) querendo a mulher de volta. O ponto onde as lentes **mais divergem** (motivo é o mais interpretável).
- **Portador do caco-motivo: FORA da via material** (decisão tomada). Um registro **humano/emocional** (carta pessoal, diário de luto, fita doméstica) que o investigador frio **despreza por princípio**, o fiel lê como prova do pecado, o pragmático não pega. Visível pra todos, valorizado por ninguém.
- **A recompensa do investigador obstinado não é um fato a mais — é a inversão do significado de tudo** (anagnórise): "arma biológica deliberada" continua factualmente verdadeira e **muda de sentido por completo** — não era arma, era ressurreição; não era malícia, era amor; o monstro era um viúvo. **A via não é autossuficiente por design** — exige que o jogador traia a própria postura (o frio se interessa pelo humano).
- **Sub-fratura da lente divina:** o agente é **deus** (venceu a morte) ou **diabo** (condenou o mundo)? Ambos factualmente errados (ele não era nem profeta nem traidor). As duas teologias mais opostas florescem do mesmo fato material que nenhuma vê — e só a verdade material (a mais fraca, menos pregada) as reconcilia. **O golpe central do jogo.**
- **Encontro com o casal = beat à parte** (não espinha epistêmica). Regra-Sif (§13). A informação do P4 chega *antes* do encontro pra quem foi atrás → impactante; pra quem não foi → só um obstáculo.

### P5 — Houve encobrimento (ponto auto-ocultante)
O exército interveio pra conter/apagar, falhou catastroficamente, suprimiu o registro **por design**. Difícil de achar **porque alguém quis assim** (não por acaso).
- **A ausência é a evidência:** uma zona arrasada/limpa-demais *grita* que alguém não quis que se soubesse (o "intocado-suspeito" do §3, agora em escala de espinha). O materialista frio é o **melhor leitor** disso (nota a anomalia); o fiel lê "terra amaldiçoada", o pragmático vê "lugar sem loot".
- **Três portadores:** **cicatriz física** (zona arrasada — durável, garantida, sobrevive na geografia); **o desertor militar** (primário vivo interativo no grupo acolhedor, **mortal** → vira primário-escrito + secundários se cai; matar os acolhedores te custa o acesso humano à verdade do P5); **cacos-falha-do-apagamento** (ordem queimada, K7 sobrevivente — primários raros, ouro).
- **Falsa convergência material+conspiração:** "houve encobrimento militar" é simultaneamente fato mecânico (materialista: incompetência, contenção falhou) e prova da conspiração (paranoico: intenção maligna). As duas vias se confirmam mutuamente e **fortalecem os erros de ambas** — montam uma teoria 80% certa (técnico ✓, militar ✓, encoberto ✓) e fatalmente errada nos 20% (deliberado no *desfecho* ✗ — foi um viúvo, um acidente, um pânico). *Duas vias verdadeiras somam numa mentira mais convincente porque tem duas testemunhas.* **O P5 sela o erro "arma" pra quem não tem o caco-motivo do P4** — progresso aparente, direção errada (e honesto: nenhum caco mentiu).
- **Janela de auto-auditoria (forte aqui):** o jogador atento flagra "eu e a conspiração nos confirmamos em círculo, mas nenhum de nós viu prova da intenção". **A detecção rende dúvida, não verdade** — troca "foi arma" por "não sei o porquê". Mas **amolece a certeza que permite o P4 ser aceito** depois (duvidar primeiro torna a revelação aceitável; sem duvidar, o jogador pode rejeitar a carta por não encaixar).
  - Duas saídas do erro "arma": **caco-motivo do P4** = verdade *positiva* (foi ressurreição); **janela do P5** = verdade *negativa* (não é arma). Quem faz os dois vive a sequência completa: humildade → anagnórise.

### P6 — A mão que observou (Cicada, sem o nome)
A Cicada estava na sala, viu o despertar, documentou as 3301 reações, e **não impediu nem ajudou — registrou**. O pecado é **observação fria**, não ação. (Espelho do jogador-investigador: coletou em vez de agir.)
- **Erro a evitar: "vilão onisciente"** — pior que o "arma" do P5 porque **se alimenta da ausência de prova** (toda ausência confirma; circular, **imune à introspecção**). O conspiracionista infla a Cicada até virar divindade-sombra.
- **A verdade é diminuidora (anti-anagnórise):** a Cicada é **menor** que a lenda — competente-mas-incompleta, fria, assustada — **mas inteligente e manipuladora**. O P4 inverte pra cima (monstro→viúvo, *engrandece*); o P6 inverte pra baixo (deus-sombra→grupo covarde, *diminui*). **A decepção é a verdade.** Difícil de aceitar porque é **pequena demais** (a mente quer um vilão à altura do apocalipse).
- **Duas faces** (histórica + presente), fusão = golpe (§13).
- **Como desinfla o mito:** não por introspecção. Por **contato direto** (custoso, expõe — só quem confia o bastante pra se expor vê a Cicada real) **ou indireto** (o desertor e quem o conheceu — rota humana pro paranoico que não vai se expor). **Ironia:** quem desconfia demais preserva o próprio monstro. *A desconfiança total não protege a verdade — tranca-a fora do alcance.*

### P7 — A dobra ética (fecha a espinha num círculo)
Não é fato sobre o mundo — é **postura do jogador**. Pergunta: *"onde eu me encaixo nisso tudo?"*. As quatro vias do P2 **reconvergem como éticas de ação**:
- **Recusa → resignação lúcida** ("sei a verdade e mesmo assim não há o que fazer"). Mais escura que a ignorante.
- **Material → tentar a cura** = **repetir o gesto do subject-0** (o cientista também quis curar a morte). O fim "bom" é a repetição do pecado original.
- **Conspiração → vingança** — justa no alvo (a Cicada tem culpa real), desproporcional na medida (pune covardia como se fosse orquestração).
- **Divina → submissão/propósito** — aceita o fim como merecido, junta-se às Máscaras, ou vira pregador do significado.

**A cura (estrutura "fim-ato" — TRAVADA):**
- A cura **conclui a história sem encerrar o jogo.** Não há tela de fim; o survival **continua rodando por baixo**. O mundo não nota nem celebra que você curou a praga (Rain World perfeito). A história tem fecho; o mundo não.
- **A cura não reverte, só previne:** **tranca a ativação permanentemente** (não "remove a doença" — todos seguem portadores; fica-se **portador imune à ativação**). Não traz mortos de volta; só garante que quem sobreviveu possa recomeçar. **O pecado foi negar a morte; a redenção é aceitá-la** — o jogador só alcança a cura verdadeira quando abandona a fantasia de reverter (que era repetir o subject-0). Rima com o P4.
- **Puramente optativa.** A semi-cura já mantém o jogo jogável; a cura oficial é **recompensa de quem foi atrás**, nunca pressão. (Gargalo-Cicada aceitável *porque* é optativa.)
- **Duas vias, ambas cinza (custos opostos, simétricos):**
  - **Colaborar com a Cicada** → cura completa, mas **comprometida por preço oculto** (eles manipulam; querem algo — dados, acesso, que você seja o vetor-de-teste; talvez espalhar a "cura" espalhe outra coisa).
  - **Dizimar a Cicada** → cura **livre mas incompleta** (você tem os documentos/receita, não o **conhecimento tácito** de quem matou — o problema da tortura em escala de organização).
  - Nenhuma é limpa. Não há jeito puro de salvar o mundo.

### Resumo da via material (rima do início ao fim)
fato visto → por quê (latência) → o que despertou (experimento; tende a "arma") → intenção (ressurreição por amor; inverte o significado) → encobrimento (sela o erro "arma", mas abre a janela de dúvida) → a mão que observou (Cicada menor que a lenda) → a dobra ética (a cura que é a renúncia ao desejo que começou tudo).

---

## 16. Fila aberta (próximos passos)

| Item | O que falta |
|------|-------------|
| **Vias da espinha** | Descer **divina** (Máscaras: castigo → culpado/sentido, sub-fratura santo/diabo no P4, submissão no P7), **conspiração** (de propósito → converge no P5, infla Cicada no P6, vingança no P7), **contágio** (afasta da verdade; talvez nem chega ao fundo), **recusa** (sai cedo, survival puro). São releituras dos mesmos 7 fatos — herdam a estrutura. |
| **P1 — cacos concretos** | A "questão macro" do P1 ficou pra depois: quais cacos exatos. |
| **Item E — números da espinha** | Quantos cacos-âncora por ponto, quão duráveis (informado pela escala do mapa: mundo grande dilui a densidade — a espinha cresce ou concentra). |
| **Árvore de cacos** | O inventário de fragmentos físicos concretos, cada um etiquetado (difuso/pontual, durável/perecível, verdadeiro/forjado/sincero-errado, lente, canal, gate). Espinha primeiro, depois região vertical-slice. |

### Decisões pendentes registradas (não travadas)
- **Latência como mecânica?** O protagonista pode ser portador latente desde o início (horror corporal) ou é lore-só.
- **Tipos de zumbi** — mencionados, conversa adiada.
- **Encontro com o casal** — confirmado durável (são a horda), mas o desenho fino do encontro fica pra depois.

---

## Changelog
- **Sessão 1 (jun/2026):** criação do documento. Travados: princípios-raiz; mundo offscreen + curva A; gradiente+eventos (C parcial); legibilidade; survival (energia/vigília/alucinação); diário (A); diálogo (4 categorias); morte+reputação; mapa+topologia; teto tecnológico; criação de personagem; verdade canônica (D); facções; estrutura da espinha; **via material P1–P7 completa**.
