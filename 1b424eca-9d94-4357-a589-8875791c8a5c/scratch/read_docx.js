import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const docxPath = 'F:/document_and_other_louderx_files/apply/MCP_Job_Search_System_Context.docx';

// Use PowerShell to extract document.xml text accurately
const psScript = `
Add-Type -AssemblyName System.IO.Compression.FileSystem;
$zip = [System.IO.Compression.ZipFile]::OpenRead('${docxPath}');
$entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' };
$stream = $entry.Open();
$reader = New-Object System.IO.StreamReader($stream);
$content = $reader.ReadToEnd();
$reader.Close();
$stream.Close();
$zip.Dispose();
[regex]::Replace($content, '<[^>]+>', ' ');
`;

try {
  const result = execSync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
  console.log(result.replace(/\s+/g, ' '));
} catch (err) {
  console.error('Error:', err);
}
