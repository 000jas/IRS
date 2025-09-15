-- DROP TABLE IF EXISTS soil_data CASCADE;

-- CREATE TABLE soil_data (
--     id BIGSERIAL PRIMARY KEY,
--     user_id BIGINT,
--     soil_moisture FLOAT,
--     soil_temp FLOAT,
--     soil_ph FLOAT,
--     tank_level FLOAT,
--     ambient_humidity FLOAT,
--     ambient_temp FLOAT,
--     timestamp TIMESTAMPTZ
-- );

DROP TABLE IF EXISTS soil_data CASCADE;

CREATE TABLE soil_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    soil_moisture FLOAT,
    soil_temp FLOAT,
    soil_ph FLOAT,
    tank_level FLOAT,
    ambient_humidity FLOAT,
    ambient_temp FLOAT,
    timestamp TIMESTAMPTZ,
    irrigate INT,
    water_litres FLOAT,
    rain_next_48h FLOAT
);
