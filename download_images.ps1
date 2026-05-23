$baseUrl = "https://shop.arihub.my.id/storage/uploads/images/products/"
$outDir = "c:\Project\zenitech\public\images\products"

if (-not (Test-Path -Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$images = @(
    @{ slug = "iphone-15-pro-max"; files = @("e1Mzpkr2fcRqVTNczyNmcqjKhjaetyNTroElKTmc.webp", "9ANBQTBUSAbqBv0YAVpgylScTILyNcEOnyEJOIuS.webp", "Z2HLnmhNIT8DmqlXeUClXxClypEZRIwcQEaah89A.webp", "UKDCu2XYjPCf6gPNVun48TPxGA68FPkc8VvivkOL.webp") },
    @{ slug = "iphone-14-pro-max"; files = @("UDM5IhVj0wMg0glcRyn07SAqlYF9q6Chx69N6ONc.webp", "Toi4jXMrz5JX1zpTTPuui5wFeGVLPCnHFqdBUPUH.webp", "FHjkTQTAWsTbZndeQ7HBaQAo2ncz03GzClPyRg2r.webp", "21OgiRWqIskpIjnaBk2XvcfEyh2y7ShTUrWKmLkQ.webp") },
    @{ slug = "iphone-13"; files = @("3JyjfiShmLfYAhETqVCRmAszqX7o1wY8jest78cT.webp", "oSYkOJfmRwf48T35SXM7P0B7GoAw741KvoRI5wQq.webp", "0pMxju3LY4011Cnr1o436uPo1jzLgIVYolKlxrhB.webp", "CxvmKlKCNwg0d8N1cFzJC5MbM3CyYItqeWIzuBbS.webp") },
    @{ slug = "iphone-12"; files = @("cBnDJ5sOzEUTYfJQrGFhiU4HxaKT9VNwFnkUE0PD.webp", "YvyQQGxqRr92FY0XaEgqzG8tIZXd9l5ZWPUVyr4h.webp", "T7TTbjws5Hcr6ml1YT1qBKZer6H6TSFR8oDhVosP.webp", "GtN63tTQVxLkg0it9MkbrXdsV6YV2QOiK0BoEUcV.webp") },
    @{ slug = "macbook-air-m2"; files = @("tRHvGPG3LwNbaTdwfle1qTBxCchyxHmlmEeENxao.webp", "NHvBC4sO7sD77sRFhAPxcxa3I2pCn1iheW2JpFw1.webp", "6PJJOHxAXyqtSTAd3Cqw7huCO3gIkNi7rlpWsRFv.webp", "4okLJ5n6QWDioXYLGNs9D9WtSjgxsbOS7Vwa6HRN.webp") },
    @{ slug = "apple-watch-nike-s3"; files = @("96yYw5LyrdebH9j9ZWn6yaSWzAe7BRzYCj0V8pKZ.webp", "RvEuwXsP1KZha90BsUnTSpZns9PWtBZUxexb2sKD.webp") },
    @{ slug = "beats-studio-elite"; files = @("OUZTV1eA4WJshhPKS1Rz6uMepv5jfojMDl602ixI.webp") },
    @{ slug = "playstation-dualsense"; files = @("72RsQZDzqQi0tacXig9qxpfiwYOuKW1NRF5wM0ll.webp") }
)

foreach ($item in $images) {
    $idx = 1
    foreach ($file in $item.files) {
        $url = "$baseUrl$file"
        $outFile = "$outDir\$($item.slug)-$idx.webp"
        Write-Host "Downloading $url to $outFile"
        try {
            Invoke-WebRequest -Uri $url -OutFile $outFile -UseBasicParsing
        } catch {
            Write-Host "Failed to download $url" -ForegroundColor Red
        }
        $idx++
    }
}
Write-Host "Done downloading images."
