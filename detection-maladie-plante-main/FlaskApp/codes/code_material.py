import RPi.GPIO as GPIO
import time
import picamera
import base64
import paho.mqtt.client as mqtt

# Configuration des broches GPIO
LED_ROUGE_PIN = 17  # Pin pour LED rouge
LED_VERTE_PIN = 27  # Pin pour LED verte

# Configuration MQTT
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "plantes/sante"
MQTT_CLIENT_ID = "RaspberryPiClient"

# Initialisation de la caméra Pi
camera = picamera.PICamera()

# Initialisation du client MQTT
client = mqtt.Client(MQTT_CLIENT_ID)

# Fonction pour connecter le Raspberry Pi au Wi-Fi
def connect_wifi():
    # Dans un Raspberry Pi, le Wi-Fi est généralement géré par la configuration réseau.
    # Assurez-vous que votre Raspberry Pi est connecté à un réseau Wi-Fi.
    pass

# Fonction pour connecter le client MQTT
def connect_mqtt():
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

# Fonction pour capturer une image avec la caméra
def capture_image():
    # Capture de l'image et conversion en base64
    image_path = "/tmp/captured_image.jpg"
    camera.capture(image_path)
    with open(image_path, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode("utf-8")
    return encoded_image

# Fonction pour envoyer les données au broker MQTT
def send_data_to_mqtt(status, image_base64):
    # Envoyer le statut de la plante
    client.publish(MQTT_TOPIC, f"Plant status: {status}")

    # Envoyer l'image si disponible
    if image_base64:
        image_topic = "plantes/sante/image"
        client.publish(image_topic, image_base64)
        print("Image sent via MQTT")

# Fonction pour gérer les LEDs en fonction de la santé de la plante
def handle_leds(is_healthy):
    if is_healthy:
        GPIO.output(LED_ROUGE_PIN, GPIO.LOW)  # Éteindre la LED rouge
        GPIO.output(LED_VERTE_PIN, GPIO.HIGH)  # Allumer la LED verte
    else:
        GPIO.output(LED_ROUGE_PIN, GPIO.HIGH)  # Allumer la LED rouge
        GPIO.output(LED_VERTE_PIN, GPIO.LOW)  # Éteindre la LED verte

# Fonction simulant la détection de maladie à partir de l'image
def detect_disease(image_path):
    # Logique simulée pour la détection de maladie
    # Remplacez cette partie par un vrai modèle d'analyse d'image
    # Pour cette simulation, on alterne la détection
    return time.time() % 2 < 1  # Simule "healthy" ou "diseased" alternativement

# Initialisation de la configuration GPIO
def setup_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(LED_ROUGE_PIN, GPIO.OUT)
    GPIO.setup(LED_VERTE_PIN, GPIO.OUT)

def main():
    # Configuration initiale
    setup_gpio()
    connect_wifi()
    connect_mqtt()

    # Boucle principale
    while True:
        # Capturer une image
        image_base64 = capture_image()
        image_path = "/tmp/captured_image.jpg"

        # Détecter la maladie
        is_healthy = detect_disease(image_path)
        status = "healthy" if is_healthy else "diseased"
        print(f"Plant status: {status}")

        # Gérer les LEDs
        handle_leds(is_healthy)

        # Envoyer les données au broker MQTT
        send_data_to_mqtt(status, image_base64)

        # Attendre avant de répéter
        time.sleep(5)

if __name__ == "__main__":
    main()
