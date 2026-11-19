# Downloads every photo & video the Orbitly site uses into /assets (no hotlinks, nothing breaks).
# Re-run any time:  powershell -ExecutionPolicy Bypass -File .\assets\fetch-assets.ps1
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$img = Join-Path $root "img"; $vid = Join-Path $root "video"
New-Item -ItemType Directory -Force $img, $vid | Out-Null

function Get-First($dest, $urls, $minKB) {
  if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt ($minKB * 1KB))) { "SKIP $(Split-Path -Leaf $dest)"; return }
  foreach ($u in $urls) {
    curl.exe -sL -A "Mozilla/5.0" -o $dest $u
    if ((Test-Path $dest) -and ((Get-Item $dest).Length -gt ($minKB * 1KB))) { "OK   $(Split-Path -Leaf $dest)  <- $u"; return }
  }
  if (Test-Path $dest) { Remove-Item $dest }
  "FAIL $(Split-Path -Leaf $dest)"
}

$U = "https://images.unsplash.com/photo-"
$Q = "?auto=format&fit=crop&w=1600&q=80"
$P = "?auto=format&fit=crop&w=400&h=400&q=80"

# Unsplash (free commercial licence) - first working ID wins
$images = [ordered]@{
  "hero-poster.jpg"  = @("1600880292089-90a7e086ee0c","1559136555-9303baea8ebd","1542744173-8e7e53415bb0")
  "svc-brand.jpg"    = @("1559136555-9303baea8ebd","1542744173-8e7e53415bb0","1517245386807-bb43f82c33c4")
  "svc-product.jpg"  = @("1555066931-4365d14bab8c","1498050108023-c5249f4df085","1531297484001-80022131f5a1")
  "svc-growth.jpg"   = @("1543286386-713bdd548da4","1504868584819-f8e8b4b6d7e3","1551288049-bebda4e38f71")
  "svc-ai.jpg"       = @("1620712943543-bcc4688e7485","1677442136019-21780ecad995","1518770660439-4636190af475")
  "bento-team.jpg"   = @("1600132806370-bf17e65e942f","1580894908361-967195033215","1573496359142-b8d87734a5a2")
  "bento-chip.jpg"   = @("1518770660439-4636190af475","1620712943543-bcc4688e7485","1531297484001-80022131f5a1")
  "case-1.jpg"       = @("1542744173-8e7e53415bb0","1517245386807-bb43f82c33c4","1556761175-5973dc0f32e7")
  "case-2.jpg"       = @("1563986768609-322da13575f3","1498050108023-c5249f4df085","1555066931-4365d14bab8c")
  "case-3.jpg"       = @("1573496359142-b8d87734a5a2","1580894908361-967195033215","1600132806370-bf17e65e942f")
  "case-4.jpg"       = @("1556761175-5973dc0f32e7","1517245386807-bb43f82c33c4","1559136555-9303baea8ebd")
}
foreach ($k in $images.Keys) { Get-First (Join-Path $img $k) ($images[$k] | % { "$U$_$Q" }) 40 }

$people = [ordered]@{
  "a-1.jpg" = @("1580489944761-15a19d654956","1534528741775-53994a69daeb")
  "a-2.jpg" = @("1539571696357-5a69c17a67c6","1506794778202-cad84cf45f1d")
  "a-3.jpg" = @("1517841905240-472988babdf9","1488426862026-3ee34a7d66df")
  "a-4.jpg" = @("1531123897727-8f129e1688ce","1500648767791-00dcc994a43e")
  "a-5.jpg" = @("1488426862026-3ee34a7d66df","1438761681033-6461ffad8d80")
  "a-6.jpg" = @("1506794778202-cad84cf45f1d","1472099645785-5658abf4ff4e")
}
foreach ($k in $people.Keys) { Get-First (Join-Path $img $k) ($people[$k] | % { "$U$_$P" }) 10 }

# Mixkit (free commercial licence) - first working ID wins
$videos = [ordered]@{
  "hero.mp4"      = @(100319, 100311, 914)
  "present.mp4"   = @(22961, 46750)
  "meeting.mp4"   = @(4809, 4813)
  "skyline.mp4"   = @(13218, 40701)
  "laptop.mp4"    = @(1735, 101553)
  "handshake.mp4" = @(46755, 241)
  "code.mp4"      = @(41654, 41658)
}
foreach ($k in $videos.Keys) {
  $urls = @(); foreach ($id in $videos[$k]) { $urls += "https://assets.mixkit.co/videos/$id/$id-720.mp4"; $urls += "https://assets.mixkit.co/videos/$id/$id-360.mp4" }
  Get-First (Join-Path $vid $k) $urls 200
}
"DONE"
