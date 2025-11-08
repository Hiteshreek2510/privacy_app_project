import cv2
from ultralytics import YOLO
from PIL import Image
import piexif
import os
import numpy as np
import tempfile

# Load models once globally
model1 = YOLO('adhar.pt')
model2 = YOLO('creditcard.pt')
model3 = YOLO('qr_code.pt')
model4 = YOLO('id_card.pt')
models = [model1, model2, model3, model4]

class privacyapp:
    def __init__(self, img_path):
        self.img_path = img_path
        self.privacy = 0
        self.risk_factors = []
        self.blur_regions = []

        # Load and resize image for inference
        img = cv2.imread(self.img_path)
        self.img = cv2.resize(img, (640, 640))

    def privacy_invade(self):
        for model in models:
            result = model(self.img, conf=0.4)
            boxes = result[0].boxes

            for box in boxes:
                cls = int(box.cls.item())
                label = model.names[cls]
                self.privacy += 20
                self.risk_factors.append(label)

                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]
                self.blur_regions.append((x1, y1, x2 - x1, y2 - y1))

        self.privacy = min(self.privacy, 100)
        return self.privacy, self.risk_factors

    def show_gps(self):
        try:
            exif_dict = piexif.load(self.img_path)
            gps_data = exif_dict.get("GPS", {})
            if gps_data:
                self.privacy += 20
                self.risk_factors.append('exif_data')
                print('GPS data detected')
        except Exception as e:
            print("EXIF read error:", str(e))

        self.privacy = min(self.privacy, 100)
        return self.privacy, self.risk_factors

    def blur_sensitive_regions(self):
        image = cv2.imread(self.img_path)
        for (x, y, w, h) in self.blur_regions:
            roi = image[y:y+h, x:x+w]
            blurred_roi = cv2.GaussianBlur(roi, (101, 101), 0)
            image[y:y+h, x:x+w] = blurred_roi

        # Save blurred image to a temporary file
        temp_blur = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        cv2.imwrite(temp_blur.name, image)

        # Strip EXIF and save final sanitized image
        pil_img = Image.open(temp_blur.name)
        sanitized_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
        pil_img.save(sanitized_file.name, "jpeg", exif=piexif.dump({}))

        # Clean up intermediate file
        temp_blur.close()
        os.remove(temp_blur.name)

        print(f"Sanitized image saved at: {sanitized_file.name}")
        return sanitized_file.name
