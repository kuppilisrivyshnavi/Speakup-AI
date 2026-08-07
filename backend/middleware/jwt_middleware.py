from functools import wraps
from flask import request, jsonify, g
from dotenv import load_dotenv
import jwt
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        # Get Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "message": "Authorization token is missing"
            }), 401

        # Check Bearer token format
        parts = auth_header.split(" ")

        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({
                "message": "Invalid authorization format. Use Bearer <token>"
            }), 401

        token = parts[1]

        try:
            # Decode and verify JWT
            decoded_token = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            # Store decoded user information
            # so protected routes can access it
            g.user_id = decoded_token.get("user_id")
            g.user_email = decoded_token.get("email")

            if not g.user_id:
                return jsonify({
                    "message": "Invalid token"
                }), 401

        except jwt.ExpiredSignatureError:
            return jsonify({
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "message": "Invalid token"
            }), 401

        return f(*args, **kwargs)

    return decorated