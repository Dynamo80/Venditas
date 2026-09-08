<#
.SYNOPSIS
  Register the daily outreach routine with Windows Task Scheduler.

.DESCRIPTION
  The routine was already one command. It still needed a person to remember it,
  and between 4 and 8 September nobody did: five working days at a 25/day cap,
  125 sends that cannot be bought back, because an unused cap does not roll over.

  This registers `node ops/daily.mjs` as a scheduled task with StartWhenAvailable
  set, so a laptop that was asleep at half past nine runs it on waking rather
  than skipping the day. That single setting is most of the point of this file.

  DEFAULTS TO A DRY RUN. Without -Live the task runs the routine and reports
  what it would send, without sending. Arm it deliberately, once you have
  watched a dry run you are happy with.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1
  # installs a dry-run task at 09:30 UK time

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Live
  # arms it: the task now sends

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Remove
#>

[CmdletBinding()]
param(
  # Local time to run. 14:00 IST is 09:30 UK in BST — inside the 07:00-18:00
  # window the sender enforces, and early enough that a reply can be answered
  # the same working day.
  [string]$At = '14:00',
  [switch]$Live,
  [switch]$Remove
)

$ErrorActionPreference = 'Stop'
$TaskName = 'Venditas daily outreach'
$Root = Split-Path -Parent $PSScriptRoot

if ($Remove) {
  $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
  if ($existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Removed '$TaskName'." -ForegroundColor Yellow
  } else {
    Write-Host "'$TaskName' was not registered." -ForegroundColor Yellow
  }
  return
}

# --- sanity: the things the task will need at 09:30 on a morning nobody watches
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "node is not on PATH. The task would fail every morning silently." }

$daily = Join-Path $Root 'ops\daily.mjs'
if (-not (Test-Path $daily)) { throw "Not found: $daily" }

if (-not (Test-Path (Join-Path $Root '.env.local'))) {
  Write-Host "WARNING: .env.local is missing. The task will run and send nothing." -ForegroundColor Yellow
}

$arguments = "`"$daily`""
if ($Live) { $arguments = "`"$daily`" --send --confirm" }

$action = New-ScheduledTaskAction -Execute $node -Argument $arguments -WorkingDirectory $Root

# Weekdays only. The sender refuses to run at a weekend anyway; this stops the
# task waking the machine to be told so.
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At $At

# StartWhenAvailable is the setting that matters: a run missed because the
# laptop was off fires when it next comes up, instead of being lost. The batch
# itself still refuses to send outside UK working hours, so a machine woken at
# 23:00 reads the inbox and sends nothing.
$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -DontStopIfGoingOnBatteries `
  -AllowStartIfOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
  -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Settings $settings -Description 'Venditas: inbox, nurture, follow-ups and the daily batch.' `
  -Force | Out-Null

$mode = 'DRY RUN (sends nothing)'
if ($Live) { $mode = 'LIVE — this will send mail' }

Write-Host ''
Write-Host "Registered '$TaskName'" -ForegroundColor Green
Write-Host "  runs      weekdays at $At, local time"
Write-Host "  mode      $mode"
Write-Host "  catch-up  yes - a missed day runs when the machine next wakes"
Write-Host "  log       ops\daily.log"
Write-Host ''
if (-not $Live) {
  Write-Host "Watch one run, then arm it:" -ForegroundColor Cyan
  Write-Host "  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Live"
  Write-Host ''
}
Write-Host "Run it now without waiting:  Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "Check it:                    Get-ScheduledTaskInfo -TaskName '$TaskName'"
Write-Host ''
