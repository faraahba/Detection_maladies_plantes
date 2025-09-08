from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import numpy as np
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
from PIL import Image
import io
import threading
import paho.mqtt.client as mqtt

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

# Enable CORS
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///predictions.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define database model
class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    image_data = db.Column(db.LargeBinary, nullable=False)
    class_name = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)

# Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'plant_disease_detection_model.keras')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Load model
try:
    print(f"Loading model from: {MODEL_PATH}")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
    model = load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    model = None

# Define class labels
CLASS_LABELS = ['Ill_cucumber', 'good_Cucumber']

# Utility function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# MQTT Configuration
MQTT_BROKER = 'broker.hivemq.com'  # Replace with your broker address
MQTT_PORT = 1883
MQTT_TOPIC_SUB = 'plant/prediction/subscribe'
MQTT_TOPIC_PUB = 'plant/prediction/publish'

# MQTT Client
mqtt_client = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with result code", rc)
    client.subscribe(MQTT_TOPIC_SUB)

def on_message(client, userdata, msg):
    print(f"Received MQTT message on topic {msg.topic}: {msg.payload.decode()}")


mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def start_mqtt():
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_forever()

# Start MQTT in a separate thread
mqtt_thread = threading.Thread(target=start_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()














######################################################################################
@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400

        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if allowed_file(file.filename):
            # Secure filename
            filename = secure_filename(file.filename)

            # Read the file stream and prepare the image
            image_data = file.read()
            image = Image.open(io.BytesIO(image_data))
            img = image.resize((128, 128))
            img_array = np.array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0

            # Predict using the model
            predictions = model.predict(img_array)
            predicted_class = np.argmax(predictions[0])
            class_name = CLASS_LABELS[predicted_class]
            confidence = float(predictions[0][predicted_class]) * 100

            # Save to DB
            prediction = Prediction(
                filename=filename,
                image_data=image_data,
                class_name=class_name,
                confidence=confidence
            )
            db.session.add(prediction)
            db.session.commit()

            return jsonify({'class_name': class_name, 'confidence': confidence})
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        return jsonify({'error': f'Error processing request: {str(e)}'}), 500

@app.route('/predictions', methods=['GET'])
def get_predictions():
    predictions = Prediction.query.all()
    result = [
        {
            'id': pred.id,
            'filename': pred.filename,
            'class_name': pred.class_name,
            'confidence': pred.confidence,
        }
        for pred in predictions
    ]
    return jsonify(result)

@app.route('/image/<int:image_id>', methods=['GET'])
def get_image(image_id):
    try:
        prediction = Prediction.query.get(image_id)
        if not prediction:
            return jsonify({'error': 'Image not found'}), 404

        return app.response_class(prediction.image_data, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({'error': 'Error fetching image'}), 500

# Initialize the database
with app.app_context():
    db.create_all()

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
