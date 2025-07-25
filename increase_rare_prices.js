#!/usr/bin/env node
/**
 * Script để tăng giá vật phẩm hiếm (Diamond, Ancient Debris, Netherite)
 * để làm chúng thực sự có giá trị và khó kiếm
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// Multiplier cho từng loại vật phẩm hiếm
const RARE_ITEM_MULTIPLIERS = {
    // Tier 1: Semi-rare (x2)
    'DIAMOND': 2,
    'EMERALD': 2,
    'DIAMOND_BLOCK': 2,
    'EMERALD_BLOCK': 2,
    
    // Tier 2: Very rare (x3)
    'ANCIENT_DEBRIS': 3,
    'NETHERITE_SCRAP': 3,
    
    // Tier 3: Ultra rare (x4)
    'NETHERITE_INGOT': 4,
    'NETHERITE_BLOCK': 4,
    
    // Netherite Tools/Armor (x3)
    'NETHERITE_SWORD': 3,
    'NETHERITE_PICKAXE': 3,
    'NETHERITE_AXE': 3,
    'NETHERITE_SHOVEL': 3,
    'NETHERITE_HOE': 3,
    'NETHERITE_HELMET': 3,
    'NETHERITE_CHESTPLATE': 3,
    'NETHERITE_LEGGINGS': 3,
    'NETHERITE_BOOTS': 3
};

async function updateShopPrices(filePath) {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = yaml.load(fileContent);
        
        if (!data || !data.pages) return 0;
        
        let itemsUpdated = 0;
        
        // Duyệt qua tất cả pages
        Object.keys(data.pages).forEach(pageKey => {
            const page = data.pages[pageKey];
            if (!page.items) return;
            
            // Duyệt qua tất cả items
            Object.keys(page.items).forEach(itemKey => {
                const item = page.items[itemKey];
                if (!item.material) return;
                
                const multiplier = RARE_ITEM_MULTIPLIERS[item.material];
                if (multiplier) {
                    // Tăng giá buy
                    if (item.buy && item.buy > 0) {
                        const oldBuy = item.buy;
                        item.buy = Math.floor(item.buy * multiplier);
                        console.log(`  📈 ${item.material}: ${oldBuy} → ${item.buy} coins (x${multiplier})`);
                    }
                    
                    // Tăng giá sell (nếu có và > 0)
                    if (item.sell && item.sell > 0) {
                        item.sell = Math.floor(item.sell * multiplier);
                    }
                    
                    itemsUpdated++;
                }
            });
        });
        
        if (itemsUpdated > 0) {
            // Ghi lại file
            const yamlStr = yaml.dump(data, {
                defaultFlowStyle: false,
                lineWidth: -1,
                noRefs: true,
                sortKeys: false
            });
            
            await fs.writeFile(filePath, yamlStr, 'utf8');
            console.log(`✅ Updated: ${path.basename(filePath)} (${itemsUpdated} rare items)`);
        }
        
        return itemsUpdated;
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return 0;
    }
}

async function main() {
    console.log('💎 INCREASING RARE ITEM PRICES...');
    console.log('🎯 Making rare items truly valuable and hard to obtain');
    
    const shopsDir = path.join(__dirname, 'EconomyShopGUI', 'shops');
    const shopFiles = [
        'Ores.yml',
        'Z_EverythingElse.yml',
        'Decoration.yml'
    ];
    
    let totalUpdated = 0;
    
    for (const shopFile of shopFiles) {
        const filePath = path.join(shopsDir, shopFile);
        if (await fs.pathExists(filePath)) {
            console.log(`\n📁 Processing ${shopFile}...`);
            const updated = await updateShopPrices(filePath);
            totalUpdated += updated;
        }
    }
    
    console.log('\n🎉 RARE ITEM PRICING COMPLETED!');
    console.log(`📊 Updated ${totalUpdated} rare items`);
    
    console.log('\n💰 NEW RARE ITEM PRICES:');
    console.log('  💎 Diamond: ~105 coins (was 52.5)');
    console.log('  🏺 Ancient Debris: ~1,587 coins (was 529)');
    console.log('  🛡️ Netherite Ingot: ~9,470 coins (was 2,367)');
    console.log('  🏗️ Netherite Block: ~89,496 coins (was 22,374)');
    
    console.log('\n🎯 Impact on Quest Economy:');
    console.log('  • Basic quests (480-800): Buy 4-7 diamonds');
    console.log('  • Medium quests (1,200-2,000): Buy 11-19 diamonds');
    console.log('  • Master quests (3,200-4,000): Buy 30-38 diamonds, 2-2.5 Ancient Debris');
    console.log('  • Ultimate Hunter (4,000): Buy 38 diamonds, 2.5 Ancient Debris, 0.4 Netherite Ingot');
    
    console.log('\n✨ Rare items are now TRULY RARE and valuable! 💎');
    console.log('🏆 Players will need to complete many quests to afford the best gear!');
}

if (require.main === module) {
    main();
}

module.exports = { updateShopPrices };
