---
layout: post
title: Step-by-step Apache Guacamole Installation.
date: 2024-11-14 12:00:00
description: Guacamole Instalation
tags: Guacamole
categories: How-To
thumbnail: https://www.pinclipart.com/picdir/big/519-5196913_apache-guacamole-logo-clipart.png
giscus_comments: true
related_posts: true
featured: true
toc:
  sidebar: left
---

> Recently, I decided to test Apache Guacamole and document the installation process.

Guacamole is an open-source software that enables remote access to desktops and servers via a web browser.

The easiest option I found was using Docker. Here's the link to the [official documentation.](https://guacamole.apache.org/doc/gug/guacamole-docker.html)

The steps below were performed on a Debian system.

## Install Docker

[Docker documentation](https://docs.docker.com/engine/install/debian/)

Adding the Docker repository:

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

Installing Docker packages:

```shell
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verify the installation by running:

```shell
 docker -v
```

Add the current user to the Docker group to avoid using sudo with commands:

```shell
sudo usermod -aG docker $USER
```

For this installation, I'm using the latest images, but for production use, it is recommended to use a specific version tag to avoid compatibility issues during upgrades or migrations.

Check out the available images on [DockerHub Guacamole](https://hub.docker.com/u/guacamole)

```shell
docker pull guacamole/guacd
docker pull guacamole/guacamole
docker pull mariadb
```

Verify the downloaded images with the docker:

 ```shell
 docker images
 ```

![Docker Images](/assets/img/guacamole/docker_images.png)

Now, let's initialize the database with the command:

```shell
docker run --rm guacamole/guacamole:latest /opt/guacamole/bin/initdb.sh --mysql > initdb.sql
```

![InitDbSql](/assets/img/guacamole/initdb_sql.png)

Create an `.env` file to store the access credentials:

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

Create the `docker-compose.yml` file:

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

Start the database with:

```shell
docker compose up -d
```

For systems with docker-compose installed instead of the plugin, use `docker-compose up -d`.

![mariadb_up](/assets/img/guacamole/mariadb_up.png)

Next, copy the `initdb.sql` file into the container:

```shell
docker cp initdb.sql guacamoledb:/initdb.sql
```

Within the container, install MySQL client and initialize the database:

```shell
docker exec -it guacamoledb bash
```

```shell
apt-get update && apt-get install -y default-mysql-client
cat /initdb.sql | mysql -u root -p guacamole_db
exit
```

![dbinit](/assets/img/guacamole/db_init.png)

Shut down the database container:

```shell
docker compose down
```

![db_down](/assets/img/guacamole/db_down.png)

As a best practice, back up the database initialization file:

```shell
mv docker-compose.yml docker-compose.yml.bak
```

![docker-compose-backup](/assets/img/guacamole/docker-compose-backup.png)

Create a new docker-compose.yml with all necessary configurations:

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

Start the Guacamole service:

```shell
docker compose up -d
```

![guacamoelup](guacamoelup.png)

## Accessing Guacamole

Devemos acessar usando http://localhost:8080/guacamole

> ##### Tip
> Guacamole is not directly accessible from the root. Add /guacamole to the address.
{: .block-tip }

![login_guacamole](/assets/img/guacamole/login_guacamole.png)

> ##### Danger
> The default credentials are guacadmin/guacadmin
{: .block-danger }

> ##### Warning
> In our docker-compose, we enabled TOTP. This requires an app like Authy, 2FAS, or Google Authenticator for login. To disable this, remove the line `TOTP_ENABLED: "true"`.
{: .block-warning }

![totp](/assets/img/guacamole/totp.png)

Allow inbound traffic on port 8080:

```shell
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
sudo apt-get install iptables-persistent
sudo netfilter-persistent save
sudo iptables -L
```

Reference:
  - [https://krdesigns.com/articles/how-to-install-guacamole-using-docker-step-by-step](https://krdesigns.com/articles/how-to-install-guacamole-using-docker-step-by-step)
