---
layout: post
title: CyberDefenders Qradar101 Write up.
date: 2022-02-16 12:00:00
description: Ctf Writeup
tags: Qradar Cyberdefenders SIEM
categories: Threat-Hunting
thumbnail: https://img.stackshare.io/service/12032/qradar.png
giscus_comments: true
related_posts: true
featured: true
toc:
  sidebar: left
---

Originally published by me on Medium [InfosecWriteups CyberDefenders QRadar101](https://infosecwriteups.com/cyberdefenders-qradar101-write-up-88bf45fdf82c)

This was the first write-up for this CTF.

Looking back, I realize it would have been much easier if I had known then what I know now. Still, I'm proud to have been the first!

---

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*RQ1UkOuc8hVmcWw_.png" class="img-fluid rounded z-depth-1" zoomable=true %}

**This write-up is based on Cyberdefenders Qradar101 challenge from Ali Alwashali.**

You can check on [https://cyberdefenders.org/blueteam-ctf-challenges/39](https://cyberdefenders.org/blueteam-ctf-challenges/39)

---

First of all, let’s start looking for offenses.

We can see 26 offenses between Oct 17 and Nov 8 of 2020.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*UfcJEcN7jFEnz4FTcG8JbA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

_Despite this, the logs are between 10/11/2020 10:00 PM and 10/11/2020 3:00 PM_

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*QuNpAdQgXKVGakze7d1XTQ.png" class="img-fluid rounded z-depth-1" zoomable=true %}

## **Questions**

> ### **How many log sources available?**

We can find this information going to Admin > ### Log Sources.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:970/format:webp/1*Xtxty8vIelmjePXM3txN4A.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the IDS software used to monitor the network?**

We can see in figure 3 the IDS is one of the log sources.

> ### **What is the domain name used in the network?**

We can find this information looking for payload events related to hosts as an example: Success Audit: A Kerberos service ticket was granted.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*lA1syASBL-Cv41NAXjKtQA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Multiple IPs were communicating with the malicious server. One of them ends with “20”. Provide the full IP.**

We can display log Activity by Source IP to see what IPs generated more communication.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*mm83K3gfDbeGJs8O76HZ-w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the SID of the most frequent alert rule in the dataset?**

We can look for sid: in the payload with regular expression.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*0flYzSiMHVDtgeN7VOuleQ.png" class="img-fluid rounded z-depth-1" zoomable=true %}

We will find 110 logs from SO-Suricata where 72 are for the rule sid:

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*TDaJUGXn8hWtS-a_xVf6lw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the attacker’s IP address?**

In closed offenses, we can see a suspicious public IP.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*50S669S0LXIETxGIRjGgtg.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **The attacker was searching for data belonging to one of the company’s projects, can you find the name of the project?**

We can search for project with regular expression.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1006/format:webp/1*hSlpjUdc87yP-FDZNun0Ww.png" class="img-fluid rounded z-depth-1" zoomable=true %}

We will find 4 events, then we will read the payload.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*-hyqniVwRcXXGOwW74epaw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the IP address of the first infected machine?**

We can order the events by increasing time. We can see a suspicious event.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*VdVE_VvgpO4zVEqOBXPJWA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the username of the infected employee using 192.168.10.15?**

Adding a filter where Source IP is 192.168.10.15 we can find the first username that logged in.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*2BLNfFZ2qw6f17x4hOie7A.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Hackers do not like logging, what logging was the attacker checking to see if enabled?**

Let’s look for the first events that the attacker generated. We can observe a tool widely used in attacks.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*oxkLfg4uQWTBOB3oDHBIAg.png" class="img-fluid rounded z-depth-1" zoomable=true %}

We can also see that the attacker is using PowerShell to find project48.

> ### **Name of the second system the attacker targeted to cover up the employee?**

We can search for deleted files.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:494/format:webp/1*LXFLGmodEfXXa498m9Ck3w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*tCCUhfbbnuIlUBof352auA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **When was the first malicious connection to the domain controller (log start time — hh:mm:ss)?**

We can look for detected network connections by looking at the payloads, we can see that the first event is for a connection to the attacker’s server 192.20.80.25. And by a process that should not be making this connection.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*cSK-Db2B1EQ5q26dbaWFqw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the md5 hash of the malicious file?**

Filtering by hash, we find 10 events, when we look at the first one from the infected machine 192.168.10.15 we can find the .docx file with malicious hash.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*LsU-skjXwlQd2zuTPLNJuA.png" class="img-fluid rounded z-depth-1" zoomable=true %}
{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*bZNAtw5DBqJ-EuR-FHH7WA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the MITRE persistence technique ID used by the attacker?**

By looking up persistence techniques in [**_mitre_**](https://attack.mitre.org/tactics/TA0003/), we can search for logs about which techniques the attacker may have used.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*cz-rjkImg4uxRo3EsRXZ1Q.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:832/format:webp/1*8jhAXJeeH_pEL66kOdSV8A.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What protocol is used to perform host discovery?**

We can discover this information by analyzing the outgoing traffic from the first compromised host.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*M6gRH8_uZA3ZXIpgTVlHHg.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*DJHJ3cWbNnjZozN92LZM9g.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the email service used by the company?(one word)**

We can look for traffic directed to the standard ports of the IP’s services, in this case, we had no success so let’s look at HTTPS traffic port 443 We checked on [https://viewdns.info](https://viewdns.info) that most IP’s belong to Microsoft and so we found our answer.

> ### **What is the name of the malicious file used for the initial infection?**

We found the file with the md5 hash.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Tcfjcty0Nq6f2wm8PiK9GA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the name of the new account added by the attacker?**

We can search for Event id 4720 A user account was created.

[Ref: ultimatewindowssecurity EVENT 4720](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4720)

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:490/format:webp/1*xFOxxKzXKW7diiu2mgeDFw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*jcrZ0OxzRtwgro1gngojLw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the PID of the process that performed injection?**

We can look for process creation on the infected host.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:960/format:webp/1*5YSQUgerqg_FZiqFy78Dig.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*ghrXmlEOUMNmzdLyBbqy-w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*7QyI99xBqt4hFNrh0fP4rA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the name of the tool used for lateral movement?**

I didn’t know about this tool and couldn’t find anything in the logs, I needed to use the tip, so searching on google I found [https://github.com/SecureAuthCorp/impacket](https://github.com/SecureAuthCorp/impacket)

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1240/format:webp/1*wcQmKJ0jUI24ubbGXVFUWw.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Attacker exfiltrated one file, what is the name of the tool used for exfiltration?**

Searching for the events where there was communication with the attacker.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*60qypUXRT6TSI2f3eP331w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*dz7B6IkGTfLGaKlohftT9g.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **Who is the other legitimate domain admin other than the administrator?**

We can see a list of users grouped by username and search for event [**_4672_**](https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/event.aspx?eventid=4672)**_._**

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:606/format:webp/1*ChKRs3mb3hIAuxqapP3x9w.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:840/format:webp/1*kZlSbod-_IYuPFIRt5YJTA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **The attacker used the host discovery technique to know how many hosts available in a certain network, what is the network the hacker scanned from the host IP 1 to 30?**

We can check if the first compromised machine scanned the network.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1148/format:webp/1*C78p5kQSWI0CSwIPfr647Q.png" class="img-fluid rounded z-depth-1" zoomable=true %}

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*k_mTtZ-NVq8E4PFvS82iaQ.png" class="img-fluid rounded z-depth-1" zoomable=true %}

> ### **What is the name of the employee who hired the attacker?**

While searching for which tool the attacker was performing data exfiltration we noticed a suspicious .xlsx spreadsheet.

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Wnh0tvkWlhnXJtfleAxuSA.png" class="img-fluid rounded z-depth-1" zoomable=true %}

I hope this write-up has helped you. Any questions, feel free to contact me on [https://www.linkedin.com/in/isaacfn/](https://www.linkedin.com/in/isaacfn/)

<br>

{% include figure.liquid loading="lazy" path="https://miro.medium.com/v2/resize:fit:1400/format:webp/0*RQ1UkOuc8hVmcWw_.png" class="img-fluid rounded z-depth-1" zoomable=true %}

<br><br>
