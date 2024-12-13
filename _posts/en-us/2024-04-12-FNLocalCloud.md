---
layout: post
title: Exposing Local Applications with FNLocalCloud.
date: 2024-04-12 12:00:00
description: An agent-server based program to expose local network services on the internet, bypassing CGNAT.
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

Recently, I found myself in a situation where I needed to access my machine via RDP, but I don't have a public IP due to the scarcity of IPs. My ISP uses CGNAT.

> I remembered a distant past when all I wanted was a VPS to expose a Counter-Strike 1.6 or Lineage 2 server for my friends to play online. Not all providers offered public IPs, and today, that's the rule.

A common solution for this scenario is using ngrok, and it worked well, but the added delay left me dissatisfied with the usability.

The same happened when I created an SSH tunnel to a free tier machine I have on Oracle, so I decided to try creating a solution in Python with the help of LLMs, since for this purpose, it greatly accelerates the creation process.

#### Reasons for the Absence of Public IPs:

IPv4 Scarcity: With the increased demand for public IPs, we've ended up resorting to techniques like CGNAT, where multiple users share the same public IPv4 address.

Costs and Security: Renting a block of public IPs can be expensive, and CGNAT offers an extra layer of security by hiding our internal IP addresses.

#### Challenges of CGNAT:

Exposing Local Services: With CGNAT, we face difficulties in exposing our local services, since all internal devices share the same public IPv4 address.

Configuration Complexity: Configuring port forwarding and dealing with CGNAT restrictions can be complicated, especially for those who are not very technical.

#### Challenges in Adopting IPv6:

Lack of Incentive: Many internet providers have not yet adopted IPv6, which hinders our journey to expose local services.

### Solution

So, if you need to expose any local service with a reverse TCP proxy, check out the tool I created on GitHub!

Link: [https://github.com/Eyezuhk/FNLocalCloud](https://github.com/Eyezuhk/FNLocalCloud)

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.liquid path="assets/videos/FNLocalCloud/FNLocalCloud.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=true %}
    </div>
</div>
<div class="caption">
    Example video of FNLocalCloud.
</div>
