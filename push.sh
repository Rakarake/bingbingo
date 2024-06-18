ssh rakarake@raka.rakarake.xyz "rm -r /var/www/rakarake.xyz/public/bingbingo"
scp -r public/* rakarake@raka.rakarake.xyz:/var/www/rakarake.xyz/public/bingbingo
