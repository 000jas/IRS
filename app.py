from flask import Flask, request, jsonify
import requests
import pickle
import pandas as pd
import os
import psycopg2
from dotenv import load_dotenv

# ✅ NEW: Allow frontend (React, Angular, etc.) to call API
from flask_cors import CORS  

load_dotenv()

app = Flask(__name__)
CORS(app)  # ✅ Added CORS

# Load trained model
with open("irrigation_model.pkl", "rb") as f:
    clf = pickle.load(f)

WEATHER_API_KEY = "9a2e84ed355d6bed7c639dba9d1e8af3"  # Your OpenWeatherMap API key
LAT, LON = 21.1458 ,79.0882
LOG_PATH = "irrigation_log.csv"


DATABASE_URL = os.getenv('DATABASE_URL')

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def get_rain_forecast():
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={WEATHER_API_KEY}&units=metric"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        # Sum rain for next 48h (16 * 3h = 48h)
        rain_48h = sum([item.get('rain', {}).get('3h', 0) for item in data['list'][:16]])
        return rain_48h
    except Exception:
        return 0.0  # fallback if API fails

def calculate_water_volume(soil_moisture, tank_level, rain_next_48h):
    # 1. Soil moisture deficit (target ~30%)
    deficit = max(0, 30 - soil_moisture)

    # 2. Base water requirement (scaling factor = 2 L per % deficit)
    water_need = deficit * 2  

    # 3. Adjust based on rainfall forecast
    if rain_next_48h >= 10:
        water_need = 0
    elif rain_next_48h >= 5:
        water_need *= 0.5

    # 4. Limit by tank availability
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

# Core prediction logic
# def run_prediction(inp):
#     rain_next_48h = get_rain_forecast()
#     print(rain_next_48h)
#     features = [
#         float(inp.get('soil_moisture', 0)),
#         float(inp.get('soil_temp', 0)),
#         float(inp.get('soil_ph', 7.0)),
#         float(inp.get('tank_level', 0)),
#         float(inp.get('ambient_humidity', 0)),
#         float(inp.get('ambient_temp', 0)),
#         float(rain_next_48h)
#     ]
#     print(features)
#     irrigate = int(clf.predict([features])[0])

#     # Only calculate water litres if irrigation is needed
#     water_litres = 0.0
#     if irrigate == 1:
#         water_litres = calculate_water_volume(
#             float(inp.get('soil_moisture', 0)),
#             float(inp.get('tank_level', 0)),
#             rain_next_48h
#         )

#     log_request(inp, irrigate, rain_next_48h, water_litres)

#     return {
#         "irrigate": irrigate,
#         "water_litres": water_litres,
#         "rain_next_48h": rain_next_48h
#     }

def run_prediction(inp):
    rain_next_48h = get_rain_forecast()
    print(rain_next_48h)

    # Create dictionary with feature names
    features_dict = {
        "soil_moisture": float(inp.get('soil_moisture', 0)),
        "soil_temp": float(inp.get('soil_temp', 0)),
        "soil_ph": float(inp.get('soil_ph', 7.0)),
        "tank_level": float(inp.get('tank_level', 0)),
        "ambient_humidity": float(inp.get('ambient_humidity', 0)),
        "ambient_temp": float(inp.get('ambient_temp', 0)),
        "rain_next_48h": float(rain_next_48h)
    }

    print(features_dict)

    # Convert to DataFrame with correct column names
    X = pd.DataFrame([features_dict])

    irrigate = int(clf.predict(X)[0])

    # Only calculate water litres if irrigation is needed
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

# Alias route for ESP32
@app.route('/sensor-data', methods=['POST'])
def sensor_data():
    inp = request.json or {}
    return jsonify(run_prediction(inp))

# ✅ Add this home route so base URL shows a message
@app.route("/", methods=["GET"])
def home():
    return "Irrigation Predictor API is live!"

@app.route('/data', methods=['POST'])
def data():
    inp = request.json or {}
    return jsonify(run_prediction(inp))


# def dataPrint():
#     data = request.get_json()
#     if not data:
#         return jsonify({"error": "Invalid or missing data"}), 400

    # try:
    #     conn = get_db_connection()
    #     cur = conn.cursor()

    #     # Insert data into soil_data table
    #     insert_query = """
    #         INSERT INTO soil_data (user_id, soil_moisture, soil_temp, soil_ph, tank_level, ambient_humidity, ambient_temp, timestamp)
    #         VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    #     """
    #     # Example: assuming user_id = 1; adjust as needed or extract from data
    #     cur.execute(insert_query, (
    #         data.get('user_id', 1),            # default user_id = 1
    #         data.get('soil_moisture'),
    #         data.get('soil_temp'),
    #         data.get('soil_ph'),
    #         data.get('tank_level'),
    #         data.get('ambient_humidity'),
    #         data.get('ambient_temp'),
    #         data.get('timestamp')
    #     ))

    #     conn.commit()
    #     cur.close()
    #     conn.close()

    #     return jsonify({"message": "Data inserted successfully"}), 200

    # except Exception as e:
    #     print("error"+ str(e))
    #     return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # ❌ Old:
    # app.run(host="0.0.0.0", port=5000)

    # ✅ NEW: Use dynamic port (needed for Heroku/AWS/etc.)
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
