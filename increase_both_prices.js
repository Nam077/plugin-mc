const fs = require('fs');
const yaml = require('js-yaml');
const glob = require('glob');

// Configuration - Tăng 25% (1.25x)
const PRICE_MULTIPLIER = 1.25;

console.log('🚀 Starting shop price increase...');
console.log(`📈 Multiplier: ${PRICE_MULTIPLIER}x (${((PRICE_MULTIPLIER - 1) * 100).toFixed(0)}% increase)`);

// Find all shop files
const shopFiles = glob.sync('EconomyShopGUI/shops/*.yml');

let totalItemsProcessed = 0;
let filesProcessed = 0;

shopFiles.forEach(filePath => {
    try {
        console.log(`\n📁 Processing: ${filePath}`);
        
        // Read and parse YAML
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        let itemsInFile = 0;
        
        // Process all pages
        if (data.pages) {
            Object.keys(data.pages).forEach(pageKey => {
                const page = data.pages[pageKey];
                if (page.items) {
                    Object.keys(page.items).forEach(itemKey => {
                        const item = page.items[itemKey];
                        
                        if (item.material) {
                            let changed = false;
                            
                            // Increase buy price
                            if (item.buy && typeof item.buy === 'number' && item.buy > 0) {
                                const oldBuy = item.buy;
                                item.buy = Math.round(item.buy * PRICE_MULTIPLIER * 100) / 100;
                                console.log(`  🛒 ${item.material}: Buy ${oldBuy} → ${item.buy}`);
                                changed = true;
                            }
                            
                            // Increase sell price (only if it's positive)
                            if (item.sell && typeof item.sell === 'number' && item.sell > 0) {
                                const oldSell = item.sell;
                                item.sell = Math.round(item.sell * PRICE_MULTIPLIER * 100) / 100;
                                console.log(`  💰 ${item.material}: Sell ${oldSell} → ${item.sell}`);
                                changed = true;
                            }
                            
                            if (changed) {
                                itemsInFile++;
                            }
                        }
                    });
                }
            });
        }
        
        // Write back to file
        const yamlOutput = yaml.dump(data, {
            indent: 2,
            lineWidth: -1,
            noRefs: true,
            sortKeys: false
        });
        
        fs.writeFileSync(filePath, yamlOutput, 'utf8');
        
        console.log(`✅ ${filePath}: ${itemsInFile} items updated`);
        totalItemsProcessed += itemsInFile;
        filesProcessed++;
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
});

console.log('\n🎉 Shop price increase completed!');
console.log(`📁 Files processed: ${filesProcessed}`);
console.log(`📦 Total items updated: ${totalItemsProcessed}`);
console.log(`📈 Price increase: ${((PRICE_MULTIPLIER - 1) * 100).toFixed(0)}%`);
console.log('\n💡 Both buy and sell prices increased proportionally!');
console.log('💎 Example: Diamond buy 262 → 328, sell 65 → 81');
console.log('🔄 Server restart recommended to apply changes.');
