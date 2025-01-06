---
layout: post
title: Script para habilitar auditorias Windows e Sysmon.
date: 2024-11-11 12:00:00
description: Auditorias Windows e Sysmon
tags: Windows-Audit Sysmon SIEM
categories: Scripts
thumbnail: https://miro.medium.com/v2/resize:fit:583/1*vVM5hdOGlxqB7tXvxNT0qg.png
giscus_comments: true
related_posts: true
featured: false
toc:
  sidebar: left
---

Recentemente, precisei reconfigurar uma máquina para meu laboratório pessoal e, enquanto rodava o script que automatiza a configuração de algumas auditorias e configurações do Sysmon, lembrei que, principalmente para quem está começando na área, esse processo é muitas vezes feito manualmente. Embora isso seja ótimo para aprender, definitivamente pode ser automatizado.

Então, decidi compartilhar um script PowerShell que automatiza a ativação das principais funcionalidades de auditoria. 

Se alguém tiver sugestões de auditorias adicionais que possam estar faltando ou melhorias para o arquivo de configuração do Sysmon, sua contribuição será muito bem-vinda!

```shell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

```shell
# This PowerShell script enhances Windows security logging by enabling various event logs and installing Sysmon. 
# It prompts for admin rights and asks if you want to install Sysmon. If confirmed, it activates logs for user logon events, object access, privilege use, process tracking, and more. It also enables PowerShell script block logging and command line auditing for better visibility into executed commands.

#powershell.exe -ExecutionPolicy Bypass -File .\Sysmon.ps1

# Security Logs:
# Logon/Logoff Events: Events related to user logon and logoff (Event IDs: 4624, 4625, 4634, 4647, etc.).
# Object Access: Events related to accessing objects such as files, directories, and registry keys (Event IDs: 4656, 4663, etc.).
# Privilege Use: Events related to the use of sensitive privileges (Event IDs: 4672, 4673, etc.).
# Process Tracking: Events related to the creation, termination, and access of processes (Event IDs: 4688, 4689, etc.).
# Account Logon: Events related to account logon and logoff (Event IDs: 4624, 4625, 4634, 4647, etc.).
# Account Management: Events related to the creation, modification, and deletion of user accounts (Event IDs: 4720, 4722, 4724, etc.).
# Policy Changes: Events related to changes in security policies (Event IDs: 4670, 4719, etc.).
# System Events: Events related to system changes, such as updates, drivers, etc. (Event IDs: 4610, 4615, etc.).
# Group Membership: Events related to adding and removing users from groups (Event IDs: 4728, 4732, 4756, etc.).
# Sensitive Privilege Use: Events related to the use of sensitive privileges, such as the ability to debug processes (Event IDs: 4672, 4673, etc.).

# PowerShell Script Log: The script activates PowerShell script block logging, allowing auditing of scripts executed on the system.
# Command Line Log: The script activates auditing of Event 4688, which records the full command line used to create new processes.

# Additional Security Logs:
# Remote Desktop Services: Events related to the use of Remote Desktop Services (RDP).
# Local Session Manager of Terminal Services: Events related to local terminal sessions.
# Remote Connection Manager of Terminal Services: Events related to remote terminal connections.
# SMB Client: Events related to the use of the SMB (Server Message Block) client for file sharing.
# SMB Server: Events related to the SMB (Server Message Block) server for file sharing.
# Application Log: The script activates the application log, which records events related to applications and services running on the system.
# System Log: The script activates the system log, which records events related to the Windows kernel and drivers.


# Check if the user has elevated permissions (Administrator)
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "This script requires administrative privileges. Please run it as an administrator."
    Exit
}

# Prompt user to install Sysmon
$InstallSysmon = Read-Host "Do you want to install Sysmon? (Y/N)"
$InstallSysmon = $InstallSysmon.ToLower()

# Enable Security Event Log
$SecurityLogPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"
if (-not (Test-Path $SecurityLogPath)) {
    Write-Output "Creating registry key: $SecurityLogPath"
    New-Item -Path $SecurityLogPath -Force | Out-Null
}

Write-Output "Enabling Security Event Log settings"
$SecuritySettings = @{
    AuditLogonEvents = 3
    AuditObjectAccess = 3
    AuditPrivilegeUse = 3
    AuditProcessTracking = 3
    AuditAccountLogon = 3
    AuditAccountManagement = 3
    AuditPolicyChange = 3
    AuditSystemEvents = 3
    AuditGroupMembership = 3
    AuditSensitivePrivilegeUse = 3
}
$SecuritySettings.GetEnumerator() | ForEach-Object {
    Set-ItemProperty -Path $SecurityLogPath -Name $_.Key -Value $_.Value -Force
}

# Enable PowerShell Logging with Script Block
$RegistryPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging"
if (-not (Test-Path $RegistryPath)) {
    Write-Output "Creating registry key: $RegistryPath"
    New-Item -Path $RegistryPath -Force | Out-Null
}
Write-Output "Enabling PowerShell Script Block Logging"
Set-ItemProperty -Path $RegistryPath -Name "EnableScriptBlockLogging" -Value 1 -Type DWord -Force

# Enable Command Line Audit Event 4688
$RegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit"
if (-not (Test-Path $RegistryPath)) {
    Write-Output "Creating registry key: $RegistryPath"
    New-Item -Path $RegistryPath -Force | Out-Null
}
Write-Output "Enabling Command Line Audit Event 4688"
Set-ItemProperty -Path $RegistryPath -Name "AuditProcessCreation" -Value 3 -Type DWord -Force
Set-ItemProperty -Path $RegistryPath -Name "ProcessCreationIncludeCmdLine_Enabled" -Value 1 -Type DWord -Force

# Enable Additional Security Logs
$SecurityLogPaths = @(
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-RemoteDesktopServices-RdpCoreTS/Operational",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-TerminalServices-LocalSessionManager/Operational",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-TerminalServices-RemoteConnectionManager/Operational",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-SmbClient/Security",
    "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-SMBServer/Security"
)

foreach ($LogPath in $SecurityLogPaths) {
    if (-not (Test-Path $LogPath)) {
        Write-Output "Creating registry key: $LogPath"
        New-Item -Path $LogPath -Force | Out-Null
    }
    Write-Output "Enabling $($LogPath.Split('\\')[-1]) log"
    New-ItemProperty -Path $LogPath -Name "Enabled" -Value 1 -PropertyType DWord -Force
}

# Enable Application Event Log
$ApplicationLogPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-Application-Experience/Analytic"
if (-not (Test-Path $ApplicationLogPath)) {
    Write-Output "Creating registry key: $ApplicationLogPath"
    New-Item -Path $ApplicationLogPath -Force | Out-Null
}
Write-Output "Enabling Application Event Log"
New-ItemProperty -Path $ApplicationLogPath -Name "Enabled" -Value 1 -PropertyType DWord -Force

# Enable System Event Log
$SystemLogPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Winevt\Channels\Microsoft-Windows-Kernel-General/Analytic"
if (-not (Test-Path $SystemLogPath)) {
    Write-Output "Creating registry key: $SystemLogPath"
    New-Item -Path $SystemLogPath -Force | Out-Null
}
Write-Output "Enabling System Event Log"
New-ItemProperty -Path $SystemLogPath -Name "Enabled" -Value 1 -PropertyType DWord -Force

# Check if Sysmon is installed
$SysmonInstalled = Test-Path "C:\Windows\SysmonDrv.sys"

# Uninstall Sysmon if it's already installed
if ($InstallSysmon -eq "y") {
    $SysmonPath = "$env:TEMP\Sysmon.zip"
    $SysmonUrl = "https://download.sysinternals.com/files/Sysmon.zip"
    $SysmonConfigUrl = "https://raw.githubusercontent.com/Eyezuhk/InfoSec-Misc/refs/heads/main/Sysmon/sysmonconfig-excludes-only.xml"
    $SysmonConfigPath = "$env:ProgramData\Sysmon\config.xml"

    # Verify and create the Sysmon directory if it doesn't exist
    $SysmonDir = "$env:ProgramData\Sysmon"
    if (-not (Test-Path $SysmonDir)) {
        Write-Output "Creating Sysmon directory: $SysmonDir"
        New-Item -ItemType Directory -Path $SysmonDir | Out-Null
    }

    # Download files using .NET WebClient
    $WebClient = New-Object System.Net.WebClient
    
    # Set TLS 1.2 as the default protocol for WebClient
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    
    Write-Output "Downloading Sysmon archive..."
    $WebClient.DownloadFile($SysmonUrl, $SysmonPath)
    Write-Output "Downloading Sysmon configuration..."
    $WebClient.DownloadFile($SysmonConfigUrl, $SysmonConfigPath)

    Write-Output "Expanding Sysmon archive to $env:TEMP\Sysmon"
    Expand-Archive -Path $SysmonPath -DestinationPath "$env:TEMP\Sysmon" -Force

    Write-Output "Installing and enabling Sysmon with configuration: $SysmonConfigPath"
    & "$env:TEMP\Sysmon\Sysmon64.exe" -accepteula -i $SysmonConfigPath

    Remove-Item -Recurse -Force "$env:TEMP\Sysmon" -Confirm:$false
}

Prompt user to press a key before exiting
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```