from flask import Flask, jsonify, g

from flask_cors import CORS


from database.connection import get_db_connection


from routes.auth_routes import auth_bp

from routes.resume_routes import resume_bp

from routes.interview_routes import interview_bp

from routes.practice_routes import practice_bp


from middleware.jwt_middleware import token_required


app = Flask(__name__)


CORS(app)


# ==================================
# AUTH ROUTES
# ==================================

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)


# ==================================
# RESUME ROUTES
# ==================================

app.register_blueprint(
    resume_bp,
    url_prefix="/api/resume"
)


# ==================================
# INTERVIEW ROUTES
# ==================================

app.register_blueprint(
    interview_bp,
    url_prefix="/api/interview"
)


# ==================================
# PRACTICE ROUTES
# ==================================

app.register_blueprint(
    practice_bp,
    url_prefix="/api/practice"
)


# ==================================
# HOME
# ==================================

@app.route("/")
def home():

    return "SpeakUp AI Backend Running"


# ==================================
# DATABASE TEST
# ==================================

@app.route("/test-db")
def test_db():

    connection = None

    try:

        connection = (
            get_db_connection()
        )

        if connection.is_connected():

            return (
                "MySQL Database "
                "Connected Successfully!"
            )

        return (
            "MySQL Connection Failed!"
        )


    except Exception as e:

        return (
            f"Database Error: "
            f"{str(e)}"
        )


    finally:

        if connection:

            connection.close()


# ==================================
# PROTECTED TEST
# ==================================

@app.route(
    "/api/protected"
)

@token_required

def protected():

    return jsonify({

        "message":
        "You accessed a protected "
        "API successfully!",

        "user_id":
        g.user_id,

        "email":
        g.user_email

    }), 200


# ==================================
# START APPLICATION
# ==================================

if __name__ == "__main__":

    app.run(
        debug=True
    )