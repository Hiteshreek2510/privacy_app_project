import os
import secrets
import tempfile
from PIL import Image
from flask import Flask, request, render_template, session, send_file,redirect,url_for
from utils.process import privacyapp

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/privacyscore', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return "No image uploaded", 400

    image = request.files['image']
    if image.filename == '':
        return "No selected file", 400

    # Delete previous temp file if it exists
    old_temp = session.get('temp_image_path')
    if old_temp and os.path.exists(old_temp):
        os.remove(old_temp)
        print(f"Deleted previous temp image: {old_temp}")

    # Save new image to temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".jpg")
    img = Image.open(image.stream).convert("RGB")
    img = img.resize((640, 640))
    img.save(temp_file.name, format='JPEG', quality=85)
    temp_file.close()

    # Run privacy scoring
    score = privacyapp(temp_file.name)
    score1, risks1 = score.privacy_invade()
    score2, risks2 = score.show_gps()

    privacy_score = min(score1 + score2, 100)
    risk_factors = list(set(risks1 + risks2))

    risk_level = (
        'LOW' if privacy_score < 40 else
        'MEDIUM' if privacy_score < 80 else
        'HIGH'
    )

    # Store session data
    session['privacy_score'] = privacy_score
    session['risk_level'] = risk_level
    session['risk_factors'] = risk_factors
    session['temp_image_path'] = temp_file.name

    return render_template('privacyscore.html', score=privacy_score, risk_level=risk_level)

@app.route('/uploaded')
def uploaded():
    image_path = session.get('temp_image_path')
    if not image_path or not os.path.exists(image_path):
        return "Image file missing", 404
    return send_file(image_path, mimetype='image/jpeg')

@app.route('/explanation')
def explanation():
    privacy_score = session.get('privacy_score')
    risk_level = session.get('risk_level')
    risk_factors = session.get('risk_factors')

    if privacy_score is None:
        explanation_text = "No image has been analyzed yet. Please upload an image to get a privacy score."
    elif privacy_score == 0:
        explanation_text = "Your image is completely safe. No privacy risks were detected, so you can share it confidently."
    else:
        explanation_text = f"""
        Based on our analysis, your image has a privacy score of {privacy_score}/100, indicating a {risk_level.lower()} risk level.
        The following privacy risks were detected:
        {chr(10).join(f"- {factor}" for factor in risk_factors)}
        """

    return render_template('explain.html', explanation=explanation_text.strip(), risk_level=risk_level.lower())

@app.route('/blur_image')
def blur_image():
    return render_template('blur.html')

@app.route('/preview')
def preview():
    image_path = session.get('temp_image_path')
    if not image_path or not os.path.exists(image_path):
        return "No image available", 400

    scanner = privacyapp(image_path)
    scanner.privacy_invade()
    scanner.show_gps()
    sanitized_path = scanner.blur_sensitive_regions()

    if sanitized_path and os.path.exists(sanitized_path):
        return send_file(sanitized_path, mimetype='image/jpeg')
    else:
        return "No blurred image available", 500
@app.route('/cleanup')
def cleanup():
    image_path = session.pop('temp_image_path', None)
    sanitized_path = session.pop('sanitized_image_path', None)

    if image_path and os.path.exists(image_path):
        os.remove(image_path)
        print(f"Deleted original image: {image_path}")

    if sanitized_path and os.path.exists(sanitized_path):
        os.remove(sanitized_path)
        print(f"Deleted blurred image: {sanitized_path}")

    return redirect(url_for('home'))

# @app.after_request
# def cleanup_temp_file(response):
#     temp_path = session.get('temp_image_path')
#     if temp_path and os.path.exists(temp_path):
#         os.remove(temp_path)
#         print(f"Cleaned up temp file: {temp_path}")
#         session.pop('temp_image_path', None)
#     return response

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7860)
