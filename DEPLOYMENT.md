# Hướng dẫn Deploy lên Vercel

## Cách 1: Deploy qua Vercel CLI (Khuyến nghị)

### Bước 1: Cài đặt Vercel CLI
```bash
npm i -g vercel
```

### Bước 2: Đăng nhập Vercel
```bash
vercel login
```

### Bước 3: Deploy
```bash
# Deploy lần đầu (sẽ hỏi một số câu hỏi)
vercel

# Deploy production
vercel --prod
```

## Cách 2: Deploy qua GitHub (Tự động)

### Bước 1: Push code lên GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Bước 2: Kết nối với Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub
3. Click "Add New Project"
4. Chọn repository `VMPharmacy`
5. Click "Import"

### Bước 3: Cấu hình Environment Variables
Trong màn hình cấu hình project, thêm các biến môi trường:

- **NEXT_PUBLIC_SUPABASE_URL**: URL của Supabase project
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Anon key của Supabase project

### Bước 4: Deploy
Click "Deploy" và chờ quá trình build hoàn tất.

## Lưu ý quan trọng

1. **Environment Variables**: Đảm bảo đã thêm đầy đủ biến môi trường trong Vercel Dashboard:
   - Settings → Environment Variables
   - Thêm cho cả Production, Preview, và Development

2. **Supabase Database**: Đảm bảo đã chạy `supabase_schema.sql` trong Supabase SQL Editor

3. **Build Settings**: Vercel sẽ tự động nhận diện Next.js và sử dụng cấu hình trong `vercel.json`

4. **PWA**: Service Worker sẽ được tự động tạo trong quá trình build

## Kiểm tra sau khi deploy

1. Truy cập URL được cung cấp bởi Vercel
2. Kiểm tra console để đảm bảo không có lỗi
3. Test các chức năng:
   - Đăng nhập/Đăng ký
   - Tạo đơn hàng
   - Upload ảnh
   - PWA installation

## Troubleshooting

### Lỗi build
- Kiểm tra logs trong Vercel Dashboard
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra environment variables đã được set đúng

### Lỗi Supabase connection
- Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Đảm bảo Supabase project đang hoạt động
- Kiểm tra Row Level Security policies trong Supabase

### PWA không hoạt động
- Kiểm tra service worker đã được register
- Đảm bảo HTTPS được bật (Vercel tự động cung cấp)
