ssh rakarake@raka.rakarake.xyz "rm -r /var/www/rakarake.xyz/public/bingbingo"
scp -r public/* rakarake@raka.rakarake.xyz:/var/www/rakarake.xyz/public/bingbingo
ssh rakarake@raka.rakarake.xyz "chmod 755 /var/www/rakarake.xyz/public/bingbingo"
