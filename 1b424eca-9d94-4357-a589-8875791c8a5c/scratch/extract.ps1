$src = "F:\document_and_other_louderx_files\apply\MCP_Job_Search_System_Context.docx"
$dest = "$env:TEMP\docx_extract"
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
Expand-Archive -Path $src -DestinationPath $dest -Force
$xml = Get-Content "$dest\word\document.xml" -Raw
$text = [regex]::Replace($xml, '<[^>]+>', "`n")
$lines = $text -split "`n" | Where-Object { $_.Trim().Length -gt 0 }
$lines -join "`n" | Out-File -Encoding utf8 "$env:TEMP\docx_text.txt"
