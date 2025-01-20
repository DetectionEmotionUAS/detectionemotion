from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model

app = Flask(__name__)
CORS(app)

app.config['UPLOAD_FOLDER'] = './upload'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model sekali saat aplikasi dimulai
try:
    model = load_model('lstm_image_classifier.h5')
except Exception as e:
    print(f"Gagal memuat model: {e}")
    raise

LABELS = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
IMG_SIZE = (48, 48)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image):
    if len(image.shape) == 3:  # Jika RGB atau BGR
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    image = cv2.resize(image, IMG_SIZE)
    image = image.astype('float32') / 255.0
    image = np.expand_dims(image, axis=-1)  # [48, 48, 1]
    image = np.expand_dims(image, axis=0)   # [1, 48, 48, 1]
    image = np.expand_dims(image, axis=1)   # [1, 1, 48, 48, 1]
    return image

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file yang diunggah'}), 400

    file = request.files['file']
    if not allowed_file(file.filename):
        return jsonify({'error': 'Format file tidak valid'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        image = cv2.imread(filepath)
        if image is None:
            return jsonify({'error': 'File bukan gambar yang valid'}), 400
        
        preprocessed_image = preprocess_image(image)
        predictions = model.predict(preprocessed_image)[0]
        max_index = np.argmax(predictions)

        return jsonify({
            "filename": filename,
            "expression": LABELS[max_index],
            "accuracy": round(float(predictions[max_index]) * 100, 2),
            "probabilities": {LABELS[i]: round(float(prob), 4) for i, prob in enumerate(predictions)}
        })

    except Exception as e:
        return jsonify({'error': f'Terjadi kesalahan: {str(e)}'}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
