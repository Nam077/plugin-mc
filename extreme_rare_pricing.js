#!/usr/bin/env node
/**
 * Script để tăng giá vật phẩm hiếm NHIỀU HỚN NỮA
 * Để làm chúng thực sự khó kiếm và cần nhiều thời gian
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// EXTREME Multiplier để làm rare items THỰC SỰ HIẾM
const EXTREME_RARE_MULTIPLIERS = {
    // Tier 1: Semi-rare (x5 - tổng x10 so với ban đầu)
    'DIAMOND': 5,
    'EMERALD': 5, 
    'DIAMOND_BLOCK': 5,
    'EMERALD_BLOCK': 5,
    
    // Tier 2: Very rare (x8 - tổng x24 so với ban đầu)
    'ANCIENT_DEBRIS': 8,
    'NETHERITE_SCRAP': 8,
    
    // Tier 3: Ultra rare (x10 - tổng x40 so với ban đầu)
    'NETHERITE_INGOT': 10,
    'NETHERITE_BLOCK': 10,
    
    // Netherite Tools/Armor (x8 - tổng x24 so với ban đầu)
    'NETHERITE_SWORD': 8,
    'NETHERITE_PICKAXE': 8,
    'NETHERITE_AXE': 8,
    'NETHERITE_SHOVEL': 8,
    'NETHERITE_HOE': 8,
    'NETHERITE_HELMET': 8,
    'NETHERITE_CHESTPLATE': 8,
    'NETHERITE_LEGGINGS': 8,
    'NETHERITE_BOOTS': 8,
    
    // Diamond Tools/Armor (x4 - tổng x8 so với ban đầu) 
    'DIAMOND_SWORD': 4,
    'DIAMOND_PICKAXE': 4,
    'DIAMOND_AXE': 4,
    'DIAMOND_SHOVEL': 4,
    'DIAMOND_HOE': 4,
    'DIAMOND_HELMET': 4,
    'DIAMOND_CHESTPLATE': 4,
    'DIAMOND_LEGGINGS': 4,
    'DIAMOND_BOOTS': 4,
    'DIAMOND_HORSE_ARMOR': 4
};

async function extremeRarePricing(filePath) {
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
                
                const multiplier = EXTREME_RARE_MULTIPLIERS[item.material];
                if (multiplier) {
                    // Tăng giá buy
                    if (item.buy && item.buy > 0) {
                        const oldBuy = item.buy;
                        item.buy = Math.floor(item.buy * multiplier);
                        console.log(`  🔥 ${item.material}: ${oldBuy} → ${item.buy} coins (x${multiplier})`);
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
            console.log(`✅ EXTREME Updated: ${path.basename(filePath)} (${itemsUpdated} rare items)`);
        }
        
        return itemsUpdated;
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return 0;
    }
}

async function main() {
    console.log('🔥 EXTREME RARE ITEM PRICING - MAKING ITEMS TRULY UNOBTAINABLE!');
    console.log('💀 Based on Farmer analysis: 29 crops = 1 Diamond is TOO EASY!');
    console.log('🎯 Target: Make rare items require WEEKS of farming');
    
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
            console.log(`\n📁 EXTREME Processing ${shopFile}...`);
            const updated = await extremeRarePricing(filePath);
            totalUpdated += updated;
        }
    }
    
    console.log('\n🔥 EXTREME RARE ITEM PRICING COMPLETED!');
    console.log(`📊 Updated ${totalUpdated} rare items with EXTREME pricing`);
    
    console.log('\n💀 NEW EXTREME RARE ITEM PRICES:');
    console.log('  💎 Diamond: ~525 coins (was 105, original 52.5)');
    console.log('  🏺 Ancient Debris: ~12,696 coins (was 1,587, original 529)');
    console.log('  🛡️ Netherite Ingot: ~94,700 coins (was 9,470, original 2,367)');
    console.log('  ⚔️ Netherite Sword: ~62,456 coins (was 7,807)');
    console.log('  🏗️ Netherite Block: ~894,960 coins (was 89,496)');
    
    console.log('\n🌾 NEW FARMER ECONOMICS:');
    console.log('  • To buy 1 Diamond (525 coins): Farm 145 crops (1.3x Crop Master quest)');
    console.log('  • To buy 1 Ancient Debris: Farm 3,500+ crops (31x Crop Master quest)');
    console.log('  • To buy 1 Netherite Ingot: Farm 26,000+ crops (232x Crop Master quest!)');
    
    console.log('\n⏳ TIME INVESTMENT:');
    console.log('  🥕 1 Diamond = 1-2 days of intensive farming');
    console.log('  🏺 1 Ancient Debris = 1+ month of daily farming');
    console.log('  🛡️ 1 Netherite Ingot = 6+ months of daily farming');
    console.log('  ⚔️ Full Netherite Set = 2+ YEARS of farming');
    
    console.log('\n🎉 NOW RARE ITEMS ARE **ACTUALLY** RARE! 🔥');
    console.log('💀 Players will need to dedicate months/years for endgame gear!');
    console.log('🏆 This creates true long-term server economy and goals!');
}

if (require.main === module) {
    main();
}

module.exports = { extremeRarePricing };
