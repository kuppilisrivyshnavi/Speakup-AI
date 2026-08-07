from flask import Blueprint, request, jsonify, g

from database.connection import get_db_connection

from middleware.jwt_middleware import token_required

from services.groq_service import evaluate_interview_answer


practice_bp = Blueprint(
    "practice",
    __name__
)


# ==========================================
# SUBMIT INTERVIEW ANSWER
# ==========================================
@practice_bp.route(
    "/submit-answer",
    methods=["POST"]
)
@token_required
def submit_answer():

    data = request.get_json() or {}

    # Get request data
    session_id = data.get(
        "session_id"
    )

    question = data.get(
        "question"
    )

    answer = data.get(
        "answer"
    )

    question_number = data.get(
        "question_number",
        1
    )


    # ==================================
    # VALIDATION
    # ==================================

    if not session_id:

        return jsonify({
            "message":
            "session_id is required"
        }), 400


    if not question:

        return jsonify({
            "message":
            "Question is required"
        }), 400


    if not answer:

        return jsonify({
            "message":
            "Answer is required"
        }), 400


    try:

        session_id = int(
            session_id
        )

        question_number = int(
            question_number
        )

    except (
        ValueError,
        TypeError
    ):

        return jsonify({
            "message":
            "session_id and question_number "
            "must be numbers"
        }), 400


    connection = None

    cursor = None


    try:

        connection = get_db_connection()


        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # CHECK INTERVIEW SESSION
        # ==================================

        cursor.execute(

            """
            SELECT
                id,
                user_id,
                total_questions,
                current_question,
                status

            FROM interview_sessions

            WHERE id = %s
            AND user_id = %s
            """,

            (
                session_id,
                g.user_id
            )

        )


        interview_session = (
            cursor.fetchone()
        )


        if not interview_session:

            return jsonify({

                "message":
                "Interview session not found"

            }), 404


        # ==================================
        # CHECK SESSION STATUS
        # ==================================

        if (
            interview_session[
                "status"
            ] != "active"
        ):

            return jsonify({

                "message":
                "This interview session "
                "is no longer active"

            }), 400


        # ==================================
        # EVALUATE ANSWER USING GROQ
        # ==================================

        evaluation = (
            evaluate_interview_answer(

                question=
                    question,

                answer=
                    answer

            )
        )


        # ==================================
        # EXTRACT SCORE
        # ==================================

        score = 0


        for line in (
            evaluation.splitlines()
        ):

            if line.startswith(
                "SCORE:"
            ):

                score_text = (
                    line
                    .replace(
                        "SCORE:",
                        ""
                    )
                    .strip()
                )


                try:

                    score = int(
                        score_text
                    )

                except ValueError:

                    score = 0


                break


        # ==================================
        # SAVE ANSWER
        # ==================================

        cursor.execute(

            """
            INSERT INTO practice_sessions
            (
                user_id,
                interview_session_id,
                question,
                answer,
                score,
                feedback,
                interview_type,
                question_number
            )

            VALUES
            (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s
            )
            """,

            (

                g.user_id,

                session_id,

                question,

                answer,

                score,

                evaluation,

                "mixed",

                question_number

            )

        )


        # ==================================
        # DETERMINE NEXT QUESTION
        # ==================================

        total_questions = (
            interview_session[
                "total_questions"
            ]
        )


        if (
            question_number
            >= total_questions
        ):

            # Interview completed

            cursor.execute(

                """
                UPDATE interview_sessions

                SET
                    current_question = %s,
                    status = 'completed',
                    completed_at =
                        CURRENT_TIMESTAMP

                WHERE id = %s
                """,

                (
                    question_number,
                    session_id
                )

            )


            connection.commit()


            return jsonify({

                "message":
                "Interview completed successfully",

                "session_id":
                session_id,

                "question_number":
                question_number,

                "score":
                score,

                "evaluation":
                evaluation,

                "status":
                "completed"

            }), 201


        else:

            # Move to next question

            next_question = (
                question_number + 1
            )


            cursor.execute(

                """
                UPDATE interview_sessions

                SET current_question = %s

                WHERE id = %s
                """,

                (
                    next_question,
                    session_id
                )

            )


            connection.commit()


            return jsonify({

                "message":
                "Answer evaluated successfully",

                "session_id":
                session_id,

                "question_number":
                question_number,

                "score":
                score,

                "evaluation":
                evaluation,

                "next_question_number":
                next_question,

                "status":
                "active"

            }), 201


    except Exception as e:

        if connection:

            connection.rollback()


        return jsonify({

            "message":
            "Answer evaluation failed",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()