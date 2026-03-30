# ShipNovo Color Enforcement Script
# This script checks for hardcoded Tailwind default colors (red, green, blue, etc.)
# and ensures only brand tokens are used.

$excludeDirs = @(".next", "node_modules", ".git", "public", "vendor")
$colorPatterns = @(
    "bg-(red|green|blue|yellow|purple|pink|indigo|teal|cyan)-"
    "text-(red|green|blue|yellow|purple|pink|indigo|teal|cyan)-"
    "border-(red|green|blue|yellow|purple|pink|indigo|teal|cyan)-"
)

$foundIssues = $false

Write-Host "Searching for non-brand colors..."

foreach ($pattern in $colorPatterns) {
    # Find files, exclude directories, and search for pattern
    $matches = Get-ChildItem -Path . -Recurse -Include *.tsx,*.ts,*.css | 
        Where-Object { 
            $fullPath = $_.FullName
            $shouldExclude = $false
            foreach ($dir in $excludeDirs) {
                if ($fullPath -like "*\$dir\*") { $shouldExclude = $true; break }
            }
            -not $shouldExclude
        } |
        Select-String -Pattern $pattern

    if ($matches) {
        $foundIssues = $true
        foreach ($m in $matches) {
            Write-Host "Violation: $($m.Line.Trim())"
            Write-Host "File: $($m.Path):$($m.LineNumber)"
        }
    }
}

if ($foundIssues) {
    Write-Host "FAILED: Use brand tokens instead of default Tailwind colors."
    exit 1
} else {
    Write-Host "PASSED: All colors follow brand identity."
    exit 0
}
