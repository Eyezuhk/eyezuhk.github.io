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
featured: false
toc:
  sidebar: left
---

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% assign repo = "eyezuhk/FnStegoCrypt" %}
  {% include repository/repo.liquid repository=repo %}
</div>

---

## Funcionalidades principais

O programa possui as seguintes capacidades principais:

1. **Geração de Sal e Derivação de Chave**:
   - Utiliza uma combinação de PBKDF2-HMAC com SHA-256 para derivar uma chave segura a partir de uma senha fornecida.
   - Gera um *salt* aleatório para aumentar a segurança da derivação da chave.

2. **Criptografia AES-GCM**:
   - Os dados são criptografados com o algoritmo AES-GCM, que oferece confidencialidade e autenticação integrada dos dados.

3. **Ocultação de Dados em Imagens**:
   - Utiliza os bits menos significativos (LSBs) dos pixels para armazenar informações sem comprometer a qualidade visível da imagem.

4. **Verificação de Integridade**:
   - Gera um hash SHA-256 dos dados originais e o embute junto com os dados criptografados, permitindo verificar se os dados foram corrompidos.

5. **Suporte a Diversos Formatos de Imagem**:
   - Suporta formatos comuns como PNG e JPEG, além de imagens no formato HEIF e HEIC.

6. **Processamento em Massa**:
   - Permite processar múltiplas imagens em um diretório de forma eficiente utilizando threads.

---

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="assets/videos/FnStegoCrypt/FnStegoCrypt.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=true %}
    </div>
</div>
<div class="caption">
    Vídeo exemplo FnStegoCrypt.
</div>

## Estrutura do Programa

### Classe `ImprovedSteganography`

Essa classe é o núcleo do programa e contém os métodos responsáveis por todas as operações de esteganografia e criptografia:

- **`generate_salt`**: Gera um *salt* aleatório.
- **`_derive_key`**: Deriva uma chave segura a partir de uma senha usando PBKDF2.
- **`encrypt_data` e `decrypt_data`**: Realizam a criptografia e descriptografia dos dados usando AES-GCM.
- **`hash_data`**: Calcula o hash SHA-256 dos dados para garantir integridade.
- **`check_image_capacity`**: Verifica se a imagem tem capacidade suficiente para armazenar os dados.
- **`hide_data_in_image`**: Insere os dados criptografados na imagem.
- **`extract_data_from_image`**: Recupera os dados escondidos da imagem.

### Fluxo do Programa

1. **Modo de Escrita (Ocultar Dados)**:
   - O usuário escolhe um arquivo de imagem ou um diretório.
   - Lê os dados de um arquivo de texto e os criptografa.
   - Insere os dados criptografados na imagem e salva uma nova versão da imagem.

2. **Modo de Leitura (Extrair Dados)**:
   - O usuário fornece uma imagem com dados ocultos e a senha correspondente.
   - O programa extrai e verifica os dados criptografados, realiza a descriptografia e os retorna ao usuário.

---

## Principais Tecnologias Utilizadas

- **Biblioteca `cryptography`**:
  - Utilizada para criptografia e derivação de chave.
- **Biblioteca `Pillow`**:
  - Usada para manipulação de imagens.
- **`NumPy`**:
  - Fornece operações eficientes para manipular arrays de pixels.
- **`concurrent.futures`**:
  - Permite processamento paralelo para otimizar operações em lotes.

---

## Exemplos de Uso

### Escondendo Dados em Uma Imagem

1. O programa solicita a senha e o caminho de uma imagem e de um arquivo de texto.
2. Encripta o conteúdo do arquivo de texto com a senha fornecida.
3. Esconde os dados criptografados na imagem e salva a imagem resultante em um diretório de saída.

### Extraindo Dados de Uma Imagem

1. O usuário fornece a imagem esteganografada e a senha.
2. O programa verifica a integridade dos dados e os descriptografa.
3. Retorna os dados ao usuário, que pode optar por visualizá-los ou salvá-los em um arquivo.

---

## Considerações Finais

O **FnStegoCrypt** é uma ferramenta poderosa para aplicações que exigem discrição e segurança na transmissão de informações. Seu uso de algoritmos de ponta, como AES-GCM e SHA-256, aliado à capacidade de trabalhar com múltiplos formatos de imagem, torna-o ideal para cenários onde a proteção de dados é essencial.

Caso tenha interesse em contribuir para melhorias, fique à vontade para explorar o código e adaptá-lo às suas necessidades.
