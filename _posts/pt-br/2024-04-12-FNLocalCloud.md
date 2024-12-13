---
layout: post
title: Expondo aplicações locais com FNLocalCloud.
date: 2024-04-12 12:00:00
description: Programa baseado em agente e servidor para expor serviços de rede locais na internet bypassando cgnat...
tags: FNLocalCloud
categories: Tools
thumbnail: https://raw.githubusercontent.com/Eyezuhk/FNLocalCloud/refs/heads/main/Images/FNLocalCloud.png
giscus_comments: true
related_posts: true
featured: false
toc:
  sidebar: left
---

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% assign repo = "eyezuhk/FNLocalCloud" %}
  {% include repository/repo.liquid repository=repo %}
</div>

---

Recentement eu me vi em um cenário onde eu precisava acessar minha máquina via RDP, mas eu não tenho um ip público por conta da escassez de ips, minha provedora utiliza cgnat.

> Lembrei de um passado distante em que tudo o que eu queria era um VPS para expor um servidor de Counter-Strike 1.6 ou Lineage 2 para meus amigos jogarem online. Nem todos os provedores ofereciam IPs públicos, e hoje essa é a regra. 

Uma solução comum para esse cenário é usar o ngrok, e funcionou bem, mas o delay adicionado me deixou insatisfeito com a usabilidade.

O mesmo aconteceu quando fiz um túnel ssh para uma máquina free tier que tenho na oracle, então decidi tentar criar uma solução em python para isso com ajuda de llms, visto que para esse propósito, acelera muito o processo de criação.

#### Motivos para a Ausência de IPs Públicos:

Escassez de IPv4: Com o aumento da demanda por IPs públicos, acabamos recorrendo a técnicas como o CGNAT, onde vários usuários compartilham o mesmo endereço IPv4 público.

Custos e Segurança: Alugar um bloco de IPs públicos pode ser caro, e o CGNAT oferece uma camada extra de segurança ao ocultar nossos endereços IP internos.

#### Desafios do CGNAT:

Exposição de Serviços Locais: Com o CGNAT, enfrentamos dificuldades para expor nossos serviços locais, já que todos os dispositivos internos compartilham o mesmo endereço IPv4 público.

Complexidade de Configuração: Configurar redirecionamento de portas e lidar com as restrições do CGNAT pode ser complicado, especialmente para aqueles que não são muito técnicos.

####  Desafios na Adoção do IPv6:
Falta de Incentivo: Muitos provedores de internet ainda não adotaram o IPv6, o que dificulta nossa jornada de expor serviços locais.

### Solução

Então, se você precisar expor algum serviço local com um TCP proxy reverso, confira a ferramenta que criei no GitHub!

Link: [https://github.com/Eyezuhk/FNLocalCloud](https://github.com/Eyezuhk/FNLocalCloud)

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="assets/videos/FNLocalCloud/FNLocalCloud.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=true %}
    </div>
</div>
<div class="caption">
    Vídeo exemplo FNLocalCloud.
</div>
