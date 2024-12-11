---
layout: post
title: FnStegoCrypt dados encriptados em imagens.
date: 2024-06-25 12:00:00
description: Programa que encripta os dados com aes-gcm e adiciona a imagens usando LSB.
tags: FnStegoCrypt
categories: Tools
thumbnail: https://raw.githubusercontent.com/Eyezuhk/FnStegoCrypt/refs/heads/main/Resources/FnStegoCrypt.jpg
giscus_comments: true
related_posts: true
featured: true
toc:
  sidebar: left
---

Olá pessoal, compartilhando um programa que fiz para encriptar e esconder dados em imagens usando PBKDF2, AES-GCM, e LSB.

Como camada extra de segurança, você pode ter várias imagens com dados encriptados, bastando apenas memorize a imagem com o dado que você quer proteger e a senha, o programa não se limita a texto, podendo esconder inclusive executáveis dentro da imagem. Sejam criativos 😁.

Depois irei adicionar uma versão portable no repositório para facilitar o uso.

Depois irei adicionar mais ifnormações sobre o programa.

Link [https://github.com/Eyezuhk/FnStegoCrypt](https://github.com/Eyezuhk/FnStegoCrypt)

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="/assets/videos/FnStegoCrypt/FnStegoCrypt.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=true %}
    </div>
</div>
<div class="caption">
    Vídeo exemplo FnStegoCrypt
</div>
