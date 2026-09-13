<#
.SYNOPSIS
  Register Venditas's scheduled jobs with Windows Task Scheduler.

.DESCRIPTION
  Three jobs, all on this laptop (decision 010; decision 018 for the last two):

    daily    ops/daily.mjs    weekdays 14:00 IST   inbox, nurture, follow-ups, new prospects
    watch    ops/watch.mjs    every 20 minutes     replies flagged, recorded and drafted inside the hour
    weekly   ops/weekly.mjs   Saturdays 10:00      SEO check and IndexNow; Companies House refresh

  The daily routine was already one command. It still needed a person to
  remember it, and between 4 and 8 September nobody did: five working days at a
  25/day cap, 125 sends that cannot be bought back, because an unused cap does
  not roll over.

  Every job is registered with StartWhenAvailable, so a laptop that was asleep
  at the scheduled minute runs it on waking rather than skipping it. That single
  setting is most of the point of this file.

  THE DAILY JOB DEFAULTS TO A DRY RUN. Without -Live it reports what it would
  send, without sending. Arm it deliberately, once you have watched a dry run
  you are happy with. watch and weekly have no dry mode here because they send
  nothing to anyone outside the business: watch files drafts in the founder's
  own mailbox, and weekly reads public pages.

  watch and weekly run through `conhost --headless`, so a console window does
  not open on the founder's screen seventy times a day.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Live
  # all three, with the daily routine armed

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Task watch,weekly
  # only those two; the daily task is left exactly as it is

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Remove
#>

[CmdletBinding()]
param(
  # Local time for the daily run. 14:00 IST is 09:30 UK in BST, inside the
  # 07:00-18:00 window the sender enforces, and early enough that a reply can
  # be answered the same working day.
  [string]$At = '14:00',
  # Comma-separated. A string, not an array, because `powershell -File` hands
  # "watch,weekly" over as one argument and an array parameter rejects it.
  [string]$Task = 'daily,watch,weekly',
  [switch]$Live,
  [switch]$Remove
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
$Tasks = @($Task -split ',' | ForEach-Object { $_.Trim().ToLower() } | Where-Object { $_ })
foreach ($t in $Tasks) {
  if ($t -notin @('daily', 'watch', 'weekly')) { throw "Unknown task '$t'. Use daily, watch or weekly." }
}
$Names = @{
  daily  = 'Venditas daily outreach'
  watch  = 'Venditas reply watch'
  weekly = 'Venditas weekly'
}

if ($Remove) {
  foreach ($t in $Tasks) {
    $existing = Get-ScheduledTask -TaskName $Names[$t] -ErrorAction SilentlyContinue
    if ($existing) {
      Unregister-ScheduledTask -TaskName $Names[$t] -Confirm:$false
      Write-Host "Removed '$($Names[$t])'." -ForegroundColor Yellow
    } else {
      Write-Host "'$($Names[$t])' was not registered." -ForegroundColor Yellow
    }
  }
  return
}

# --- sanity: the things the tasks will need on a morning nobody watches
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { throw "node is not on PATH. Every task would fail silently." }

if (-not (Test-Path (Join-Path $Root '.env.local'))) {
  Write-Host "WARNING: .env.local is missing. The tasks will run and do nothing." -ForegroundColor Yellow
}

$conhost = Join-Path $env:SystemRoot 'System32\conhost.exe'

function New-NodeAction([string]$Script, [string]$Extra = '', [switch]$Headless) {
  $path = Join-Path $Root $Script
  if (-not (Test-Path $path)) { throw "Not found: $path" }
  $line = ("`"$path`" $Extra").Trim()
  if ($Headless) {
    return New-ScheduledTaskAction -Execute $conhost -Argument "--headless `"$node`" $line" -WorkingDirectory $Root
  }
  return New-ScheduledTaskAction -Execute $node -Argument $line -WorkingDirectory $Root
}

Write-Host ''

if ($Tasks -contains'daily') {
  $extra = ''
  if ($Live) { $extra = '--send --confirm' }
  $action = New-NodeAction 'ops\daily.mjs' $extra
  # Weekdays only. The sender refuses to run at a weekend anyway; this stops the
  # task waking the machine to be told so.
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At $At
  # The batch itself still refuses to send outside UK working hours, so a
  # machine woken at 23:00 reads the inbox and sends nothing.
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName $Names.daily -Action $action -Trigger $trigger -Settings $settings `
    -Description 'Venditas: inbox, nurture, follow-ups and the daily batch.' -Force | Out-Null

  $mode = 'DRY RUN (sends nothing)'
  if ($Live) { $mode = 'LIVE - this will send mail' }
  Write-Host "Registered '$($Names.daily)'" -ForegroundColor Green
  Write-Host "  runs      weekdays at $At, local time"
  Write-Host "  mode      $mode"
  if (-not $Live) {
    Write-Host "  arm it    powershell -ExecutionPolicy Bypass -File ops\install-schedule.ps1 -Task daily -Live" -ForegroundColor Cyan
  }
  Write-Host ''
}

if ($Tasks -contains'watch') {
  $action = New-NodeAction 'ops\watch.mjs' -Headless
  # Every twenty minutes, all day, every day. A buyer's email on a Saturday is
  # still a buyer's email. With no RepetitionDuration it repeats indefinitely.
  $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 20)
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName $Names.watch -Action $action -Trigger $trigger -Settings $settings `
    -Description 'Venditas: flag, record and draft answers to replies within the hour. Sends nothing.' -Force | Out-Null
  Write-Host "Registered '$($Names.watch)'" -ForegroundColor Green
  Write-Host "  runs      every 20 minutes"
  Write-Host "  does      marks replies, files drafts in Drafts, notifies; sends nothing"
  Write-Host ''
}

if ($Tasks -contains'weekly') {
  $action = New-NodeAction 'ops\weekly.mjs' -Headless
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Saturday -At '10:00'
  # Four hours: a Companies House month downloads 490 MB and then visits a few
  # hundred agency websites, politely.
  $settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable -DontStopIfGoingOnBatteries `
    -AllowStartIfOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 4) -MultipleInstances IgnoreNew
  Register-ScheduledTask -TaskName $Names.weekly -Action $action -Trigger $trigger -Settings $settings `
    -Description 'Venditas: SEO check and IndexNow; monthly new agencies from Companies House.' -Force | Out-Null
  Write-Host "Registered '$($Names.weekly)'" -ForegroundColor Green
  Write-Host "  runs      Saturdays at 10:00, local time"
  Write-Host "  does      seo.mjs --submit, then refresh-prospects.mjs"
  Write-Host ''
}

Write-Host "Catch-up   yes - a missed run starts when the machine next wakes"
Write-Host "Logs       ops\daily.log, ops\watch.log, ops\weekly.log, ops\notify.log"
Write-Host "Check      node ops/status.mjs   (AUTOMATION)"
Write-Host ''
