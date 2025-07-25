#!/usr/bin/env node
/**
 * Script để tăng giá tất cả items trong EconomyShopGUI
 * Sử dụng: node increase_shop_prices.js <multiplier>
 * Ví dụ: node increase_shop_prices.js 5  # Tăng giá x5 lần
 * hoặc: npm run increase-shop 5
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { glob } = require('glob');

/**
 * Tăng giá buy/sell trong file YAML
 * @param {string} filePath - Đường dẫn file shop
 * @param {number} multiplier - Hệ số nhân
 */
async function increasePrices(filePath, multiplier) {
    try {
        // Đọc file YAML
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data || !data.pages) {
            console.log(`⚠️  File không hợp lệ: ${path.basename(filePath)}`);
            return;
        }
        
        let modified = false;
        let itemCount = 0;
        
        // Duyệt qua các trang
        for (const [pageName, pageData] of Object.entries(data.pages)) {
            if (pageData.items) {
                for (const [itemId, itemData] of Object.entries(pageData.items)) {
                    // Tăng giá mua
                    if (typeof itemData.buy === 'number') {
                        const oldBuy = itemData.buy;
                        itemData.buy = Math.round((oldBuy * multiplier) * 100) / 100; // Round to 2 decimal places
                        modified = true;
                    }
                    
                    // Tăng giá bán (không tăng giá âm)
                    if (typeof itemData.sell === 'number' && itemData.sell > 0) {
                        const oldSell = itemData.sell;
                        itemData.sell = Math.round((oldSell * multiplier) * 100) / 100; // Round to 2 decimal places
                        modified = true;
                    }
                    
                    if (modified) itemCount++;
                }
            }
        }
        
        if (modified) {
            // Ghi lại file với format đẹp
            const yamlStr = yaml.dump(data, {
                defaultFlowStyle: false,
                lineWidth: -1,
                noRefs: true,
                sortKeys: false
            });
            
            await fs.writeFile(filePath, yamlStr, 'utf8');
            console.log(`✅ Updated: ${path.basename(filePath)} (${itemCount} items)`);
        } else {
            console.log(`ℹ️  No prices found: ${path.basename(filePath)}`);
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
    }
}

/**
 * Main function
 */
async function main() {
    try {
        // Lấy multiplier từ command line
        const args = process.argv.slice(2);
        if (args.length !== 1) {
            console.log('❌ Usage: node increase_shop_prices.js <multiplier>');
            console.log('📝 Example: node increase_shop_prices.js 5');
            console.log('📝 Or: npm run increase-shop 5');
            process.exit(1);
        }
        
        const multiplier = parseFloat(args[0]);
        if (isNaN(multiplier) || multiplier <= 0) {
            console.log('❌ Multiplier must be a positive number!');
            process.exit(1);
        }
        
        console.log(`🔧 Increasing shop prices by ${multiplier}x...`);
        
        // Tìm tất cả file shop
        const shopDir = path.join(__dirname, 'EconomyShopGUI', 'shops');
        const pattern = path.join(shopDir, '*.yml');
        const shopFiles = await glob(pattern);
        
        console.log(`📁 Found ${shopFiles.length} shop files`);
        
        if (shopFiles.length === 0) {
            console.log('❌ No shop files found!');
            console.log(`📂 Looking in: ${shopDir}`);
            return;
        }
        
        // Xử lý từng file
        let totalUpdated = 0;
        for (const shopFile of shopFiles) {
            await increasePrices(shopFile, multiplier);
            totalUpdated++;
        }
        
        console.log(`\n✅ Done! ${totalUpdated} shop files processed`);
        console.log(`📈 All shop prices increased by ${multiplier}x`);
        console.log('🔄 Remember to restart your server to apply changes!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    main();
}

module.exports = { increasePrices };
