---
layout: post
title: Passo a passo instalação Apache Guacamole
date: 2022-11-14 12:00:00
description: Instalação Guacamole
tags: Guacamole
categories: How-To
thumbnail: https://img.stackshare.io/service/12032/qradar.png
giscus_comments: true
related_posts: true
featured: true
toc:
  sidebar: left
---

> Recentemente resolvi testar o Apacha Guacamole e resolvi documentar o processo de instalação.

O Guacamole é um software de código aberto que permite o acesso remoto a desktops e servidores através de um navegador web.

A opção que achei mais fácil foi usando docker, segue link para [documentação oficial.](https://guacamole.apache.org/doc/gug/guacamole-docker.html)

Os procedimentos a seguir foram executados em um debian. 

# Install Docker
Documentação [Docker](https://docs.docker.com/engine/install/debian/)

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
Instalando pacotes docker

```shell
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```
Podemos verificar se a instalação ocorreu com sucesso executando

```shell
 docker -v
```

Adicionaremos o usuário atual aao grupo docker para evitar executar comandos como sudo.
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
![Docker Images](docker_images.png)

Agora que estamos com as imagens baixadas, precisamos iniciar o banco de dados com o comando: 

```shell
docker run --rm guacamole/guacamole:latest /opt/guacamole/bin/initdb.sh --mysql > initdb.sql
```
![InitDbSql](initdb_sql.png)


Devemos criar um arquivo `.env` onde colocaremos as credenciais de acesso 
```
MYSQL_ROOT_PASSWORD=SuperSecretP@sswr0rd!@#$%^&*
MYSQL_DATABASE=guacamole_db
MYSQL_USER=guacamole_user
MYSQL_PASSWORD=SecretP@sswr0rd!@#$%^&*
```
![Env](env.png)

Criaremos o nosso `docker-compose.yml`

```
version: '3'
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
      - './db-data:/var/lib/mysql'
volumes:
  db-data:
```
![docker_compose](docker_compose.png)

Após isso podemos executar 
```
docker compose up -d
```

`docker-compose up -d` se tiver instalado docker-compose ao ínves de  docker-compose-plugin.


Em seguida, vamos precisar copiar nosso arquivo sql para dentro do container.

```
docker cp initdb.sql guacamoledb:/initdb.sql
```
Last but not least begin to input it to the DB by running this:

E por último instalaremos o mysql dentro do container.

```
docker exec -it guacamoledb bash
#if get error due not mysql
#apt-get update && apt-get install -y default-mysql-client

cat /initdb.sql | mysql -u root -p guacamole_db
exit
```

and now time for your to turn off the DB by running 

```
docker-compose down
```
Complete the docker-compose.yml with all the necessary image

Now your best practice is to backup your docker-compose files by typing 

```
mv docker-compose.yml docker-compose.yml.bak
```

Next you will edit and add more detail

nano docker-compose.yml
```
version: '3'
services:
  guacdb:
    container_name: guacamoledb
    image: mariadb:latest
    restart: unless-stopped
    user: mysql
    environment:
      MYSQL_ROOT_PASSWORD: 'MariaDBRootPass'
      MYSQL_DATABASE: 'guacamole_db'
      MYSQL_USER: 'guacamole_user'
      MYSQL_PASSWORD: '8uqwSnu9aH6va7F8udxcmGh8YTbSTfV3Q8mDw8QF'
    volumes:
      - './db-data:/var/lib/mysql'
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
      MYSQL_DATABASE: "guacamole_db"
      MYSQL_USER: "guacamole_user"
      MYSQL_PASSWORD: "8uqwSnu9aH6va7F8udxcmGh8YTbSTfV3Q8mDw8QF"
      TOTP_ENABLED: "true"
    depends_on:
      - guacdb
      - guacd
volumes:
  db-data:

```

  
Now you will be able to run and you should have your Guacamole up and running on your server.
```
docker-compose up -d
```




How do I access Guacamole?
Very simple just open your browser and put in your Guacamole IP with port 8080

For example: http://mylocalip.home:8080/guacamole <- guacamole cant be access via root directory, so you will have to add /guacamole.

The original username/password are guacadmin/guacadmin

For security reason I include TOTP in my installation guide, so be sure to have your google authenticator ready for scanning. Else make sure you remove TOTP_ENABLED: "true" line from your docker-compose.yml file.

```
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo apt-get install iptables-persistent
sudo netfilter-persistent save
sudo iptables -L

```













ref:
https://krdesigns.com/articles/how-to-install-guacamole-using-docker-step-by-step
