import pandas as pd
import numpy as np
import time

np.random.seed(42)
rows = []

DATA_FILE = "irrigation_data.csv"
def addData(info):
    # Extract values from incoming info dictionary
    soil_moisture = info.get("soil_moisture")
    soil_temp = info.get("soil_temp")
    soil_ph = info.get("soil_ph")
    tank_level = info.get("tank_level")
    ambient_humidity = info.get("ambient_humidity")
    ambient_temp = info.get("ambient_temp")
    rain_next_48h = info.get("rain_next_48h")

    # Calculate target 'irrigate' using simple logic
    irrigate = int(
        soil_moisture < 30 and
        rain_next_48h < 5 and
        tank_level > 10 and
        6.0 <= soil_ph <= 7.5
    )

    # Use timestamp from data or current time if missing
    timestamp = info.get("timestamp", int(time.time()))

    # Create new row
    new_row = {
        "soil_moisture": soil_moisture,
        "soil_temp": soil_temp,
        "soil_ph": soil_ph,
        "tank_level": tank_level,
        "ambient_humidity": ambient_humidity,
        "ambient_temp": ambient_temp,
        "rain_next_48h": rain_next_48h,
        "irrigate": irrigate,
        "timestamp": timestamp
    }

    # Append to CSV
    df = pd.read_csv(DATA_FILE)
    df = df.append(new_row, ignore_index=True)
    df.to_csv(DATA_FILE, index=False)

df = pd.DataFrame(rows, columns=[
    "soil_moisture", "soil_temp", "soil_ph", "tank_level",
    "ambient_humidity", "ambient_temp", "rain_next_48h", "irrigate", "timestamp"
])
df.to_csv(DATA_FILE, index=False)