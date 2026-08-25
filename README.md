# 🏠 Hệ Dự đoán Giá nhà

Hệ thống Machine Learning ước tính giá nhà đất (tỷ VNĐ) từ 6 thông số bất động sản. Mô hình **RandomForestRegressor** (best model sau khi so sánh nhiều thuật toán), triển khai đầy đủ dạng **Web**, **API** và **App Mobile (Android)**.

**Link deployed (Render):** https://house-price-prediction-gng3.onrender.com

## Kiến trúc

```
[Web HTML]  [App React Native]
      \        /
       fetch POST /predict (JSON)
            |
        [FastAPI api.py]
            |
   [RandomForestRegressor]
   (best_house_price_model.pkl + model_features.pkl)
```

## Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Machine Learning | scikit-learn 1.7.2 (RandomForest Regressor) |
| Backend API | Python 3.11, FastAPI, Uvicorn |
| Web | HTML/CSS/JS (do FastAPI serve trực tiếp) |
| Mobile | React Native — Expo SDK 54 |
| Deploy | Render (Docker-free, auto deploy từ GitHub) |

## Cấu trúc thư mục

```
.
├── api.py                       # FastAPI: serve web + API POST /predict
├── web.html                     # Giao diện web (responsive)
├── best_house_price_model.pkl   # Model RandomForest tốt nhất đã train
├── model_features.pkl           # Danh sách feature theo đúng thứ tự train
├── gianha.csv                   # Dataset giá nhà (~3.5MB)
├── HousePrice.ipynb             # Notebook: EDA, biểu đồ, train, so sánh mô hình
├── requirements.txt             # Dependencies (pin đúng phiên bản lúc train)
└── mobile/                      # App Android (React Native + Expo)
    ├── App.js                   # Form nhập 6 thông số + gọi API + hiện giá
    ├── api.js                   # ⚙️ URL của server (đổi tại đây khi cần)
    ├── components/Field.js
    ├── START_EXPO.bat           # Nhấp đúp để chạy server Expo (Windows)
    └── app.json
```

## Chạy local — Backend + Web (Anaconda Prompt)

```bat
conda create -n house-ml python=3.11 -y
conda activate house-ml
cd /d "duong-dan-den-thu-muc-house-price-prediction"
pip install -r requirements.txt
python -m uvicorn api:app --reload --port 8001
```

- Web UI: http://127.0.0.1:8001
- Tài liệu API tự động (Swagger): http://127.0.0.1:8001/docs

## Chạy local — Notebook

```bat
conda activate house-ml
jupyter notebook HousePrice.ipynb
```

## Chạy local — App Mobile

Yêu cầu: Node.js ≥ 20, app **Expo Go** (bản hỗ trợ **SDK 54**) trên Android.

```bat
cd mobile
npm install
npx expo start --tunnel
```

- Quét mã QR bằng app Expo Go (tunnel chạy được kể cả khác Wi-Fi)
- Cùng Wi-Fi có thể bỏ `--tunnel`
- Windows: nhấp đúp `START_EXPO.bat`
- Đổi địa chỉ server: sửa `mobile/api.js`

## API

`POST /predict`

```json
// Request
{
  "area": 80, "frontage": 4, "access_road": 3,
  "floors": 3, "bedrooms": 3, "bathrooms": 2
}

// Response
{
  "status": "success",
  "predicted_price_ty_vnd": 4.54,
  "message": "Ước tính giá nhà: 4.54 Tỷ VNĐ"
}
```

## Deploy lên Render

| Cấu hình | Giá trị |
|---|---|
| Runtime | Python 3 |
| Build command | `pip install -r requirements.txt` |
| Start command | `uvicorn api:app --host 0.0.0.0 --port $PORT` |
| Environment | `PYTHON_VERSION=3.11.9` |
| Instance | Free |

> ⚠️ Gói Free tự ngủ sau ~15 phút không dùng — request đầu tiên mất ~1 phút để server thức dậy.

## Build APK (EAS Build)

```bat
cd mobile
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

File `.apk` tải về cài trực tiếp trên Android, không cần Expo Go.
