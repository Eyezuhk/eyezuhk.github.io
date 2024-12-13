---
layout: post
title: Passo a passo instalação Apache Guacamole.
date: 2024-11-14 12:00:00
description: Instalação Guacamole
tags: Guacamole
categories: How-To
thumbnail: https://www.pinclipart.com/picdir/big/519-5196913_apache-guacamole-logo-clipart.png
giscus_comments: true
related_posts: true
featured: true
toc:
  sidebar: left
---

> Recentemente resolvi testar o Apacha Guacamole e documentar o processo de instalação.

O Guacamole é um software de código aberto que permite o acesso remoto a desktops e servidores através de um navegador web.

A opção que achei mais fácil foi usando Docker, segue link para [documentação oficial.](https://guacamole.apache.org/doc/gug/guacamole-docker.html)

Os procedimentos a seguir foram executados em um Debian.

## Install Docker

[Documentação Docker](https://docs.docker.com/engine/install/debian/)

Adicionando repositório Docker

```shell
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

Instalando pacotes Docker:

```shell
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Podemos verificar se a instalação ocorreu com sucesso executando:

```shell
 docker -v
```

Adicionaremos o usuário atual ao grupo Docker para evitar executar comandos como sudo.

```shell
sudo usermod -aG docker $USER
```

Nesse caso estou instalando as imagens mais recentes, mas se for utilizar em produção, seria interessante instalar a imagem com a tag da versão, para evitar possíveis problemas de compatibilidade em upgrade, migração...

Pode verificar as imagens no [DockerHub Guacamole](https://hub.docker.com/u/guacamole)

```shell
docker pull guacamole/guacd
docker pull guacamole/guacamole
docker pull mariadb
```

Podemos verificar as imagens com o comando
 ```shell
 docker images
 ```

![Docker Images](/assets/img/guacamole/docker_images.png)

Agora que estamos com as imagens baixadas, precisamos iniciar o banco de dados com o comando:

```shell
docker run --rm guacamole/guacamole:latest /opt/guacamole/bin/initdb.sh --mysql > initdb.sql
```

![InitDbSql](/assets/img/guacamole/initdb_sql.png)

Devemos criar um arquivo `.env` onde colocaremos as credenciais de acesso.

```
nano .env
```

```js
MYSQL_ROOT_PASSWORD=SuperSecretP@sswr0rd!@#$%^&*
MYSQL_DATABASE=guacamole_db
MYSQL_USER=guacamole_user
MYSQL_PASSWORD=SecretP@sswr0rd!@#$%^&*
```

![Env](/assets/img/guacamole/env.png)

Criaremos o nosso `docker-compose.yml`

```
nano docker-compose.yml
```

```yaml
version: "3"
services:
  guacdb:
    container_name: guacamoledb
    image: mariadb:latest
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - "./db-data:/var/lib/mysql"
volumes:
  db-data:
```

![docker_compose](/assets/img/guacamole/docker_compose.png)

Após isso podemos iniciar com docker compose:

```shell
docker compose up -d
```

`docker-compose up -d` se tiver instalado docker-compose ao ínves de docker-compose-plugin.

![mariadb_up](/assets/img/guacamole/mariadb_up.png)

Em seguida, vamos precisar copiar nosso arquivo `initdb.sql` para dentro do container.

```shell
docker cp initdb.sql guacamoledb:/initdb.sql
```

Teremos que instalar o mysql client dentro do docker guacamoledb.

```shell
docker exec -it guacamoledb bash
```

```shell
apt-get update && apt-get install -y default-mysql-client
cat /initdb.sql | mysql -u root -p guacamole_db
exit
```

![dbinit](/assets/img/guacamole/db_init.png)

Após isso podemos derrubar o guacamoledb.

```shell
docker compose down
```

![db_down](/assets/img/guacamole/db_down.png)

Como boa prática, recomenda-se salvar o arquivo de inicialização do banco.

```shell
mv docker-compose.yml docker-compose.yml.bak
```

![docker-compose-backup](/assets/img/guacamole/docker-compose-backup.png)

Iremos criar o novo docker-compose.yml com todas as informações necessárias.

```shell
nano docker-compose.yml
```

```yaml
version: "3"
services:
  guacdb:
    container_name: guacamoledb
    image: mariadb:latest
    restart: unless-stopped
    user: mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    volumes:
      - "./db-data:/var/lib/mysql"
  guacd:
    container_name: guacd
    image: guacamole/guacd:latest
    restart: unless-stopped
  guacamole:
    container_name: guacamole
    image: guacamole/guacamole:latest
    restart: unless-stopped
    ports:
      - 8080:8080
    environment:
      GUACD_HOSTNAME: "guacd"
      MYSQL_HOSTNAME: "guacdb"
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_USER}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      TOTP_ENABLED: "true"
    depends_on:
      - guacdb
      - guacd
volumes:
  db-data:
```

Agora podemos iniciar nosso serviço Guacamole.

```shell
docker compose up -d
```

![guacamoelup](guacamoelup.png)

## Acesso ao guacamole

Devemos acessar usando http://meuip:8080/guacamole

> ##### Dica
> O Guacamole não é acessível diretamente pela raiz, é necessário adicionar /guacamole ao endereço.
{: .block-tip }

![login_guacamole](/assets/img/guacamole/login_guacamole.png)

> ##### Perigo
> As credenciais padrão são guacadmin/guacadmin
{: .block-danger }

> ##### Aviso
> No nosso docker-compose habilitamos o TOTP, assim será necessário um aplicativo como authy, 2fas, google authenticator para iniciar nossas credenciais.
> Caso deseje, pode remover a linha `TOTP_ENABLED: "true"`
{: .block-warning }

![totp](/assets/img/guacamole/totp.png)

Lembrando de liberar o tráfego de entrada na porta 8080:

```shell
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo apt-get install iptables-persistent
sudo netfilter-persistent save
sudo iptables -L
```

Referência: 
  -  [https://krdesigns.com/articles/how-to-install-guacamole-using-docker-step-by-step](https://krdesigns.com/articles/how-to-install-guacamole-using-docker-step-by-step)
