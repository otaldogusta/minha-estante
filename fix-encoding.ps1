# fix-encoding.ps1 - Protecao contra Mojibake UTF-8 PT-BR
# Uso: .\fix-encoding.ps1 [-DryRun] [-Path src]
param(
  [string]$Path = 'src',
  [switch]$DryRun
)
$root = if ([System.IO.Path]::IsPathRooted($Path)) { $Path } else { Join-Path $PSScriptRoot $Path }
$ext = @('*.tsx', '*.ts', '*.css', '*.json', '*.md')
function Make-Pattern([byte[]]$b) {
  return [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($b)
}
$patterns = @(
  (Make-Pattern @(0xC3, 0xA1)),
  (Make-Pattern @(0xC3, 0xA3)),
  (Make-Pattern @(0xC3, 0xA9)),
  (Make-Pattern @(0xC3, 0xAA)),
  (Make-Pattern @(0xC3, 0xAD)),
  (Make-Pattern @(0xC3, 0xB3)),
  (Make-Pattern @(0xC3, 0xB4)),
  (Make-Pattern @(0xC3, 0xB5)),
  (Make-Pattern @(0xC3, 0xBA)),
  (Make-Pattern @(0xC3, 0xA7)),
  (Make-Pattern @(0xC3, 0x87)),
  (Make-Pattern @(0xE2, 0x80, 0x94)),
  (Make-Pattern @(0xE2, 0x80, 0x93)),
  (Make-Pattern @(0xC2, 0xB7))
)
$f=0;$c=0;$bad=0
Write-Host 'Minha Estante - Verificador Encoding UTF-8 PT-BR' -ForegroundColor Cyan
if ($DryRun) { Write-Host '(MODO LEITURA)' -ForegroundColor Yellow }
Write-Host ('=' * 50) -ForegroundColor DarkGray
$files = $ext | ForEach-Object {
  Get-ChildItem -Path $root -Recurse -Filter $_ -ErrorAction SilentlyContinue
} | Where-Object { $_.FullName -notmatch 'node_modules|\.cache|dist|\.wrangler|build' } | Sort-Object FullName
foreach ($file in $files) {
  $c++
  $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
  $dirty = $false
  foreach ($p in $patterns) {
    if ($content.Contains($p)) { $dirty = $true; $bad++; break }
  }
  if (-not $dirty) { continue }
  Write-Host ('[MOJIBAKE] ' + $file.FullName.Replace($root,'')) -ForegroundColor Red
  if ($DryRun) { continue }
  $bytes = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetBytes($content)
  $fixed = [System.Text.Encoding]::UTF8.GetString($bytes)
  $stillBad = $false
  foreach ($p in $patterns) { if ($fixed.Contains($p)) { $stillBad = $true; break } }
  if (-not $stillBad) {
    [System.IO.File]::WriteAllText($file.FullName, $fixed, [System.Text.Encoding]::UTF8)
    Write-Host '  -> Corrigido!' -ForegroundColor Green; $f++
  } else {
    Write-Host '  -> Corrija manualmente (double-mojibake)' -ForegroundColor Yellow
  }
}
Write-Host ('=' * 50) -ForegroundColor DarkGray
Write-Host ('Verificados: ' + $c)
if ($bad -gt 0) {
  if (-not $DryRun) { Write-Host ('Corrigidos: ' + $f) -ForegroundColor Green }
  else { Write-Host ('Corrompidos: ' + $bad + ' - execute sem -DryRun') -ForegroundColor Yellow }
} else { Write-Host 'Tudo OK! Nenhuma corrupcao.' -ForegroundColor Green }
