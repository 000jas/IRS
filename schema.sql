-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS soil_data CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(200) UNIQUE NOT NULL,
    pass VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL
);

-- Create profiles table
CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    profile_name VARCHAR(200) NOT NULL
);

-- Create soil_data table
CREATE TABLE soil_data (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    soil_moisture FLOAT,
    soil_temp FLOAT,
    soil_ph FLOAT,
    tank_level FLOAT,
    ambient_humidity FLOAT,
    ambient_temp FLOAT,
    timestamp BIGINT
);
