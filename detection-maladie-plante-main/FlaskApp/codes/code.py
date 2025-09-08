# import paho.mqtt.client as mqtt
# import base64
# from io import BytesIO
# from PIL import Image

# # MQTT Configuration
# MQTT_BROKER = 'broker.hivemq.com'  # Use your actual broker address
# MQTT_PORT = 1883
# MQTT_TOPIC_SUB = 'plant/prediction/subscribe'  # Topic for receiving base64 image
# MQTT_TOPIC_PUB = 'plant/prediction/publish'  # Topic to publish results

# # MQTT Client
# mqtt_client = mqtt.Client()

# # MQTT on_connect and on_message handlers
# def on_connect(client, userdata, flags, rc):
#     print("Connected to MQTT broker with result code", rc)
#     client.subscribe(MQTT_TOPIC_SUB)

# def on_message(client, userdata, msg):
#     try:
#         # Decode the base64-encoded image received via MQTT
#         base64_image = msg.payload.decode()
#         image_data = base64.b64decode(base64_image)

#         # Process the image with the existing model
#         image = Image.open(BytesIO(image_data))
#         img = image.resize((128, 128))
#         img_array = np.array(img)
#         img_array = np.expand_dims(img_array, axis=0) / 255.0

#         # Predict using the model
#         predictions = model.predict(img_array)
#         predicted_class = np.argmax(predictions[0])
#         class_name = CLASS_LABELS[predicted_class]
#         confidence = float(predictions[0][predicted_class]) * 100

#         # Convert the image to base64 to send back in the MQTT message
#         buffered = BytesIO()
#         image.save(buffered, format="JPEG")
#         img_base64 = base64.b64encode(buffered.getvalue()).decode()

#         # Save the prediction and image to the database
#         filename = "predicted_image.jpg"  # Static or dynamic name can be used here
#         prediction = Prediction(
#             filename=filename,
#             image_data=image_data,
#             class_name=class_name,
#             confidence=confidence
#         )
#         db.session.add(prediction)
#         db.session.commit()

#         # Send the prediction result and image back to the MQTT topic
#         message = {
#             "prediction": f'Prediction: {class_name}, Confidence: {confidence}%',
#             "image": img_base64  # Sending the image as base64
#         }
#         mqtt_client.publish(MQTT_TOPIC_PUB, str(message))

#     except Exception as e:
#         print(f"Error processing MQTT message: {str(e)}")

# # MQTT Connection setup
# mqtt_client.on_connect = on_connect
# mqtt_client.on_message = on_message

# def start_mqtt():
#     mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
#     mqtt_client.loop_forever()

# # Start MQTT client in a separate thread for real-time handling
# mqtt_thread = threading.Thread(target=start_mqtt)
# mqtt_thread.daemon = True
# mqtt_thread.start()









########################################################################################################


# import React, { useEffect, useState } from 'react';
# import mqtt from 'mqtt';

# const PredictionResult = () => {
#   const [prediction, setPrediction] = useState(null);
#   const [image, setImage] = useState(null);

#   useEffect(() => {
#     const client = mqtt.connect('wss://broker.hivemq.com:8000/mqtt');
    
#     client.on('connect', () => {
#       console.log('Connected to MQTT broker');
#       client.subscribe('plant/prediction/publish');
#     });

#     client.on('message', (topic, message) => {
#       console.log('Received message:', message.toString());
#       const data = JSON.parse(message.toString()); // Parse the incoming message
#       setPrediction(data.prediction); // Set the prediction text
#       setImage(data.image); // Set the base64 image data
#     });

#     return () => {
#       client.end();
#     };
#   }, []);

#   return (
#     <div>
#       {prediction ? (
#         <div>
#           <h3>Prediction Result</h3>
#           <p>{prediction}</p>
#           {image && <img src={`data:image/jpeg;base64,${image}`} alt="Predicted" />}
#         </div>
#       ) : (
#         <p>Waiting for prediction...</p>
#       )}
#     </div>
#   );
# };

# export default PredictionResult;
