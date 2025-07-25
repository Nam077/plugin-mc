# Jobs Income Manager

Scripts Node.js để quản lý kinh tế server Minecraft với Jobs và EconomyShopGUI.

## 📦 Cài đặt

```bash
cd /Users/dev/code/mc/plugin-mc
npm install
```

## 🚫 Tắt thu nhập Jobs (Đặt income = 0)

```bash
# Chạy trực tiếp
node zero_jobs_income.js

# Hoặc dùng npm script
npm run zero-income
```

**Tác dụng:**
- Đặt tất cả `income: 0` trong tất cả job files
- Đặt `income-progression-equation: 0`
- Giữ nguyên `points` và `experience`
- Player chỉ level up job nhưng không kiếm được tiền

## 📈 Tăng giá Shop

```bash
# Tăng giá x5 lần
node increase_shop_prices.js 5

# Tăng giá x10 lần
node increase_shop_prices.js 10

# Hoặc dùng npm script
npm run increase-shop 5
```

**Tác dụng:**
- Tăng giá `buy` và `sell` của tất cả items
- Không tăng giá âm (sell: -1)
- Làm tròn 2 chữ số thập phân

## 🎯 Khuyến nghị sử dụng

### Scenario 1: Tắt hoàn toàn Jobs income
```bash
npm run zero-income
```
→ Player chỉ kiếm tiền từ shop, quest, vote

### Scenario 2: Cân bằng Jobs vs Shop
```bash
npm run increase-shop 8
```
→ Tăng giá shop x8 để cân bằng với Jobs income

### Scenario 3: Kết hợp cả hai
```bash
npm run zero-income
npm run increase-shop 3
```
→ Jobs không cho tiền + shop đắt hơn → kinh tế khó khăn hơn

## 📁 Files được xử lý

**Jobs:**
- `Jobs/jobs/*.yml` (trừ example và none)
- Tất cả action types: Break, Place, Kill, Craft, etc.

**Shop:**
- `EconomyShopGUI/shops/*.yml`
- Tất cả pages và items

## ⚠️ Lưu ý

- **Backup** files trước khi chạy script
- **Restart server** sau khi chạy để áp dụng changes
- Script sẽ làm tròn giá đến 2 chữ số thập phân
- Script bỏ qua giá bán âm (sell: -1)

## 🔧 Troubleshooting

Nếu gặp lỗi "Module not found":
```bash
npm install js-yaml fs-extra glob
```

Nếu không tìm thấy files:
- Kiểm tra đường dẫn trong script
- Đảm bảo structure folder đúng

## 📊 Ví dụ kết quả

**Trước:**
```yaml
diamond:
  buy: 52.5
  sell: 13.13
```

**Sau khi chạy `increase-shop 5`:**
```yaml
diamond:
  buy: 262.5
  sell: 65.65
```
