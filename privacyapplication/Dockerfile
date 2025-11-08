FROM python:3.11.4-slim

# Install system dependencies for OpenCV and Ultralytics
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create upload and sanitized folders
RUN mkdir -p /app/static/uploads /app/static/sanitized && chmod -R 777 /app/static

# Set working directory
WORKDIR /app

# Copy your app files
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port expected by Hugging Face
EXPOSE 7860

# Run the Flask app using Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:7860", "flask_app:app"]
