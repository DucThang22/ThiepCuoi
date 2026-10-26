Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile("C:\Users\Admin\.gemini\antigravity-ide\brain\d19c408c-96b9-4af3-a684-3d78abbe2f39\envelope_opened_hearts_floating_1793009902864.png")
Write-Output "Image size: $($bmp.Width) x $($bmp.Height)"

# Inspect region around x=175..230, y=250..320
$foundRed = 0
for ($y = 200; $y -lt 350; $y += 5) {
    for ($x = 150; $x -lt 300; $x += 5) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -lt 30 -and $c.B -lt 50) {
            $foundRed++
        }
    }
}
Write-Output "Found bright red pixels count: $foundRed"
$bmp.Dispose()
