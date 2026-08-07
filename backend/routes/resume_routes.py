import os

from flask import Blueprint, request, jsonify, g
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader

from database.connection import get_db_connection
from middleware.jwt_middleware import token_required


resume_bp = Blueprint("resume", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf"}


# =========================
# CHECK ALLOWED FILE
# =========================
def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


# =========================
# UPLOAD RESUME
# =========================
@resume_bp.route("/upload", methods=["POST"])
@token_required
def upload_resume():

    # Check if file exists
    if "resume" not in request.files:
        return jsonify({
            "message": "Resume file is required"
        }), 400

    file = request.files["resume"]

    # Check if file name exists
    if file.filename == "":
        return jsonify({
            "message": "No file selected"
        }), 400

    # Check file type
    if not allowed_file(file.filename):
        return jsonify({
            "message": "Only PDF files are allowed"
        }), 400

    connection = None
    cursor = None

    try:
        # Secure filename
        filename = secure_filename(file.filename)

        # Create unique filename
        unique_filename = f"{g.user_id}_{filename}"

        # Create upload directory if not exists
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Complete file path
        file_path = os.path.join(
            UPLOAD_FOLDER,
            unique_filename
        )

        # Save PDF file
        file.save(file_path)

        # Extract text from PDF
        reader = PdfReader(file_path)

        resume_text = ""

        for page in reader.pages:
            text = page.extract_text()

            if text:
                resume_text += text + "\n"

        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor()

        # Save resume information
        cursor.execute(
            """
            INSERT INTO resumes
            (user_id, resume_text, resume_file_path)
            VALUES (%s, %s, %s)
            """,
            (
                g.user_id,
                resume_text,
                file_path
            )
        )

        connection.commit()

        resume_id = cursor.lastrowid

        return jsonify({
            "message": "Resume uploaded successfully",
            "resume_id": resume_id,
            "file_name": filename
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "message": "Resume upload failed",
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()