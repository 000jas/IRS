from flask import Flask, request, jsonify
import requests
import pickle
import pandas as pd
import os
from flask_cors import CORS  # For allowing frontend calls

app = Flask(__name__)
CORS(app)  # Enable CORS

# Load trained model
with open("irrigation_model.pkl", "rb") as f:
    clf = pickle.load(f)

WEATHER_API_KEY = "9a2e84ed355d6bed7c639dba9d1e8af3"  # Your OpenWeatherMap API key
LAT, LON = 21.1458, 79.0882
LOG_PATH = "irrigation_log.csv"

def get_rain_forecast():
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={WEATHER_API_KEY}&units=metric"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        rain_48h = sum([item.get('rain', {}).get('3h', 0) for item in data['list'][:16]])
        return rain_48h
    except Exception:
        return 0.0

def calculate_water_volume(soil_moisture, tank_level, rain_next_48h):
    deficit = max(0, 30 - soil_moisture)
    water_need = deficit * 2

    if rain_next_48h >= 10:
        water_need = 0
    elif rain_next_48h >= 5:
        water_need *= 0.5

    water_final = min(water_need, tank_level)
    return round(water_final, 2)

def log_request(inp, irrigate, rain_next_48h, water_litres):
    row = {
        "soil_moisture": inp.get("soil_moisture"),
        "soil_temp": inp.get("soil_temp"),
        "soil_ph": inp.get("soil_ph"),
        "tank_level": inp.get("tank_level"),
        "ambient_humidity": inp.get("ambient_humidity"),
        "ambient_temp": inp.get("ambient_temp"),
        "rain_next_48h": rain_next_48h,
        "irrigate": irrigate,
        "water_litres": water_litres,
        "timestamp": inp.get("timestamp")
    }
    df = pd.DataFrame([row])
    df.to_csv(LOG_PATH, mode='a', header=not os.path.exists(LOG_PATH), index=False)

def run_prediction(inp):
    rain_next_48h = get_rain_forecast()

    features_dict = {
        "soil_moisture": float(inp.get('soil_moisture', 0)),
        "soil_temp": float(inp.get('soil_temp', 0)),
        "soil_ph": float(inp.get('soil_ph', 7.0)),
        "tank_level": float(inp.get('tank_level', 0)),
        "ambient_humidity": float(inp.get('ambient_humidity', 0)),
        "ambient_temp": float(inp.get('ambient_temp', 0)),
        "rain_next_48h": float(rain_next_48h)
    }

    X = pd.DataFrame([features_dict])
    irrigate = int(clf.predict(X)[0])

    water_litres = 0.0
    if irrigate == 1:
        water_litres = calculate_water_volume(
            features_dict["soil_moisture"],
            features_dict["tank_level"],
            features_dict["rain_next_48h"]
        )

    log_request(inp, irrigate, rain_next_48h, water_litres)

    return {
        "irrigate": irrigate,
        "water_litres": water_litres,
        "rain_next_48h": rain_next_48h
    }

@app.route('/predict', methods=['POST'])
def predict():
    inp = request.json or {}
    return jsonify(run_prediction(inp))

@app.route('/sensor-data', methods=['POST'])
def sensor_data():
    inp = request.json or {}
    return jsonify(run_prediction(inp))

@app.route("/data", methods=['POST'])
def data():
    inp = request.json or {}
    return jsonify(run_prediction(inp))

@app.route("/", methods=["GET"])
def home():
    return "Irrigation Predictor API is live!"

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
