from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import binascii
import cv2
import numpy as np
from PIL import Image
import io
import logging
from fe.reg2 import FaceRecognitionSystem

# ================= LOGGING =================
logging.basicConfig(
    filename="face_auth.log",
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

# ================= APP =================
app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

# ================= INIT =================
face_system = FaceRecognitionSystem()

# ================= UTIL =================
def decode_base64_image(image_data):
    try:
        if not image_data:
            return None, "Empty image data"

        # bỏ header nếu có
        if "," in image_data:
            image_data = image_data.split(",", 1)[1]

        # decode base64
        try:
            image_bytes = base64.b64decode(image_data)
        except (binascii.Error, ValueError) as err:
            return None, f"Invalid base64: {err}"

        if not image_bytes or len(image_bytes) < 100:
            return None, "Image too small or empty"

        # verify ảnh
        try:
            img = Image.open(io.BytesIO(image_bytes))
            img.verify()
            img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            return None, f"Invalid image file: {e}"

        frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        return frame, None

    except Exception as e:
        return None, str(e)

# ================= ROUTES =================
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Face recognition server is running"
    })

@app.route('/verify', methods=['POST'])
def verify_face():
    try:
        # ===== validate request =====
        data = request.get_json(silent=True)
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "Invalid request body",
                "verified": False
            }), 400

        image_data = data.get('image')

        # ===== decode image =====
        frame, err = decode_base64_image(image_data)
        if err:
            logging.warning("Decode error: %s", err)
            return jsonify({
                "success": False,
                "error": err,
                "verified": False
            }), 400

        # ===== detect face =====
        boxes, _ = face_system.mtcnn.detect(frame)

        if boxes is None or len(boxes) == 0:
            return jsonify({
                "success": False,
                "error": "No face detected",
                "verified": False
            })

        # ===== lấy bbox đầu tiên =====
        x1, y1, x2, y2 = map(int, boxes[0].tolist())

        height, width = frame.shape[:2]

        # clip bbox
        x1 = max(0, min(x1, width - 1))
        y1 = max(0, min(y1, height - 1))
        x2 = max(0, min(x2, width))
        y2 = max(0, min(y2, height))

        if x2 <= x1 or y2 <= y1:
            logging.warning("Invalid bbox: %s", (x1, y1, x2, y2))
            return jsonify({
                "success": False,
                "error": "No face detected",
                "verified": False
            })

        # ===== crop face =====
        face_img = frame[y1:y2, x1:x2]

        if face_img.size == 0:
            logging.warning("Empty face crop")
            return jsonify({
                "success": False,
                "error": "No face detected",
                "verified": False
            })

        # ===== embedding =====
        embedding = face_system.get_face_embedding(face_img)

        if embedding is None or len(embedding) == 0:
            logging.warning("Embedding failed")
            return jsonify({
                "success": False,
                "error": "Face processing failed",
                "verified": False
            })

        # ===== recognize =====
        user_id, confidence = face_system.recognize_face(embedding[0])
        
        # Convert numpy types to native Python types
        is_verified = bool(user_id != "Unknown" and confidence >= 51.9)
        confidence_float = float(confidence)
        
        display_name = face_system.names.get(user_id, user_id)
        
        return jsonify({
            "success": True,
            "verified": is_verified,
            "user_id": user_id if is_verified else None,
            "name": display_name if is_verified else "Unknown",
            "confidence": confidence_float,
            "face_detected": True
        })

    except Exception as exc:
        logging.exception("Error in verify_face")
        return jsonify({
            "success": False,
            "error": str(exc),
            "verified": False
        }), 500


@app.route('/status', methods=['GET'])
def get_status():
    return jsonify({
        "has_known_faces": len(face_system.known_embeddings) > 0,
        "known_faces_count": len(face_system.known_embeddings),
        "device": str(face_system.device)
    })

if __name__ == '__main__':
    print("Starting Face Recognition Server...")
    print(f"Known faces loaded: {len(face_system.known_embeddings)}")

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False 
    )