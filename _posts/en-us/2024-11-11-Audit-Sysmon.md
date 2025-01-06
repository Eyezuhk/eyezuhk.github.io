---
layout: post
title: Script for enabling Windows Audit and Sysmon.
date: 2024-11-11 12:00:00
description: Windows audit and Sysmon
tags: Windows-Audit Sysmon SIEM
categories: Scripts
thumbnail: https://miro.medium.com/v2/resize:fit:583/1*vVM5hdOGlxqB7tXvxNT0qg.png
giscus_comments: true
related_posts: true
featured: false
toc:
  sidebar: left
---

Recently, I needed to reconfigure a machine for my personal lab, and while running the script that automates the setup of some Sysmon audits and configurations, I remembered that, especially for those starting in the field, this process is often done manually. While this is great for learning, it can definitely be automated.

So, I decided to share a PowerShell script that automates the activation of the main auditing features.

If anyone has suggestions for additional audits that might be missing or improvements for the Sysmon configuration file, your contributions would be greatly appreciated!

```shell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

```shell
#Requires -RunAsAdministrator

#powershell.exe -ExecutionPolicy Bypass -File .\Sysmon.ps1

function Enable-AuditPolicies {
    Write-Output "Configuring advanced audit policies for threat hunting..."
    
    # Enable Process Creation with Command Line
    auditpol /set /subcategory:"Process Creation" /success:enable /failure:enable
    reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\Audit" /v "ProcessCreationIncludeCmdLine_Enabled" /t REG_DWORD /d 1 /f
    
    # Enhanced Security Audit Policy Configuration
    $auditPolicies = @{
        # Critical for detecting credential theft and authentication attacks
        "Account Logon" = @(
            "Credential Validation",
            "Kerberos Authentication Service",
            "Kerberos Service Ticket Operations"
        )
        # Track account management and modifications
        "Account Management" = @(
            "User Account Management",
            "Security Group Management",
            "Computer Account Management"
        )
        # Essential for process tracking and command execution
        "Detailed Tracking" = @(
            "Process Creation",
            "Process Termination",
            "DPAPI Activity",
            "RPC Events"
        )
        # Critical for lateral movement detection
        "Logon/Logoff" = @(
            "Logon",
            "Logoff",
            "Special Logon",
            "Other Logon/Logoff Events",
            "Network Policy Server"
        )
        # File and registry access monitoring
        "Object Access" = @(
            "File System",
            "Registry",
            "Kernel Object",
            "SAM",
            "Certification Services",
            "Handle Manipulation"
        )
        # Track security policy changes
        "Policy Change" = @(
            "Audit Policy Change",
            "Authentication Policy Change",
            "Authorization Policy Change"
        )
        # Monitor privileged operations
        "Privilege Use" = @(
            "Sensitive Privilege Use",
            "Non Sensitive Privilege Use"
        )
        # System level changes and security state
        "System" = @(
            "Security State Change",
            "Security System Extension",
            "System Integrity"
        )
    }

    foreach ($category in $auditPolicies.Keys) {
        foreach ($subcategory in $auditPolicies[$category]) {
            Write-Output "Enabling audit policy: $category - $subcategory"
            auditpol /set /subcategory:"$subcategory" /success:enable /failure:enable
        }
    }

    # Enhanced PowerShell Logging
    $registryPaths = @{
        "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging" = @{
            "EnableScriptBlockLogging" = 1
            "EnableScriptBlockInvocationLogging" = 1
        }
        "HKLM:\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ModuleLogging" = @{
            "EnableModuleLogging" = 1
        }

    }

    foreach ($path in $registryPaths.Keys) {
        if (-not (Test-Path $path)) {
            New-Item -Path $path -Force | Out-Null
        }
        foreach ($name in $registryPaths[$path].Keys) {
            Set-ItemProperty -Path $path -Name $name -Value $registryPaths[$path][$name] -Type DWord -Force
        }
    }

    # Enable Windows Security Event Log Size
    Write-Output "Configuring Security Event Log size 2GB ..."
    wevtutil sl Security /ms:2147483648 # 2GB
}

function Install-Sysmon {
    param (
        [string]$ConfigUrl = "https://raw.githubusercontent.com/SwiftOnSecurity/sysmon-config/master/sysmonconfig-export.xml"
    )

    $sysmonPath = "$env:TEMP\Sysmon.zip"
    $sysmonUrl = "https://download.sysinternals.com/files/Sysmon.zip"
    $sysmonConfigPath = "$env:ProgramData\Sysmon\config.xml"
    $sysmonDir = "$env:ProgramData\Sysmon"

    if (-not (Test-Path $sysmonDir)) {
        New-Item -ItemType Directory -Path $sysmonDir | Out-Null
    }

    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

        Write-Output "Downloading Sysmon..."
        Invoke-WebRequest -Uri $sysmonUrl -OutFile $sysmonPath

        Write-Output "Downloading Sysmon configuration..."
        Invoke-WebRequest -Uri $ConfigUrl -OutFile $sysmonConfigPath

        Expand-Archive -Path $sysmonPath -DestinationPath "$env:TEMP\Sysmon" -Force
        & "$env:TEMP\Sysmon\Sysmon64.exe" -accepteula -i $sysmonConfigPath

        # Cleanup
        Remove-Item -Recurse -Force "$env:TEMP\Sysmon" -ErrorAction SilentlyContinue
        Remove-Item -Force $sysmonPath -ErrorAction SilentlyContinue

        Write-Output "Sysmon installed successfully!"
        
        # Configure Sysmon Event Log Size
        wevtutil sl Microsoft-Windows-Sysmon/Operational /ms:2147483648 # 2GB
    }
    catch {
        Write-Error "Error installing Sysmon: $_"
    }
}

function Update-SysmonConfig {
    Write-Host "Choose update method:"
    Write-Host "1. Provide URL to download config file"
    Write-Host "2. Provide local file path"
    $updateChoice = Read-Host "Enter your choice (1-2)"

    $sysmonConfigPath = "$env:ProgramData\Sysmon\config.xml"

    try {
        switch ($updateChoice) {
            "1" {
                $ConfigUrl = Read-Host "Enter URL for the Sysmon configuration file"
                Write-Output "Downloading new Sysmon configuration..."
                [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
                Invoke-WebRequest -Uri $ConfigUrl -OutFile $sysmonConfigPath
            }
            "2" {
                $localPath = Read-Host "Enter the full path to the local configuration file"
                if (Test-Path $localPath) {
                    Copy-Item -Path $localPath -Destination $sysmonConfigPath -Force
                }
                else {
                    throw "Local configuration file not found!"
                }
            }
            default {
                throw "Invalid choice!"
            }
        }

        Write-Output "Updating Sysmon configuration..."
        & "C:\Windows\Sysmon64.exe" -c $sysmonConfigPath
        Write-Output "Sysmon configuration updated successfully!"
    }
    catch {
        Write-Error "Error updating Sysmon configuration: $_"
    }
}

function Uninstall-Sysmon {
    try {
        Write-Output "Uninstalling Sysmon..."
        & "C:\Windows\Sysmon64.exe" -u force
        Remove-Item -Path "C:\Windows\Sysmon64.exe" -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "C:\Windows\SysmonDrv.sys" -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:ProgramData\Sysmon" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Output "Sysmon uninstalled successfully!"
    }
    catch {
        Write-Error "Error uninstalling Sysmon: $_"
    }
}

# Main script execution
$sysmonInstalled = Test-Path "C:\Windows\SysmonDrv.sys"
$action = $null

if ($sysmonInstalled) {
    Write-Host "Sysmon is currently installed. Choose an action:"
    Write-Host "1. Update Sysmon configuration"
    Write-Host "2. Uninstall Sysmon"
    Write-Host "3. Enable/Update audit policies only"
    Write-Host "4. Exit"
    $action = Read-Host "Enter your choice (1-4)"
}
else {
    Write-Host "Sysmon is not installed. Choose an action:"
    Write-Host "1. Install Sysmon"
    Write-Host "2. Enable audit policies only"
    Write-Host "3. Exit"
    $action = Read-Host "Enter your choice (1-3)"
}

switch ($action) {
    "1" {
        if ($sysmonInstalled) {
            Update-SysmonConfig
        }
        else {
            Install-Sysmon
        }
        Enable-AuditPolicies
    }
    "2" {
        if ($sysmonInstalled) {
            Uninstall-Sysmon
        }
        else {
            Enable-AuditPolicies
        }
    }
    "3" {
        if ($sysmonInstalled) {
            Enable-AuditPolicies
        }
        else {
            Write-Output "Exiting..."
            exit
        }
    }
    "4" {
        if ($sysmonInstalled) {
            Write-Output "Exiting..."
            exit
        }
    }
    default {
        Write-Output "Invalid choice. Exiting..."
        exit
    }
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
```