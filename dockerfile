# Use official Python 3.11 image with slim version
FROM python:3.11-slim

# Install system build tools and libraries needed by pandas and scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libatlas-base-dev \
    libopenblas-dev \
    liblapack-dev \
    python3-dev \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy all project files
COPY . .

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Expose the port that Flask will run on
EXPOSE 5000

# Use .env file environment variables (optional, for local development)
# Uncomment this if needed and you use 'python-dotenv' to load env variables
# ENV FLASK_ENV=development

# Set environment variables from .env if used in code (optional approach)
# COPY .env .env

# Run the application
CMD ["python", "app.py"]
