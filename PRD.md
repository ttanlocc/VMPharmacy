# PRD – Pharmacy Fast Order

## Problem
Dược sĩ bán lẻ phải nhớ tên thuốc → dễ nhầm, mất thời gian, thiếu chuẩn hoá.

## Solution
Hệ thống đơn thuốc mẫu **visual-first** – nhìn ảnh là nhớ, chọn là bán.

## Target Users
Dược sĩ nhà thuốc bán lẻ

## Success Metrics
| Metric | Target |
|--------|--------|
| Thời gian tạo đơn | < 20s |
| Đơn từ template | ≥ 70% |
| Lỗi chọn nhầm | Giảm đáng kể |

## Core Features

### 1. Drug Management
- Tên, đơn vị, giá, **ảnh (bắt buộc)**
- Nhóm thuốc (Kháng sinh, Giảm đau...)

### 2. Prescription Templates
- Tạo/sửa/xoá đơn mẫu
- Mỗi đơn: tên + danh sách thuốc + liều + ghi chú

### 3. Quick Checkout
- Swipe left: xoá thuốc
- Swipe right: sửa liều/số lượng
- Thêm thuốc không rời màn hình
- Tổng tiền tự động

## Non-Goals (MVP)
- ❌ OCR / AI gợi ý
- ❌ Chẩn đoán
- ❌ Quản lý tồn kho

## User Flow
```
Chọn đơn mẫu → Xem ảnh thuốc → Swipe chỉnh sửa → Tính tiền → Xong
```
