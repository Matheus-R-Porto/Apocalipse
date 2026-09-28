# APOCALIPSE — Game Design Document

**Título provisório:** Apocalipse  
**Gênero:** Survival horror top-down  
**Plataforma:** HTML5 (Canvas + JavaScript puro) → empacotável pra desktop (Tauri/Electron)  
**Perspectiva:** Top-down 2D com cone de visão (estilo Darkwood)  
**Estado atual:** Vertical slice funcional (passos 0–6 completos)

---

## Inspirações

| Jogo | O que pega dele |
|------|----------------|
| **Darkwood** | Mecânica geral, cone de visão (FOV), tensão noturna, escolhas irreversíveis |
| **Project Zomboid** | Contexto (apocalipse zumbi), sistemas de sobrevivência (fome, infecção, loot), profundidade de gameplay |
| **The Escapists** | Estética pixel art top-down, clareza visual |

---

## Premissa

O jogador acorda em um mundo tomado por zumbis. Sem explicação imediata, sem tutorial — só sobrevivência. A história se revela através de escolhas, encontros e exploração. Cada decisão tem consequências permanentes. Não existe "caminho certo".

---

## Pilares de Design

1. **Tensão constante** — O cone de visão limita o que o jogador vê. O que está fora do cone existe e se move. O som é bidirecional: o jogador faz barulho e os zumbis também.
2. **Consequência** — Escolhas são irreversíveis. Recursos são finitos. Cada mordida pode infectar. Não existe save scumming.
3. **Emergência** — Os sistemas interagem entre si de formas não-scriptadas. Um ataque faz barulho que atrai zumbis que estavam dormentes atrás de uma parede.

---

## Arquitetura Técnica

### Stack
- **HTML5 Canvas + JavaScript puro** — zero dependências, zero build
- **Empacotamento futuro:** Tauri (3–10 MB) ou Electron (80–150 MB) pra distribuição desktop
- **Distribuição:** itch.io (HTML5 jogável no browser + download) → Steam (futuro)

### Padrão de Sistemas
Cada sistema segue uma regra: **só lê/escreve o GameState e emite/escuta eventos no EventBus**. Nenhum sistema chama outro diretamente. Isso permite construir, testar e plugar parte por parte.

```
Sistemas (Movement, Vision, Zombie, Combat, Survival, Inventory, DayNight, ...)
        |  emit / on
   [ EventBus ]  <->  [ GameState ]  ← fonte única de verdade
        |
   [ Game Loop ]  (passo fixo, 60 updates/s)
```

### Sistemas implementados
| Sistema | Responsabilidade |
|---------|-----------------|
| **DayNightSystem** | Ciclo de 16 min (8 sol + 8 lua), ajusta fog/visão/comportamento de zumbis |
| **InventorySystem** | Toggle inventário (I/ESC), auto-pickup, crafting check |
| **MovementSystem** | WASD/setas, sneaking (shift), emissão de ruído ao andar |
| **CombatSystem** | Ataque melee (click, arco 90°), dano em zumbis, emissão de ruído |
| **SurvivalSystem** | Dreno de fome, regeneração de HP, uso de itens (E) |
| **VisionSystem** | Raycasting por segmentos de parede, polígono de visibilidade (cone + ambiente) |
| **ZombieSystem** | IA (idle/alert/chase), detecção por visão e som, colisão/empurrão, mordida |

### Eventos do barramento
| Evento | Quem emite | Quem reage |
|--------|-----------|------------|
| `player:moved` | MovementSystem | — |
| `player:noise` | MovementSystem, CombatSystem | Zumbis (alert) |
| `player:bitten` | ZombieSystem | SurvivalSystem (dano + infecção) |
| `zombie:killed` | CombatSystem | Loot (ground items) |
| `vision:updated` | VisionSystem | — |

---

## Mecânicas — Core Loop

### Movimento & Stealth
- **WASD / setas** — movimento em 8 direções, normalizado na diagonal
- **Shift** — sneaking: velocidade reduzida (55 vs 170 px/s), sem emissão de ruído
- **Colisão** — AABB contra tiles de parede, com deslize por eixo separado

### Visão (Cone de Visão)
- **Mouse** controla a direção do cone (90°, 320px de alcance)
- **Raycasting por segmentos** — raios intersetam arestas expostas das paredes
- **Fog of war** — canvas offscreen com `destination-out`: cenário levemente visível (70% fog dia / 88% noite), mas **entidades só aparecem dentro do cone ou do anel ambiente**
- **Anel ambiente** — visão 360° de curto alcance (40–85px conforme dia/noite), mais escura que o cone
- **Line of sight** — `isInVision()` checa ângulo + distância + LOS (raio não atravessa parede)

### Combate
- **Click esquerdo** — ataque melee num arco de 90° na direção do mouse
- Alcance: 45px | Dano: 35 | Cooldown: 0.4s
- **Faz barulho** (raio 250) — alerta zumbis próximos
- **Flash visual** — arco branco translúcido por 0.15s
- Zumbi morre com 3 hits (100 HP)

### Zumbis — IA
| Estado | Cor | Comportamento |
|--------|-----|--------------|
| **idle** | Verde | Vagueia devagar (25 px/s), muda direção a cada 2–5s |
| **alert** | Amarelo | Caminha até a fonte do ruído (50 px/s). Chegou ou 5s → idle |
| **chase** | Vermelho | Persegue o player (65 px/s dia, ~46 à noite). Perdeu de vista 3s → idle |

- **Detecção visual:** alcance de 120px (dia) / ~72px (noite) + line of sight
- **Detecção sonora:** raio do ruído do player × multiplicador noturno (1.6×)
- **Mordida:** 15 de dano, cooldown 1.5s, 20% chance de infecção por mordida
- **Colisão:** zumbi e player se empurram (60% player / 40% zumbi)
- **Loot ao morrer:** drops aleatórios (pano, sucata, pão) com delay de 0.6s antes de ser coletável

### Sobrevivência
| Recurso | Valor | Mecânica |
|---------|-------|----------|
| **HP** | 100 | Desce com mordidas (15/bite). Regenera a 3/s quando fome ≥ 90 |
| **Fome** | 100 | Drena a 0.15/s (~11 min pra esvaziar). Pão restaura 25, bandagem cura 30 HP |
| **Infecção** | flag | 20% chance por mordida. Mostra "INFECTADO" no HUD. (Mecânica de consequência futura) |

### Inventário & Crafting
- **I** abre/fecha inventário, **ESC** também fecha
- **Grade 5×4** (20 slots) + **hotbar** (5 slots, teclas 1–5)
- **Click esquerdo** — pega/coloca/empilha/troca item
- **Click direito** — divide stack (pega metade) ou coloca 1 unidade
- **E** — usa item selecionado na hotbar (comer pão, usar bandagem)
- **Crafting 2×2** — grade ao lado do inventário, estilo Minecraft
- **Auto-pickup** — itens no chão são coletados ao andar perto (28px)
- Fechar inventário devolve itens do cursor e da grade de craft

### Itens
| Item | Letra | Fonte | Uso |
|------|-------|-------|-----|
| **Pão** | P | Loot de zumbi, início (5x) | Restaura 25 de fome |
| **Pano** | C | Loot de zumbi (mais comum) | Material de craft |
| **Sucata** | S | Loot de zumbi | Material de craft (futuro) |
| **Bandagem** | B | Craft: 2× pano | Cura 30 HP |

### Ciclo Dia/Noite
- **Ciclo total:** 16 minutos (8 sol ☀ + 8 lua ☾)
- **Começa no meio-dia** — transição suave via cosine

| Parâmetro | Dia (☀) | Noite (☾) |
|-----------|---------|-----------|
| Fog | 50% | 88% |
| Visão ambiente | 85px | 40px |
| Velocidade zumbi | 100% | 70% |
| Visão zumbi | 100% (120px) | 60% (72px) |
| Sensibilidade a som | ×1.0 | ×1.6 |

- **HUD:** relógio com ícone ☀/☾ + barra de progresso no centro superior
- **Debug:** tecla G avança 2 minutos

---

## Mecânicas Planejadas (não implementadas)

### Construção & Reparo
O jogador pode construir ou reparar estruturas existentes usando materiais coletados. A ideia é que a base do jogador seja um ponto de segurança que ele vai fortalecendo ao longo do tempo.

- **Barricadas** — bloqueia passagens com madeira/sucata
- **Portas reforçadas** — zumbis demoram mais pra quebrar
- **Reparo de paredes** — restaura tiles danificados
- **Materiais:** madeira, sucata, pano, pregos (novos itens de loot/craft)

### Energia Elétrica (precária)
Sistema de energia limitada e precária — condizente com um cenário pós-apocalíptico.

- **Gerador** — craftável ou encontrável, consome combustível (recurso finito)
- **Fiação improvisada** — conecta o gerador a aparelhos dentro de um raio
- **Aparelhos:**
  - Fogão elétrico — cozinhar alimentos (melhora restauração de fome/HP)
  - Lâmpada — ilumina uma área fixa (substitui o cone em regiões pequenas)
  - Rádio — pode atrair zumbis ou captar transmissões (gancho narrativo)
- **Limitações:** combustível finito, barulho do gerador atrai zumbis, fiação visível pode ser atacada

### Motor de História

**Filosofia: a história é um layer opcional.** O core loop (explorar, lutar, craftar, sobreviver) funciona perfeitamente sozinho, como um survival sem fim. A narrativa existe pra dar razão ao jogador se arriscar — "por que eu sairia da minha base segura?" — mas nunca é obrigatória.

**Caminhos múltiplos, finais múltiplos.** O jogador pode:
- Ser solitário — nunca interagir com NPCs, jogar como survival puro
- Se envolver com NPCs — fazer missões, confiar (ou não) em grupos
- Ignorar tudo — o mundo continua acontecendo sem ele

**NPCs são mortais.** Qualquer NPC pode morrer (pelo jogador, por zumbis, por outros NPCs). A morte de um NPC tem consequências em cadeia:
- Missões associadas a ele se auto-cancelam (nunca existiram)
- Outros NPCs reagem: luto, vingança, oportunismo, indiferença
- Linhas de história fecham, outras abrem

**Nada é forçado.** Missões nunca aparecem como obrigatórias. São oportunidades que o mundo oferece. Se o jogador não pega, o mundo segue. Se um NPC morre antes de dar a missão, a missão nunca existiu.

**Implementação técnica:**
- **Flags booleanas** — set/check via EventBus, uma vez settadas não voltam
- **StorySystem** — escuta eventos (`npc:died`, `player:entered_area`, `item:delivered`) e seta flags
- **NPCs como listeners** — reagem a flags mudando estado, diálogo, comportamento
- **Missões como dados** — condições de aparição (flags), condições de cancelamento (flags), recompensas
- O jogador solitário simplesmente nunca dispara os eventos que ativam a narrativa

### Áudio Posicional
Web Audio API com `PannerNode` para som estéreo/3D.

- **Grunhidos de zumbis** — volume proporcional à distância, panorama estéreo indica direção
- **Passos do jogador** — feedback sonoro de sneaking vs caminhada normal
- **Ambiente** — vento, estática, sons distantes que mudam com dia/noite

### IA Avançada (Pathfinding)
- **A*** sobre a grid de tiles — zumbis contornam paredes em vez de bater nelas
- **Tipos de zumbi:** burro (comportamento atual), esperto (A*), corredor (rápido mas frágil)

### Saturação (sistema de fome expandido)
Barra invisível que cura HP enquanto drena. A barra visível de fome só indica fome real. Impede o jogador de comer durante combate e regenerar instantaneamente — a cura é gradual e requer estar bem alimentado por um período.

---

## Interface (HUD)

### Gameplay (inventário fechado)
- **Canto superior esquerdo:** FPS, status (SNEAKING, INFECTADO)
- **Canto superior direito:** barras de HP e fome
- **Centro superior:** relógio dia/noite com ícone ☀/☾ e barra de progresso
- **Centro inferior:** hotbar (5 slots, slot selecionado destacado em amarelo)

### Inventário (I ou ESC pra fechar)
- **Overlay escuro** sobre o jogo (que continua rodando — tensão!)
- **Esquerda:** grade 5×4 com título "INVENTÁRIO"
- **Direita:** grade 2×2 de crafting + seta → + slot de resultado
- **Embaixo:** hotbar compartilhada
- **Cursor:** item seguido pelo mouse ao ser pego
- **Dica:** receitas listadas abaixo da grade de craft

---

## Controles

| Input | Ação |
|-------|------|
| WASD / Setas | Mover |
| Shift (segurar) | Sneaking (lento + silencioso) |
| Mouse | Direcionar cone de visão |
| Click esquerdo | Atacar (faz barulho) |
| Click direito (inventário) | Dividir stack / colocar 1 |
| 1–5 | Selecionar slot da hotbar |
| E | Usar item selecionado |
| I | Abrir/fechar inventário |
| ESC | Fechar inventário |
| G | Debug: avançar tempo (+2 min) |

---

## Estrutura de Arquivos

```
Apocalipse/
├── index.html          — página + canvas (800×480)
├── game.js             — todo o código (EventBus, GameState, 7 sistemas, render)
├── README.md           — roteiro e arquitetura
├── GDD.md              — este documento (core implementado)
├── GDD_EXPANSAO.md     — narrativa, mundo, survival expandido, espinha P1–P7, facções, mapa
├── ARVORE_CACOS.md     — ~130 fragmentos narrativos concretos (por ponto × lente)
└── GDD_COMPLEMENTAR.md — 9 tipos de zumbi, sub-mutações, bosses, tutorial
```

---

## Roteiro de Desenvolvimento

### Completo
- [x] Passo 0 — Esqueleto (loop, GameState, EventBus)
- [x] Passo 1 — Mundo de tiles + colisão
- [x] Passo 2 — Cone de visão (raycasting) + fog of war
- [x] Passo 3 — Zumbis + IA + sneaking
- [x] Passo 4 — Vida, fome, ataque, hotbar, infecção
- [x] Passo 5 — Inventário, loot, crafting
- [x] Passo 6 — Ciclo dia/noite

### Próximos
- [ ] Passo 7 — Motor de história (flags, escolhas únicas)
- [ ] Construção & reparo de estruturas
- [ ] Sistema de energia (gerador, aparelhos)
- [ ] Áudio posicional (Web Audio API)
- [ ] Pathfinding A* para zumbis
- [ ] Mapa maior + câmera que segue o player
- [ ] Sprites / pixel art (substituir os quadrados)
- [ ] Sistema de saturação
- [ ] Mais tipos de zumbi
- [ ] Mais receitas de crafting
- [ ] Empacotamento desktop (Tauri)
