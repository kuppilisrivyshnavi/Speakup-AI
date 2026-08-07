from flask import Blueprint, request, jsonify
from database.connection import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import jwt
import os
from datetime import datetime, timedelta

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

auth_bp = Blueprint("auth", __name__)


# =========================
# REGISTER API
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "Name, email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check if email already exists
        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,)
        )

        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "message": "Email already registered"
            }), 409

        # Hash the password before storing it
        hashed_password = generate_password_hash(password)

        # Insert new user
        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, hashed_password)
        )

        connection.commit()

        return jsonify({
            "message": "User registered successfully"
        }), 201

    except Exception as e:
        if connection:
            connection.rollback()

        return jsonify({
            "message": "Registration failed",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()


# =========================
# LOGIN API
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Find user by email
        cursor.execute(
            """
            SELECT id, name, email, password
            FROM users
            WHERE email = %s
            """,
            (email,)
        )

        user = cursor.fetchone()

        # User not found
        if not user:
            return jsonify({
                "message": "Invalid email or password"
            }), 401

        # Verify password
        if not check_password_hash(user["password"], password):
            return jsonify({
                "message": "Invalid email or password"
            }), 401

        # Create JWT token
        token = jwt.encode(
            {
                "user_id": user["id"],
                "email": user["email"],
                "exp": datetime.utcnow() + timedelta(hours=24)
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"]
            }
        }), 200

    except Exception as e:
        return jsonify({
            "message": "Login failed",
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection:
            connection.close()