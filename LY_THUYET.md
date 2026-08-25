# PHẦN 1 — LÝ THUYẾT: HỆ DỰ ĐOÁN GIÁ NHÀ

> Bài này là **Phần 1 — Lý thuyết** của Assignment 01 cho hệ giá nhà, theo khung Slide 01: *Understand → Represent → Learn → Experiment → Apply*. Hệ thống được mô tả như một **hệ thông minh thu nhỏ**.

## 1. Định nghĩa hệ thông minh

**Bài toán thực tế:** Ước tính giá bán (tỷ VNĐ) của một ngôi nhà tại Việt Nam từ 6 đặc điểm cấu trúc, hỗ trợ người mua/bán và môi giới định giá nhanh.

```
Môi trường (thị trường BĐS) → Đầu vào (6 đặc điểm) → Biểu diễn (vector x) → Mô hình học (fθ) → Quyết định (ŷ∈R) → Ứng dụng (web/mobile)
```

**Đoạn mô tả bắt buộc:**
> Hệ thống dự đoán giá nhà là một hệ thống học có giám sát dạng **hồi quy**. Hệ thống tiếp nhận 6 đặc trưng định lượng của một ngôi nhà, biểu diễn thành vector `x ∈ R⁶`, học hàm `ŷ = fθ(x)` từ tập vietnam_housing_dataset (gianha.csv), và đưa ra giá trị liên tục `ŷ ∈ R` (tỷ VNĐ) sao cho sai số so với giá thực tế là nhỏ nhất, phục vụ quyết định niêm yết và thương lượng.

**Sơ đồ hệ thống:**
```
[Nhà: Area 80m², Frontage 4m, 3 tầng, 3PN...] → [ x=[80,4,3,3,3,2] ] → [RandomForest/Linear/Tree/GBM] → [ŷ=4.54 tỷ]
```

## 2. Nguồn và mô tả dữ liệu

- **Nguồn:** `gianha.csv` — trích từ vietnam_housing_dataset, ~30.229 quan sát.
- **Một quan sát:** một tin rao/bất động sản.
- **Đặc trưng sử dụng (d=6, đều Numerical sau tiền xử lý):**

| # | Tên gốc | Ý nghĩa | Kiểu |
|---|---------|---------|------|
| 1 | Area | Diện tích (m²) | thực |
| 2 | Frontage | Mặt tiền (m) | thực |
| 3 | Access Road | Độ rộng đường vào (m) | thực |
| 4 | Floors | Số tầng | số nguyên |
| 5 | Bedrooms | Số phòng ngủ | số nguyên |
| 6 | Bathrooms | Số WC | số nguyên |

Các cột khác (Address, House direction, Legal status, ...) được loại khi chọn biểu diễn 6 chiều cốt lõi để giữ mô hình đơn giản và tránh nhiễu.

- **Target:** `Price` — giá nhà (tỷ VNĐ). **Numerical, liên tục → bài toán hồi quy.**
- **Quy mô:** N≈30k, d=6, target y∈R.
- **Tiền xử lý:** Loại dòng thiếu Price, điền khuyết median cho số, loại ngoại lệ diện tích/giá vô lý (ví dụ Area>1000m²), chuẩn hóa khi cần cho KNN/Ridge.

**8 câu hỏi dataset:**
1. Hiện tượng: giá nhà. 2. Một quan sát: một ngôi nhà. 3. Features: 6 đặc trưng trên. 4. Target: Price. 5. Numerical. 6. Regression. 7. N≈30k. 8. d=6. 9. Tất cả numerical. 10. Không có categorical trong biểu diễn đã chọn (nếu giữ hướng nhà thì phải encode).

## 3. Biểu diễn dữ liệu

```
xᵢ = [Area, Frontage, Access Road, Floors, Bedrooms, Bathrooms] ∈ R⁶
D = {(xᵢ, yᵢ)}ᴺᵢ₌₁ ,  X ∈ Rᴺˣ⁶
```

Bảng biểu diễn:

| Feature | Type | Representation | Meaning |
|---------|------|----------------|---------|
| Area | Numerical | real value | Diện tích sử dụng |
| Bedrooms | Numerical | integer | Số phòng ngủ |
| ... | ... | ... | ... |
| Price | Numerical | real value | Giá mục tiêu |

**Raw ≠ encoded ≠ model input:** Giá trị thô sau khi loại ngoại lệ và chuẩn hóa mới là input.

## 4. Phát biểu bài toán học

```
D = {(xᵢ, yᵢ)}ᴺᵢ₌₁ ,  ŷ = fθ(x) ,  θ* = argmin_θ (1/N) Σ ℓ(fθ(xᵢ), yᵢ)
```

- Loss hồi quy: MSE, MAE.
- **Câu một-sentence (bắt buộc):**
> *Cho vector 6 đặc trưng đã tiền xử lý của một ngôi nhà chưa từng thấy, hãy dự đoán giá trị liên tục ŷ ∈ R (tỷ VNĐ).*

**Phân loại vs hồi quy:** Hồi quy vì target liên tục; nếu phân loại “đắt/rẻ” thì là phân loại.

## 5. Chia Train/Test và Baseline

```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)
```

Test set không dùng để train.

**Baseline (R6):**

```python
from sklearn.dummy import DummyRegressor
baseline = DummyRegressor(strategy="mean")
baseline.fit(X_train, y_train)  # luôn đoán giá trung bình
```

Baseline cho MAE ≈1.8 tỷ, R²≈0. Mọi mô hình học được phải vượt qua.

## 6. Bốn mô hình truyền thống

| Mô hình | Công thức | Tham số | Tiêu chí | Giả định | Mạnh | Yếu |
|---------|-----------|---------|----------|----------|------|-----|
| **Linear Regression** | ŷ=w₀+w₁x₁+...+w₆x₆ | w,b | Min Σ(y−ŷ)² (OLS) | Quan hệ tuyến tính | Đơn giản, giải thích được hệ số | Underfit nếu quan hệ phi tuyến |
| **Decision Tree Regressor** | Chia không gian đệ quy theo ngưỡng | Cây, ngưỡng split | Giảm MSE tại mỗi split | Dữ liệu phân tách được bằng ngưỡng | Bắt được phi tuyến, không cần scale | Dễ overfit sâu |
| **Random Forest Regressor** | ŷ=(1/B)Σ T_b(x) | B cây, depth | Bagging + random feature | Tổ hợp nhiều cây giảm phương sai | Phi tuyến tốt, chống nhiễu | Nặng, kém giải thích |
| **Gradient Boosting / XGBoost** | Cộng dồn cây sửa sai số | B cây, learning rate | Gradient descent trên residual | Cây yếu kết hợp thành mạnh | Thường R² cao nhất | Nhạy hyperparam, chậm hơn |

*Notebook thực tế so sánh Linear, Ridge, Decision Tree, Random Forest, Gradient Boosting — chọn RandomForest làm best để deploy.*

## 7. Ba thí nghiệm có kiểm soát (R8)

**TN1 — So sánh mô hình (cùng split, cùng metric):**
| Model | MAE (tỷ) | RMSE | R² |
|-------|----------|------|----|
| Linear | — | — | — |
| Decision Tree | — | — | — |
| Random Forest | — | — | — |
| Gradient Boosting | — | — | — |
*Điền số từ notebook. Nhận xét: mô hình cây (ensemble) vượt trội tuyến tính; R²≈0.33 nghĩa là 6 feature chỉ giải thích ~33% biến thiên giá.*

**TN2 — Điều tra siêu tham số:**
*“Tăng max_depth của Decision Tree từ 4 → 20 hay n_estimators của Random Forest từ 50 → 300 có cải thiện R² trên tập test không? Khi nào thì overfit?”* — Vẽ đường cong R² theo tham số.

**TN3 — Điều tra biểu diễn:**
*“Dùng X_all (12 cột) vs X_selected (6 cột) hay StandardScaler vs không scaler có thay đổi MAE của KNN/Ridge không?”* — Giải thích: Area (~100) át Floors (~3) nếu không chuẩn hóa.

## 8. Đánh giá

Với hồi quy phải báo cáo:

```
MAE  = (1/N)Σ|y−ŷ|            — sai số tuyệt đối trung bình (tỷ)
MSE  = (1/N)Σ(y−ŷ)²
RMSE = √MSE
R² = 1 − Σ(y−ŷ)²/Σ(y−ȳ)²      — tỉ lệ biến thiên giải thích được
MAPE = (1/N)Σ|y−ŷ|/y *100%
```

*Giải thích chọn metric:* MAE/RMSE cho biết lệch trung bình bao nhiêu tỷ; R² cho biết mô hình giải thích được bao nhiêu % biến động giá; MAPE dễ diễn giải phần trăm.

## 9. Từ mô hình sang ứng dụng thông minh

```
Input (form) → Vector x (6 chiều) → model.predict([x]) → ŷ (tỷ) → Hiển thị
```

```python
def predict_price(model, features_list, sample_dict):
    v = np.zeros(len(features_list))
    for k,val in sample_dict.items():
        if k in features_list: v[features_list.index(k)] = val
    return float(model.predict([v])[0])
```

Ứng dụng FastAPI `api.py` + `web.html` + `mobile/App.js` thể hiện pipeline trên, demo ít nhất 3 căn: nhỏ (30m²), trung bình (80m²), lớn (200m²).

## 10. Suy ngẫm bắt buộc (R13)

1. Nhận gì? 6 đặc điểm nhà.
2. Biểu diễn? Vector R⁶.
3. Học gì? Quan hệ thống kê giữa đặc điểm và giá.
4. Dự đoán gì? Giá liên tục.
5. Vì sao xử lý được nhà chưa thấy? Học được hàm tổng quát, không ghi nhớ từng căn.
6. Phần nào “thông minh”? Khái quát hóa và ước lượng có cơ sở sai số, vượt baseline.
7. Hạn chế? Chỉ 6 số, mất vị trí chi tiết, pháp lý, nội thất, biến động thị trường; không nhân quả.
8. Mô hình ≠ hệ thống: hệ thống còn cần nhập liệu, biểu diễn, API, giao diện.

**Suy ngẫm về biểu diễn:**
- Phù hợp vì dữ liệu có cấu trúc, vector đủ cho ML truyền thống.
- Giữ lại số học, mất thông tin quan hệ (đồ thị đường phố), văn bản mô tả, ảnh nhà.
- Có thể biểu diễn dạng ảnh (mặt tiền), chuỗi (lịch sử giá), đồ thị (mạng lưới giao thông), embedding (mô tả văn bản) — mỗi dạng sẽ cần CNN/RNN/GNN khác.

## 11. Vị trí trong lịch sử AI

```
Symbols → Feature vector + Statistical ML (hệ này) → Tensor + Deep Learning → Embedding → Agentic
```

Hệ này thuộc giai đoạn Feature Engineering + Traditional ML.

---
**Ghi chú dán Word:** Mỗi biểu đồ (histogram Price, histogram Area, countplot Bedrooms) phải có đoạn giải thích ngay dưới ảnh. Link deployed dán ở bìa và mục Ứng dụng.
