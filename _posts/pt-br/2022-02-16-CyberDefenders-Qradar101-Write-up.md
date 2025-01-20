---
layout: post
title: Resolução CyberDefenders Qradar101.
date: 2022-02-16 12:00:00
description: Resolução de CTF
tags: Qradar Cyberdefenders SIEM
categories: Threat-Hunting
thumbnail: https://img.stackshare.io/service/12032/qradar.png
giscus_comments: true
related_posts: true
featured: false
toc:
  sidebar: left
---

Publicado originalmente por mim no Medium [InfosecWriteups CyberDefenders QRadar101](https://infosecwriteups.com/cyberdefenders-qradar101-write-up-88bf45fdf82c)

Este foi o primeiro write-up para este CTF.

Olhando para trás, percebo que teria sido muito mais fácil se eu soubesse na época o que sei agora. Ainda assim, tenho orgulho de ter sido o primeiro!

---

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*RQ1UkOuc8hVmcWw_.png" class="img-fluid rounded z-depth-1" zoomable=true %}

**Este write-up é baseado no desafio Cyberdefenders Qradar101 de Ali Alwashali.**

Você pode conferir em [https://cyberdefenders.org/blueteam-ctf-challenges/39](https://cyberdefenders.org/blueteam-ctf-challenges/39)

---

Primeiramente, vamos começar procurando por ofensas.

Podemos ver 26 ofensas entre 17 de outubro e 8 de novembro de 2020.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*UfcJEcN7jFEnz4FTcG8JbA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

_Apesar disso, os logs são entre 10/11/2020 22:00 e 10/11/2020 15:00._

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*QuNpAdQgXKVGakze7d1XTQ.png" class="img-fluid rounded z-depth-1" zoomable=true %}

## **Perguntas**

> ### **Quantas fontes de log estão disponíveis?**

Podemos encontrar esta informação acessando Admin > ### Fontes de Log.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:970/format:webp/1*Xtxty8vIelmjePXM3txN4A.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o software IDS usado para monitorar a rede?**

Podemos ver na Figura 3 que o IDS é uma das fontes de log.

> ### **Qual é o nome do domínio usado na rede?**

Podemos encontrar esta informação procurando por eventos de payload relacionados a hosts, como, por exemplo: "Success Audit: A Kerberos service ticket was granted."

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*lA1syASBL-Cv41NAXjKtQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Vários IPs estavam se comunicando com o servidor malicioso. Um deles termina com “20”. Forneça o IP completo.**

Podemos exibir a Atividade de Logs por IP de Origem para ver quais IPs geraram mais comunicação.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*mm83K3gfDbeGJs8O76HZ-w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o SID da regra de alerta mais frequente no conjunto de dados?**

Podemos procurar por `sid:` no payload usando expressões regulares.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*0flYzSiMHVDtgeN7VOuleQ.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Encontramos 110 logs do SO-Suricata, dos quais 72 são para a regra `sid:`.
{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*TDaJUGXn8hWtS-a_xVf6lw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o endereço IP do atacante?**

Em ofensas encerradas, podemos ver um IP público suspeito.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*50S669S0LXIETxGIRjGgtg.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **O atacante estava procurando dados pertencentes a um dos projetos da empresa. Você pode encontrar o nome do projeto?**

Podemos buscar pelo projeto com expressões regulares.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1006/format:webp/1*hSlpjUdc87yP-FDZNun0Ww.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Encontraremos 4 eventos, depois leremos o payload.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*-hyqniVwRcXXGOwW74epaw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o endereço IP da primeira máquina infectada?**

Podemos ordenar os eventos por tempo crescente. Vemos um evento suspeito.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*VdVE_VvgpO4zVEqOBXPJWA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o nome de usuário do funcionário infectado que usa 192.168.10.15?**

Adicionando um filtro onde o IP de origem é 192.168.10.15, podemos encontrar o primeiro nome de usuário que fez login.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*2BLNfFZ2qw6f17x4hOie7A.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Hackers não gostam de registros. Qual registro o atacante estava verificando para ver se estava ativado?**

Vamos observar os primeiros eventos gerados pelo atacante. Podemos identificar uma ferramenta amplamente usada em ataques.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*oxkLfg4uQWTBOB3oDHBIAg.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Também podemos ver que o atacante está usando PowerShell para encontrar project48.

> ### **Nome do segundo sistema que o atacante alvejou para incriminar o funcionário?**

Podemos buscar arquivos deletados.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:494/format:webp/1*LXFLGmodEfXXa498m9Ck3w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*tCCUhfbbnuIlUBof352auA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Quando foi feita a primeira conexão maliciosa ao controlador de domínio (horário de início do log — hh:mm:ss)?**

Podemos procurar conexões de rede detectadas nos payloads e ver que o primeiro evento é uma conexão com o servidor do atacante (192.20.80.25) por um processo que não deveria fazer essa conexão.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*cSK-Db2B1EQ5q26dbaWFqw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o hash MD5 do arquivo malicioso?**

Filtrando por hash, encontramos 10 eventos. Ao olhar o primeiro da máquina infectada 192.168.10.15, podemos identificar o arquivo .docx com hash malicioso.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*LsU-skjXwlQd2zuTPLNJuA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*bZNAtw5DBqJ-EuR-FHH7WA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o ID da técnica de persistência usada pelo atacante segundo a MITRE?**

Consultando as técnicas de persistência em [**_mitre_**](https://attack.mitre.org/tactics/TA0003/), podemos buscar nos logs as técnicas que o atacante pode ter usado.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*cz-rjkImg4uxRo3EsRXZ1Q.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:832/format:webp/1*8jhAXJeeH_pEL66kOdSV8A.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual protocolo é usado para realizar a descoberta de hosts?**

Podemos descobrir essa informação analisando o tráfego de saída do primeiro host comprometido.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*M6gRH8_uZA3ZXIpgTVlHHg.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*DJHJ3cWbNnjZozN92LZM9g.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o serviço de e-mail usado pela empresa? (uma palavra)**

Podemos analisar o tráfego direcionado às portas padrão dos serviços de IP. Nesse caso, sem sucesso, analisamos o tráfego HTTPS na porta 443. Consultamos [https://viewdns.info](https://viewdns.info) e a maioria dos IPs pertencem à Microsoft, confirmando a resposta.

> ### **Qual é o nome do arquivo malicioso usado para a infecção inicial?**

Identificamos o arquivo pelo hash MD5.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Tcfjcty0Nq6f2wm8PiK9GA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o nome da nova conta adicionada pelo atacante?**

Podemos buscar o ID de evento 4720, que indica a criação de uma conta de usuário.

[Ref: ultimatewindowssecurity EVENT 4720](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4720)

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:490/format:webp/1*xFOxxKzXKW7diiu2mgeDFw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*jcrZ0OxzRtwgro1gngojLw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o PID do processo que realizou a injeção?**

Podemos buscar por criação de processos no host infectado.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:960/format:webp/1*5YSQUgerqg_FZiqFy78Dig.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*ghrXmlEOUMNmzdLyBbqy-w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*7QyI99xBqt4hFNrh0fP4rA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o nome da ferramenta usada para movimentação lateral?**

Eu não conhecia essa ferramenta e não encontrei nada nos logs. Usei a dica e, ao pesquisar no Google, encontrei [https://github.com/SecureAuthCorp/impacket](https://github.com/SecureAuthCorp/impacket)

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1240/format:webp/1*wcQmKJ0jUI24ubbGXVFUWw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **O atacante exfiltrou um arquivo. Qual é o nome da ferramenta usada para exfiltração?**

Pesquisando eventos que indicam comunicação com o atacante.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*60qypUXRT6TSI2f3eP331w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*dz7B6IkGTfLGaKlohftT9g.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Quem é o outro administrador de domínio legítimo além do administrador?**

Podemos ver uma lista de usuários agrupados por nome e buscar o evento [**_4672_**](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4672)**_._**

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:606/format:webp/1*ChKRs3mb3hIAuxqapP3x9w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:840/format:webp/1*kZlSbod-_IYuPFIRt5YJTA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **O atacante usou a técnica de descoberta de hosts para saber quantos estavam disponíveis em certa rede. Qual rede o hacker escaneou do host IP 1 ao 30?**

Podemos verificar se a primeira máquina comprometida escaneou a rede.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1148/format:webp/1*C78p5kQSWI0CSwIPfr647Q.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*k_mTtZ-NVq8E4PFvS82iaQ.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Qual é o nome do funcionário que contratou o atacante?**

Ao buscar qual ferramenta o atacante usou para exfiltração de dados, notamos uma planilha .xlsx suspeita.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Wnh0tvkWlhnXJtfleAxuSA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

Espero que este write-up tenha ajudado. Para dúvidas, entre em contato: [https://www.linkedin.com/in/isaacfn/](https://www.linkedin.com/in/isaacfn/)

<br>

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*RQ1UkOuc8hVmcWw_.png" class="img-fluid rounded z-depth-1" zoomable=true %}

<br><br>
