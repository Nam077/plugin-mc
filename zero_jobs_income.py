#!/usr/bin/env python3
"""
Script để đặt thu nhập Jobs về 0 (chỉ giữ lại points và experience)
Sử dụng: python3 zero_jobs_income.py
"""

import yaml
import os
import glob

def zero_job_income(file_path):
    """Đặt tất cả income = 0 trong file job"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f)
    
    if not data:
        return
    
    modified = False
    job_name = list(data.keys())[0]  # Tên job (Miner, Builder, etc.)
    job_data = data[job_name]
    
    # Đặt công thức income = 0
    if 'income-progression-equation' in job_data:
        job_data['income-progression-equation'] = '0'
        modified = True
    
    # Duyệt qua các action types (Break, Place, Kill, etc.)
    for action_type in ['Break', 'Place', 'Kill', 'Craft', 'Smelt', 'Repair', 'TNTBreak', 'Tame', 'Breed', 'Milk', 'Shear', 'Fish', 'Enchant', 'custom-kill']:
        if action_type in job_data:
            for item_name, item_data in job_data[action_type].items():
                if isinstance(item_data, dict) and 'income' in item_data:
                    item_data['income'] = 0
                    modified = True
    
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
        print(f"✅ Zeroed income: {os.path.basename(file_path)}")

def main():
    # Tìm tất cả file job
    jobs_dir = "/Users/dev/code/mc/plugin-mc/Jobs/jobs"
    job_files = glob.glob(os.path.join(jobs_dir, "*.yml"))
    
    # Loại bỏ file example và none
    job_files = [f for f in job_files if not any(x in os.path.basename(f).lower() for x in ['example', 'none'])]
    
    print(f"🚫 Setting all Jobs income to 0...")
    print(f"📁 Found {len(job_files)} job files")
    
    for job_file in job_files:
        zero_job_income(job_file)
    
    print(f"✅ Done! All Jobs now give 0 income (only points & experience)")
    print("💡 Players will need to use shop or other methods to earn money")

if __name__ == "__main__":
    main()
