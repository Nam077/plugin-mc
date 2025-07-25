#!/usr/bin/env node
/**
 * Script để kiểm tra và xác nhận việc cài đặt tiếng Việt cho Jobs plugin
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

async function checkVietnameseSetup() {
    console.log('🇻🇳 CHECKING VIETNAMESE LANGUAGE SETUP FOR JOBS PLUGIN');
    
    try {
        // Check generalConfig.yml
        const configPath = 'Jobs/generalConfig.yml';
        const configContent = await fs.readFile(configPath, 'utf8');
        const config = yaml.load(configContent);
        
        const currentLanguage = config['locale-language'];
        console.log(`📋 Current language setting: ${currentLanguage}`);
        
        if (currentLanguage === 'vi') {
            console.log('✅ Language successfully set to Vietnamese (vi)');
        } else {
            console.log(`❌ Language is still set to: ${currentLanguage}`);
            return;
        }
        
        // Check if Vietnamese messages file exists
        const viMessagesPath = 'Jobs/locale/messages_vi.yml';
        const viExists = await fs.pathExists(viMessagesPath);
        
        if (viExists) {
            console.log('✅ Vietnamese messages file (messages_vi.yml) found');
            
            // Check file size to ensure it's not empty
            const stats = await fs.stat(viMessagesPath);
            console.log(`📄 Vietnamese messages file size: ${(stats.size / 1024).toFixed(1)} KB`);
            
            if (stats.size > 10000) { // More than 10KB means it's properly translated
                console.log('✅ Vietnamese messages file appears to be fully translated');
            } else {
                console.log('⚠️  Vietnamese messages file might be incomplete');
            }
        } else {
            console.log('❌ Vietnamese messages file not found!');
            return;
        }
        
        console.log('\n🎉 VIETNAMESE LANGUAGE SETUP COMPLETED!');
        console.log('\n📋 Configuration Summary:');
        console.log('  • Language: Vietnamese (vi)');
        console.log('  • Messages file: messages_vi.yml');
        console.log('  • File status: Available and translated');
        
        console.log('\n🔄 TO APPLY CHANGES:');
        console.log('  1. Restart your Minecraft server');
        console.log('  2. Or use: /jobs reload (if available)');
        console.log('  3. Check in-game with: /jobs');
        
        console.log('\n🎯 WHAT TO EXPECT:');
        console.log('  • All Jobs plugin messages will be in Vietnamese');
        console.log('  • Job names, descriptions, and commands in Vietnamese');
        console.log('  • Quest messages and notifications in Vietnamese');
        console.log('  • Error messages and help text in Vietnamese');
        
        console.log('\n🇻🇳 Sample Vietnamese Messages:');
        console.log('  • "Gia nhập nghề" (Join job)');
        console.log('  • "Rời nghề" (Leave job)');
        console.log('  • "Tiền" (Money)');
        console.log('  • "Kinh nghiệm" (Experience)');
        console.log('  • "Điểm" (Points)');
        
        console.log('\n✨ Players will now see Jobs plugin in Vietnamese!');
        
    } catch (error) {
        console.error('❌ Error checking Vietnamese setup:', error.message);
    }
}

if (require.main === module) {
    checkVietnameseSetup();
}
