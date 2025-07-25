#!/usr/bin/env python3
"""
Script để tăng giá tất cả items trong EconomyShopGUI
Sử dụng: python3 increase_shop_prices.py <multiplier>
Ví dụ: python3 increase_shop_prices.py 5  # Tăng giá x5 lần
"""

import yaml
import os
import sys
import glob

def increase_prices(file_path, multiplier):
    """Tăng giá buy/sell trong file YAML"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    if not data or 'pages' not in data:
        return
    
    modified = False
    for page_name, page_data in data['pages'].items():
        if 'items' in page_data:
            for item_id, item_data in page_data['items'].items():
                # Tăng giá mua
                if 'buy' in item_data:
                    old_buy = item_data['buy']
                    item_data['buy'] = round(old_buy * multiplier, 2)
                    modified = True
                
                # Tăng giá bán
                if 'sell' in item_data:
                    old_sell = item_data['sell']
                    if old_sell > 0:  # Không tăng giá âm
                        item_data['sell'] = round(old_sell * multiplier, 2)
                        modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
        print(f"✅ Updated: {file_path}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 increase_shop_prices.py <multiplier>")
        print("Example: python3 increase_shop_prices.py 5")
        sys.exit(1)
    
    try:
        multiplier = float(sys.argv[1])
    except ValueError:
        print("❌ Multiplier must be a number!")
        sys.exit(1)
    
    if multiplier <= 0:
        print("❌ Multiplier must be positive!")
        sys.exit(1)
    
    # Tìm tất cả file shop
    shop_dir = "/Users/dev/code/mc/plugin-mc/EconomyShopGUI/shops"
    shop_files = glob.glob(os.path.join(shop_dir, "*.yml"))
    
    print(f"🔧 Increasing shop prices by {multiplier}x...")
    print(f"📁 Found {len(shop_files)} shop files")
    
    for shop_file in shop_files:
        increase_prices(shop_file, multiplier)
    
    print(f"✅ Done! All shop prices increased by {multiplier}x")

if __name__ == "__main__":
    main()
