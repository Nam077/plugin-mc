#!/usr/bin/env node
/**
 * Script để GIẢM giá vật phẩm hiếm xuống mức VỪA PHẢI
 * Vì giá hiện tại quá đắt (2+ năm farming là quá nhiều!)
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

// Divisor để giảm giá xuống mức hợp lý hơn
const REASONABLE_DIVISORS = {
    // Tier 1: Semi-rare (giảm 2x)
    'DIAMOND': 2,
    'EMERALD': 2, 
    'DIAMOND_BLOCK': 2,
    'EMERALD_BLOCK': 2,
    
    // Tier 2: Very rare (giảm 3x)
    'ANCIENT_DEBRIS': 3,
    'NETHERITE_SCRAP': 3,
    
    // Tier 3: Ultra rare (giảm 5x - từ 40x xuống 8x so với gốc)
    'NETHERITE_INGOT': 5,
    'NETHERITE_BLOCK': 5,
    
    // Netherite Tools/Armor (giảm 4x - từ 24x xuống 6x so với gốc)
    'NETHERITE_SWORD': 4,
    'NETHERITE_PICKAXE': 4,
    'NETHERITE_AXE': 4,
    'NETHERITE_SHOVEL': 4,
    'NETHERITE_HOE': 4,
    'NETHERITE_HELMET': 4,
    'NETHERITE_CHESTPLATE': 4,
    'NETHERITE_LEGGINGS': 4,
    'NETHERITE_BOOTS': 4,
    
    // Diamond Tools/Armor (giảm 2x)
    'DIAMOND_SWORD': 2,
    'DIAMOND_PICKAXE': 2,
    'DIAMOND_AXE': 2,
    'DIAMOND_SHOVEL': 2,
    'DIAMOND_HOE': 2,
    'DIAMOND_HELMET': 2,
    'DIAMOND_CHESTPLATE': 2,
    'DIAMOND_LEGGINGS': 2,
    'DIAMOND_BOOTS': 2,
    'DIAMOND_HORSE_ARMOR': 2
};

async function reasonablePricing(filePath) {
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
                
                const divisor = REASONABLE_DIVISORS[item.material];
                if (divisor) {
                    // Giảm giá buy
                    if (item.buy && item.buy > 0) {
                        const oldBuy = item.buy;
                        item.buy = Math.floor(item.buy / divisor);
                        console.log(`  💰 ${item.material}: ${oldBuy} → ${item.buy} coins (÷${divisor})`);
                    }
                    
                    // Giảm giá sell (nếu có và > 0)
                    if (item.sell && item.sell > 0) {
                        item.sell = Math.floor(item.sell / divisor);
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
            console.log(`✅ Reasonable pricing: ${path.basename(filePath)} (${itemsUpdated} rare items)`);
        }
        
        return itemsUpdated;
        
    } catch (error) {
        console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
        return 0;
    }
}

async function main() {
    console.log('💰 REASONABLE RARE ITEM PRICING - Making items balanced!');
    console.log('😅 Previous pricing was TOO EXTREME (2+ years farming is crazy!)');
    console.log('🎯 Target: Make rare items require weeks/months, not years!');
    
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
            const updated = await reasonablePricing(filePath);
            totalUpdated += updated;
        }
    }
    
    console.log('\n💰 REASONABLE RARE ITEM PRICING COMPLETED!');
    console.log(`📊 Updated ${totalUpdated} rare items with reasonable pricing`);
    
    console.log('\n🎯 NEW REASONABLE RARE ITEM PRICES:');
    console.log('  💎 Diamond: ~262 coins (was 525)');
    console.log('  🏺 Ancient Debris: ~4,232 coins (was 12,696)');
    console.log('  🛡️ Netherite Ingot: ~18,940 coins (was 94,700)');
    console.log('  ⚔️ Netherite Sword: ~15,614 coins (was 62,456)');
    console.log('  🏗️ Netherite Block: ~178,992 coins (was 894,960)');
    
    console.log('\n🌾 NEW REASONABLE FARMER ECONOMICS:');
    console.log('  • To buy 1 Diamond (262 coins): Farm 72 crops (0.65x Crop Master quest)');
    console.log('  • To buy 1 Ancient Debris: Farm 1,167 crops (10.6x Crop Master quest)');
    console.log('  • To buy 1 Netherite Ingot: Farm 5,222 crops (47x Crop Master quest)');
    
    console.log('\n⏳ REASONABLE TIME INVESTMENT:');
    console.log('  🥕 1 Diamond = Few hours of farming');
    console.log('  🏺 1 Ancient Debris = 1-2 weeks of daily farming');
    console.log('  🛡️ 1 Netherite Ingot = 1-2 months of daily farming');
    console.log('  ⚔️ Full Netherite Set = 3-6 months of farming');
    
    console.log('\n🎉 NOW PRICES ARE BALANCED AND REASONABLE! ✨');
    console.log('💪 Still challenging but not impossible!');
    console.log('🏆 Players can achieve endgame gear in months, not years!');
}

if (require.main === module) {
    main();
}

module.exports = { reasonablePricing };
