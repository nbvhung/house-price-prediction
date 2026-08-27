from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="House Price Prediction API")

# Load model và features
model = joblib.load(r'D:\phát triển ht thông minh\DATA\house-price-prediction\best_house_price_model.pkl')
features_list = joblib.load(r'D:\phát triển ht thông minh\DATA\house-price-prediction\model_features.pkl')

class HouseInput(BaseModel):
    area: float
    frontage: float = 4.0
    access_road: float = 3.0
    floors: float = 3.0
    bedrooms: float = 3.0
    bathrooms: float = 2.0

@app.post("/predict")
def predict_price(data: HouseInput):
    input_vector = np.zeros(len(features_list))
    mapping = {
        'Area': data.area,
        'Frontage': data.frontage,
        'Access Road': data.access_road,
        'Floors': data.floors,
        'Bedrooms': data.bedrooms,
        'Bathrooms': data.bathrooms
    }
    for feat_name, val in mapping.items():
        if feat_name in features_list:
            idx = features_list.index(feat_name)
            input_vector[idx] = val

    predicted_price = model.predict([input_vector])[0]
    return {
        "status": "success",
        "predicted_price_ty_vnd": round(float(predicted_price), 2),
        "message": f"Ước tính giá nhà: {round(float(predicted_price), 2)} Tỷ VNĐ"
    }
