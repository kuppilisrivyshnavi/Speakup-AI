from flask import Blueprint, request, jsonify, g

from database.connection import get_db_connection

from middleware.jwt_middleware import token_required

from services.groq_service import (
    generate_interview_questions,
    generate_final_interview_report
)


interview_bp = Blueprint(
    "interview",
    __name__
)


# ==========================================
# START MOCK INTERVIEW
# ==========================================
@interview_bp.route(
    "/start",
    methods=["POST"]
)
@token_required
def start_interview():

    connection = None
    cursor = None

    try:

        # ==================================
        # GET REQUEST DATA
        # ==================================

        data = request.get_json() or {}

        interview_type = data.get(
            "interview_type",
            "mixed"
        )

        number_of_questions = data.get(
            "number_of_questions",
            5
        )


        # ==================================
        # VALIDATE NUMBER OF QUESTIONS
        # ==================================

        try:

            number_of_questions = int(
                number_of_questions
            )

        except (
            ValueError,
            TypeError
        ):

            return jsonify({

                "message":
                "number_of_questions must be a number"

            }), 400


        if number_of_questions <= 0:

            return jsonify({

                "message":
                "number_of_questions must be greater than 0"

            }), 400


        # ==================================
        # CONNECT TO DATABASE
        # ==================================

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # GET USER'S LATEST RESUME
        # ==================================

        cursor.execute(

            """
            SELECT
                id,
                resume_text

            FROM resumes

            WHERE user_id = %s

            ORDER BY uploaded_at DESC

            LIMIT 1
            """,

            (
                g.user_id,
            )

        )

        resume = cursor.fetchone()


        # ==================================
        # CHECK RESUME
        # ==================================

        if not resume:

            return jsonify({

                "message":
                "Please upload a resume before starting an interview"

            }), 404


        # ==================================
        # CHECK RESUME TEXT
        # ==================================

        if not resume["resume_text"]:

            return jsonify({

                "message":
                "Resume text is empty"

            }), 400


        # ==================================
        # GENERATE QUESTIONS USING GROQ
        # ==================================

        questions = generate_interview_questions(

            resume_text=
            resume["resume_text"],

            interview_type=
            interview_type,

            number_of_questions=
            number_of_questions

        )


        # ==================================
        # CHECK GENERATED QUESTIONS
        # ==================================

        if not questions:

            return jsonify({

                "message":
                "Failed to generate interview questions"

            }), 500


        # ==================================
        # CREATE INTERVIEW SESSION
        # ==================================

        cursor.execute(

            """
            INSERT INTO interview_sessions
            (
                user_id,
                resume_id,
                interview_type,
                total_questions,
                current_question,
                status
            )

            VALUES
            (
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

                resume["id"],

                interview_type,

                len(questions),

                1,

                "active"

            )

        )


        # ==================================
        # GET NEW SESSION ID
        # ==================================

        session_id = cursor.lastrowid


        # ==================================
        # SAVE GENERATED QUESTIONS
        # ==================================

        for index, question in enumerate(
            questions,
            start=1
        ):

            cursor.execute(

                """
                INSERT INTO interview_questions
                (
                    interview_session_id,
                    question_number,
                    question
                )

                VALUES
                (
                    %s,
                    %s,
                    %s
                )
                """,

                (

                    session_id,

                    index,

                    question

                )

            )


        # ==================================
        # COMMIT DATABASE CHANGES
        # ==================================

        connection.commit()


        # ==================================
        # RETURN RESPONSE
        # ==================================

        return jsonify({

            "message":
            "Mock interview started successfully",

            "session_id":
            session_id,

            "interview_type":
            interview_type,

            "total_questions":
            len(questions),

            "current_question":
            1,

            "question":
            questions[0],

            "questions":
            questions,

            "status":
            "active"

        }), 201


    except Exception as e:

        if connection:

            connection.rollback()


        return jsonify({

            "message":
            "Failed to start interview",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()


# ==========================================
# GET CURRENT / NEXT INTERVIEW QUESTION
# ==========================================
@interview_bp.route(
    "/int<session_id>/next-question",
    methods=["GET"]
)
@token_required
def get_next_question(session_id):

    connection = None
    cursor = None

    try:

        # ==================================
        # CONNECT TO DATABASE
        # ==================================

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # GET INTERVIEW SESSION
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


        interview_session = cursor.fetchone()


        # ==================================
        # CHECK SESSION
        # ==================================

        if not interview_session:

            return jsonify({

                "message":
                "Interview session not found"

            }), 404


        # ==================================
        # CHECK SESSION STATUS
        # ==================================

        if interview_session["status"] != "active":

            return jsonify({

                "message":
                "Interview session is completed",

                "status":
                interview_session["status"]

            }), 400


        # ==================================
        # GET CURRENT QUESTION NUMBER
        # ==================================

        current_question_number = (

            interview_session[
                "current_question"
            ]

        )


        # ==================================
        # GET QUESTION FROM DATABASE
        # ==================================

        cursor.execute(

            """
            SELECT
                id,
                question_number,
                question

            FROM interview_questions

            WHERE interview_session_id = %s

            AND question_number = %s
            """,

            (

                session_id,

                current_question_number

            )

        )


        question_data = cursor.fetchone()


        # ==================================
        # CHECK QUESTION
        # ==================================

        if not question_data:

            return jsonify({

                "message":
                "Question not found"

            }), 404


        # ==================================
        # RETURN QUESTION
        # ==================================

        return jsonify({

            "message":
            "Next question retrieved successfully",

            "session_id":
            session_id,

            "question_number":
            question_data[
                "question_number"
            ],

            "total_questions":
            interview_session[
                "total_questions"
            ],

            "question":
            question_data[
                "question"
            ],

            "status":
            "active"

        }), 200


    except Exception as e:

        return jsonify({

            "message":
            "Failed to retrieve next question",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()
# ==========================================
# GET INTERVIEW HISTORY
# ==========================================
@interview_bp.route(
    "/history",
    methods=["GET"]
)
@token_required
def get_interview_history():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )

        cursor.execute(
            """
            SELECT

                ir.interview_session_id AS session_id,

                ir.overall_score,

                ir.technical_score,

                ir.communication_score,

                ir.confidence_score,

                ir.total_questions,

                ir.summary,

                i.interview_type,

                i.completed_at,

                i.status

            FROM interview_reports ir

            JOIN interview_sessions i

            ON ir.interview_session_id = i.id

            WHERE ir.user_id = %s

            ORDER BY i.completed_at DESC
            """,

            (
                g.user_id,
            )
        )

        history = cursor.fetchall()

        return jsonify({

            "message":
            "Interview history fetched successfully",

            "count":
            len(history),

            "history":
            history

        }), 200


    except Exception as e:

        return jsonify({

            "message":
            "Failed to fetch interview history",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()

# ==========================================
# GET SINGLE INTERVIEW REPORT
# ==========================================
@interview_bp.route(
    "/report/int<session_id>",
    methods=["GET"]
)
@token_required
def get_interview_report(session_id):

    connection = None
    cursor = None

    try:

        # ==================================
        # CONNECT DATABASE
        # ==================================

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # FETCH REPORT
        # ==================================

        cursor.execute(

            """
            SELECT

                interview_session_id,

                overall_score,

                technical_score,

                communication_score,

                confidence_score,

                total_questions,

                strengths,

                weaknesses,

                improvement_suggestions,

                summary

            FROM interview_reports

            WHERE interview_session_id = %s

            AND user_id = %s
            """,

            (

                session_id,

                g.user_id

            )

        )

        report = cursor.fetchone()


        # ==================================
        # CHECK REPORT
        # ==================================

        if not report:

            return jsonify({

                "message":
                "Interview report not found"

            }), 404


        # ==================================
        # FETCH QUESTIONS & ANSWERS
        # ==================================

        cursor.execute(

            """
            SELECT

                question_number,

                question,

                answer,

                score,

                feedback

            FROM practice_sessions

            WHERE interview_session_id = %s

            ORDER BY question_number
            """,

            (

                session_id,

            )

        )

        questions = cursor.fetchall()


        # ==================================
        # RETURN RESPONSE
        # ==================================

        return jsonify({

            "message":
            "Interview report fetched successfully",

            "report": {

                "session_id":
                report["interview_session_id"],

                "overall_score":
                report["overall_score"],

                "technical_score":
                report["technical_score"],

                "communication_score":
                report["communication_score"],

                "confidence_score":
                report["confidence_score"],

                "total_questions":
                report["total_questions"],

                "strengths":
                report["strengths"],

                "weaknesses":
                report["weaknesses"],

                "improvement_suggestions":
                report["improvement_suggestions"],

                "summary":
                report["summary"],

                "questions":
                questions

            }

        }), 200


    except Exception as e:

        return jsonify({

            "message":
            "Failed to fetch interview report",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:

            cursor.close()

        if connection:

            connection.close()
# ==========================================
# GET DASHBOARD
# ==========================================
@interview_bp.route(
    "/dashboard",
    methods=["GET"]
)
@token_required
def get_dashboard():

    connection = None
    cursor = None

    try:

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # TOTAL INTERVIEWS
        # ==================================

        cursor.execute(

            """
            SELECT COUNT(*) AS total

            FROM interview_reports

            WHERE user_id = %s
            """,

            (
                g.user_id,
            )

        )

        total_interviews = cursor.fetchone()["total"]


        # ==================================
        # AVERAGE SCORE
        # ==================================

        cursor.execute(

            """
            SELECT

                AVG(overall_score) AS average_score,

                MAX(overall_score) AS highest_score,

                MIN(overall_score) AS lowest_score

            FROM interview_reports

            WHERE user_id = %s
            """,

            (
                g.user_id,
            )

        )

        score_data = cursor.fetchone()


        # ==================================
        # RECENT INTERVIEWS
        # ==================================

        cursor.execute(

            """
            SELECT

                ir.interview_session_id,

                ir.overall_score,

                ir.technical_score,

                ir.communication_score,

                ir.confidence_score,

                ir.created_at,

                s.interview_type,

                s.status

            FROM interview_reports ir

            INNER JOIN interview_sessions s

                ON ir.interview_session_id = s.id

            WHERE ir.user_id = %s

            ORDER BY ir.id DESC

            LIMIT 5
            """,

            (
                g.user_id,
            )

        )

        recent = cursor.fetchall()


        return jsonify({

            "message":
            "Dashboard loaded successfully",

            "total_interviews":
            total_interviews,

            "average_score":
            round(score_data["average_score"] or 0),

            "highest_score":
            score_data["highest_score"] or 0,

            "lowest_score":
            score_data["lowest_score"] or 0,

            "recent_interviews":
            recent

        }), 200


    except Exception as e:

        return jsonify({

            "message":
            "Failed to load dashboard",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:

            cursor.close()

        if connection:

            connection.close()
    # ==========================================
# GENERATE FINAL INTERVIEW REPORT
# ==========================================
@interview_bp.route(
    "/int<session_id>/final-report",
    methods=["GET"]
)
@token_required
def generate_final_report(session_id):

    connection = None
    cursor = None

    try:

        # ==================================
        # CONNECT TO DATABASE
        # ==================================

        connection = get_db_connection()

        cursor = connection.cursor(
            dictionary=True
        )


        # ==================================
        # GET INTERVIEW SESSION
        # ==================================

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                total_questions,
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

        interview_session = cursor.fetchone()


        # ==================================
        # CHECK SESSION
        # ==================================

        if not interview_session:

            return jsonify({

                "message":
                "Interview session not found"

            }), 404


        # ==================================
        # GET ALL ANSWERS AND SCORES
        # ==================================

        cursor.execute(
            """
            SELECT
                question_number,
                question,
                answer,
                score,
                feedback

            FROM practice_sessions

            WHERE interview_session_id = %s

            ORDER BY question_number
            """,
            (
                session_id,
            )
        )

        answers = cursor.fetchall()


        # ==================================
        # CHECK ANSWERS
        # ==================================

        if not answers:

            return jsonify({

                "message":
                "No interview answers found"

            }), 404


        # ==================================
        # CHECK COMPLETION
        # ==================================

        if len(answers) < interview_session[
            "total_questions"
        ]:

            return jsonify({

                "message":
                "Interview is not completed yet",

                "answered_questions":
                len(answers),

                "total_questions":
                interview_session[
                    "total_questions"
                ]

            }), 400


        # ==================================
        # CALCULATE OVERALL SCORE
        # ==================================

        total_score = 0

        for answer in answers:

            total_score += (
                answer["score"] or 0
            )


        overall_score = round(

            total_score
            / len(answers)

        )


        # ==================================
        # PREPARE ANSWERS FOR AI
        # ==================================

        interview_data = ""

        for answer in answers:

            interview_data += (

                "\nQuestion "
                + str(
                    answer[
                        "question_number"
                    ]
                )

                + ": "

                + str(
                    answer[
                        "question"
                    ]
                )

                + "\nAnswer: "

                + str(
                    answer[
                        "answer"
                    ]
                )

                + "\nScore: "

                + str(
                    answer[
                        "score"
                    ]
                )

                + "\nFeedback: "

                + str(
                    answer[
                        "feedback"
                    ]
                )

                + "\n"

            )


        # ==================================
        # GENERATE FINAL ANALYSIS USING GROQ
        # ==================================

                # ==================================
        # PREPARE QUESTIONS & ANSWERS
        # ==================================

        interview_questions = []
        interview_answers = []

        for answer in answers:

            interview_questions.append(
                answer["question"]
            )

            interview_answers.append(
                answer["answer"]
            )


        # ==================================
        # GENERATE FINAL REPORT USING GROQ
        # ==================================

        report = generate_final_interview_report(

            interview_questions=interview_questions,

            interview_answers=interview_answers,

            overall_score=overall_score

        )


        # ==================================
        # EXTRACT REPORT VALUES
        # ==================================

        technical_score = report.get(
            "technical_score",
            overall_score
        )

        communication_score = report.get(
            "communication_score",
            overall_score
        )

        confidence_score = report.get(
            "confidence_score",
            overall_score
        )

        strengths = "\n".join(
            report.get(
                "strengths",
                []
            )
        )

        weaknesses = "\n".join(
            report.get(
                "weaknesses",
                []
            )
        )

        improvement_suggestions = "\n".join(
            report.get(
                "improvement_suggestions",
                []
            )
        )

        summary = report.get(
            "summary",
            ""
        )

        # ==================================
        # SAVE FINAL REPORT
        # ==================================

               # ==================================
        # CHECK IF REPORT ALREADY EXISTS
        # ==================================

        cursor.execute(

            """
            SELECT id

            FROM interview_reports

            WHERE interview_session_id = %s
            """,

            (
                session_id,
            )

        )

        existing_report = cursor.fetchone()


        # ==================================
        # UPDATE EXISTING REPORT
        # ==================================

        if existing_report:

            cursor.execute(

                """
                UPDATE interview_reports

                SET

                    overall_score = %s,

                    total_questions = %s,

                    strengths = %s,

                    weaknesses = %s,

                    communication_score = %s,

                    technical_score = %s,

                    confidence_score = %s,

                    improvement_suggestions = %s,

                    summary = %s

                WHERE interview_session_id = %s
                """,

                (

                    overall_score,

                    len(answers),

                    strengths.strip(),

                    weaknesses.strip(),

                    communication_score,

                    technical_score,

                    confidence_score,

                    improvement_suggestions.strip(),

                    summary,

                    session_id

                )

            )

        else:

            cursor.execute(

                """
                INSERT INTO interview_reports
                (
                    interview_session_id,
                    user_id,
                    overall_score,
                    total_questions,
                    strengths,
                    weaknesses,
                    communication_score,
                    technical_score,
                    confidence_score,
                    improvement_suggestions,
                    summary
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
                    %s,
                    %s,
                    %s,
                    %s
                )
                """,

                (

                    session_id,

                    g.user_id,

                    overall_score,

                    len(answers),

                    strengths.strip(),

                    weaknesses.strip(),

                    communication_score,

                    technical_score,

                    confidence_score,

                    improvement_suggestions.strip(),

                    summary

                )

            )

        # ==================================
        # MARK INTERVIEW AS COMPLETED
        # ==================================

        cursor.execute(

            """
            UPDATE interview_sessions

            SET
                status = 'completed',

                completed_at =
                CURRENT_TIMESTAMP

            WHERE id = %s

            AND user_id = %s
            """,

            (

                session_id,

                g.user_id

            )

        )


        # ==================================
        # COMMIT CHANGES
        # ==================================

        connection.commit()


        # ==================================
        # RETURN FINAL REPORT
        # ==================================

        return jsonify({

            "message":
            "Final interview report generated successfully",

            "session_id":
            session_id,

            "overall_score":
            overall_score,

            "total_questions":
            len(answers),

            "strengths":
            strengths.strip(),

            "weaknesses":
            weaknesses.strip(),

            "communication_score":
            communication_score,

            "technical_score":
            technical_score,

            "confidence_score":
            confidence_score,

            "improvement_suggestions":
            improvement_suggestions.strip(),

            "summary":
             summary,

            "status":
            "completed"

        }), 201


    except Exception as e:

        if connection:

            connection.rollback()


        return jsonify({

            "message":
            "Failed to generate final interview report",

            "error":
            str(e)

        }), 500


    finally:

        if cursor:

            cursor.close()


        if connection:

            connection.close()