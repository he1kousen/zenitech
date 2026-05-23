# Get all product detail pages and extract all images
$productUrls = @(
    "https://shop.arihub.my.id/shop/smartphone/iphone-12",
    "https://shop.arihub.my.id/shop/smartphone/iphone-13",
    "https://shop.arihub.my.id/shop/smartphone/iphone-14-pro-max",
    "https://shop.arihub.my.id/shop/smartphone/iphone-15-pro-max",
    "https://shop.arihub.my.id/shop/laptop/macbook-air-153-inci-m2-2023",
    "https://shop.arihub.my.id/shop/gear/apple-watch-nike-series-3"
)

foreach ($url in $productUrls) {
    Write-Host "`n===== $url ====="
    try {
        $html = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content
        $imgPattern = 'src="(/storage/[^"]+\.(webp|png|jpg|jpeg))"'
        $imgMatches = [regex]::Matches($html, $imgPattern)
        foreach ($m in $imgMatches) {
            Write-Host "  IMG: https://shop.arihub.my.id$($m.Groups[1].Value)"
        }
    } catch {
        Write-Host "  ERROR: $($_.Exception.Message)"
    }
}
