from flask import Flask, request, jsonify
import requests
import pickle
import pandas as pd
import os
import psycopg2
from dotenv import load_dotenv
from flask_cors import CORS  # ✅ Allow frontend calls

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS

# Load trained model
with open("irrigation_model.pkl", "rb") as f:
    clf = pickle.load(f)
import datetime

def parse_timestamp(ts):
    """Convert ISO 8601 string to Unix epoch (int)."""
    try:
        if isinstance(ts, str):
            dt = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return int(dt.timestamp())  # epoch seconds
        elif isinstance(ts, (int, float)):
            return int(ts)  # already epoch
    except Exception as e:
        print("Timestamp parse error:", e)
        return None

# Weather API setup
WEATHER_API_KEY = "9a2e84ed355d6bed7c639dba9d1e8af3"
LAT, LON = 26.4499, 74.6399

# Logging path
LOG_PATH = "irrigation_log.csv"

# Database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")


def get_db_connection():
    """Connect to PostgreSQL"""
    return psycopg2.connect(DATABASE_URL)


def get_rain_forecast():
    """Fetch next 48h rainfall forecast"""
    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast?lat={LAT}&lon={LON}&appid={WEATHER_API_KEY}&units=metric"
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        rain_48h = sum([item.get("rain", {}).get("3h", 0) for item in data["list"][:16]])
        return rain_48h
    except Exception:
        return 0.0


def calculate_water_volume(soil_moisture, tank_level, rain_next_48h):
    """Compute water needed based on soil/tank/rainfall"""
    deficit = max(0, 30 - soil_moisture)
    water_need = deficit * 2

    if rain_next_48h >= 10:
        water_need = 0
    elif rain_next_48h >= 5:
        water_need *= 0.5

    return round(min(water_need, tank_level), 2)


def log_request(inp, irrigate, water_litres, rain_next_48h):
    """Save log to CSV + DB (inputs + AI outputs)"""
    row = {
        "soil_moisture": inp.get("soil_moisture"),
        "soil_temp": inp.get("soil_temp"),
        "soil_ph": inp.get("soil_ph"),
        "tank_level": inp.get("tank_level"),
        "ambient_humidity": inp.get("ambient_humidity"),
        "ambient_temp": inp.get("ambient_temp"),
        "timestamp": inp.get("timestamp"),
        "irrigate": irrigate,
        "water_litres": water_litres,
        "rain_next_48h": rain_next_48h
    }

    # Log to CSV
    df = pd.DataFrame([row])
    df.to_csv(LOG_PATH, mode="a", header=not os.path.exists(LOG_PATH), index=False)

    # Log to DB
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        insert_query = """
            INSERT INTO soil_data (
                user_id, soil_moisture, soil_temp, soil_ph, tank_level,
                ambient_humidity, ambient_temp, timestamp,
                irrigate, water_litres, rain_next_48h
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """
        cur.execute(
            insert_query,
            (
                inp.get("user_id", 1),
                inp.get("soil_moisture"),
                inp.get("soil_temp"),
                inp.get("soil_ph"),
                inp.get("tank_level"),
                inp.get("ambient_humidity"),
                inp.get("ambient_temp"),
                inp.get("timestamp"),
                irrigate,
                water_litres,
                rain_next_48h
            )
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print("DB Insert Error:", e)

def run_prediction(inp):
    """Core prediction logic"""
    print("📥 Input received:", inp)  # ✅ Print input

    rain_next_48h = get_rain_forecast()

    features_dict = {
        "soil_moisture": float(inp.get("soil_moisture", 0)),
        "soil_temp": float(inp.get("soil_temp", 0)),
        "soil_ph": float(inp.get("soil_ph", 7.0)),
        "tank_level": float(inp.get("tank_level", 0)),
        "ambient_humidity": float(inp.get("ambient_humidity", 0)),
        "ambient_temp": float(inp.get("ambient_temp", 0)),
        "rain_next_48h": float(rain_next_48h),
    }

    print("🧮 Features used:", features_dict)

    X = pd.DataFrame([features_dict])
    irrigate = int(clf.predict(X)[0])

    water_litres = 0.0
    if irrigate == 1:
        water_litres = calculate_water_volume(
            features_dict["soil_moisture"],
            features_dict["tank_level"],
            features_dict["rain_next_48h"],
        )

    # ✅ Log only soil data (schema.sql doesn’t store irrigate/rain/water)
    # log_request(inp)
    log_request(inp, irrigate, water_litres, rain_next_48h)


    return {
        "irrigate": irrigate,
        "water_litres": water_litres,
        "rain_next_48h": rain_next_48h,
    }


# ----------------- ROUTES ----------------- #
@app.route("/predict", methods=["POST"])
def predict():
    inp = request.json or {}
    return jsonify(run_prediction(inp))

@app.route("/showData", methods=["GET"])
def show_data():
    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Fetch last inserted row
        query = """
            SELECT 
                id, user_id, soil_moisture, soil_temp, soil_ph, tank_level,
                ambient_humidity, ambient_temp, timestamp,
                irrigate, water_litres, rain_next_48h
            FROM soil_data
            ORDER BY id DESC
            LIMIT 1
        """
        cur.execute(query)
        row = cur.fetchone()

        cur.close()
        conn.close()

        if row:
            # Convert row into dict for JSON
            keys = [
                "id", "user_id", "soil_moisture", "soil_temp", "soil_ph", "tank_level",
                "ambient_humidity", "ambient_temp", "timestamp",
                "irrigate", "water_litres", "rain_next_48h"
            ]
            return jsonify(dict(zip(keys, row)))
        else:
            return jsonify({"message": "No data found"}), 404

    except Exception as e:
        print("DB Fetch Error:", e)
        return jsonify({"error": "Database error"}), 500

@app.route("/sensor-data", methods=["POST"])
def sensor_data():
    inp = request.json or {}
    return jsonify(run_prediction(inp))


@app.route("/data", methods=["POST"])
def data():
    inp = request.json or {}
    return jsonify(run_prediction(inp))


@app.route("/", methods=["GET"])
def home():
    return "🌱 Irrigation Predictor API is live!"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
