# Apocalipse (título provisório)

Jogo top-down de sobrevivência em apocalipse zumbi, inspirado em:
- **Darkwood** — mecânica geral + cone de visão (field of view)
- **Project Zomboid** — contexto: zumbis, sobrevivência, looting
- **The Escapists** — estética pixel art top-down

Feito em **HTML5 Canvas + JavaScript puro** (sem dependências, sem build).

## Como rodar
Por enquanto: abra `index.html` no navegador (duplo clique já serve).
Quando entrarem imagens/sprites, vamos precisar de um servidor local simples
(1 comando) — será avisado na hora.

## Arquitetura
Cada sistema só faz duas coisas: ler/escrever o **GameState** e
emitir/escutar eventos no **EventBus**. Nenhum sistema chama outro
diretamente — é isso que permite construir e testar parte por parte.

```
Sistemas (Movimento, Visão, Zumbis, Sobrevivência, ...)
        |  emit / on
   [ EventBus ]  <->  [ GameState ]  <-  fonte única de verdade
        |
   [ Game Loop ]  (passo fixo, 60 updates/s)
```

## Roteiro (bem aos poucos)
- [x] **Passo 0** — esqueleto: loop + GameState + EventBus + quadrado que anda
- [x] **Passo 1** — mundo/tiles + colisão
- [x] **Passo 2** — cone de visão (raycasting) + fog-of-war + isInVision()
- [x] **Passo 3** — zumbis + IA (idle/alert/chase) + sneaking (shift) + visibilidade por LOS
- [x] **Passo 4** — sobrevivência (vida, fome, hotbar, ataque, colisão, infecção)
- [ ] Passo 5 — inventário / loot / craft
- [x] **Passo 6** — ciclo dia/noite (16 min, fog/visão/zumbis adaptativos)
- [ ] Passo 7 — motor de história (flags, escolhas únicas)
- [x] **Passo 8** — câmera + mapa grande (50×35, tile culling, fog viewport-sized)
- [x] **Passo 9** — mapa real com biomas (200×140, 7 tile types, geração por biome grid, zombie activation radius, LOS local)

## Melhorias futuras (backlog)
- IA: pathfinding A* pra zumbis contornarem paredes (tipos: burro vs esperto)
- Áudio: Web Audio API com PannerNode pra som estéreo/3D posicional

## Arquivos
- `index.html` — página + canvas
- `game.js` — EventBus, GameState, sistemas, loop e render
