import os
import json
from groq import Groq
from dotenv import load_dotenv
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "llama-3.3-70b-versatile"
)


if not GROQ_API_KEY:
    raise ValueError(
        "GROQ_API_KEY is missing in the .env file"
    )


client = Groq(
    api_key=GROQ_API_KEY
)


# ==========================================
# GENERATE INTERVIEW QUESTIONS
# ==========================================
def generate_interview_questions(
    resume_text,
    interview_type="mixed",
    number_of_questions=5
):

    prompt = f"""
You are an expert AI interview coach.

Analyze the candidate's resume and generate
personalized mock interview questions.

Interview type:
{interview_type}

Number of questions:
{number_of_questions}

Resume:
----------------
{resume_text}
----------------

Requirements:

1. Questions must be based on the candidate's resume.
2. Include questions about skills, projects,
   education, internships, and experience.
3. Avoid generic questions when possible.
4. Questions should be suitable for a mock interview.
5. Return ONLY valid JSON.
6. The JSON must contain an array called "questions".
7. Each question must be a string.
8. Generate exactly the requested number of questions.

Return this format:

{{
    "questions": [
        "Question 1",
        "Question 2",
        "Question 3"
    ]
}}
"""

    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[

            {
                "role": "system",

                "content": (
                    "You are a professional AI interview "
                    "coach who creates personalized "
                    "interview questions."
                )
            },

            {
                "role": "user",

                "content": prompt
            }

        ],

        temperature=0.7,

        max_tokens=1500

    )


    result = (
        response
        .choices[0]
        .message
        .content
        .strip()
    )

    # ==========================================
    # REMOVE MARKDOWN CODE FENCES
    # ==========================================

    if result.startswith("```json"):

        result = result.replace(
            "```json",
            "",
            1
        ).strip()

    if result.startswith("```"):

        result = result.replace(
            "```",
            "",
            1
        ).strip()


    if result.endswith("```"):

        result = result[:-3].strip()


    # ==========================================
    # PARSE JSON RESPONSE
    # ==========================================

    try:

        data = json.loads(result)

        questions = data.get(
            "questions",
            []
        )

        return questions


    except json.JSONDecodeError:

        # ==========================================
        # FALLBACK IF MODEL RETURNS PLAIN TEXT
        # ==========================================

        lines = result.splitlines()

        questions = []


        for line in lines:

            line = line.strip()


            if not line:

                continue


            # Remove numbering
            if line[0].isdigit():

                parts = line.split(
                    ".",
                    1
                )

                if len(parts) == 2:

                    line = parts[1].strip()


            if line:

                questions.append(line)


        return questions
# ==========================================
# EVALUATE INTERVIEW ANSWER
# ==========================================
def evaluate_interview_answer(
    question,
    answer
):

    # ==========================================
    # VALIDATE QUESTION
    # ==========================================

    if not question:

        return (
            "SCORE: 0\n\n"
            "FEEDBACK:\n"
            "No interview question was provided "
            "for evaluation.\n\n"
            "STRENGTHS:\n"
            "Unable to evaluate.\n\n"
            "IMPROVEMENTS:\n"
            "Please provide a valid interview question.\n\n"
            "MODEL_ANSWER:\n"
            "Not available."
        )


    # ==========================================
    # VALIDATE ANSWER
    # ==========================================

    if not answer:

        return (
            "SCORE: 0\n\n"
            "FEEDBACK:\n"
            "No candidate answer was provided "
            "for evaluation.\n\n"
            "STRENGTHS:\n"
            "Unable to evaluate.\n\n"
            "IMPROVEMENTS:\n"
            "Please provide a valid candidate answer.\n\n"
            "MODEL_ANSWER:\n"
            "Not available."
        )
    # ==========================================
    # CREATE EVALUATION PROMPT
    # ==========================================

    prompt = f"""
You are an expert technical interview evaluator.

Your task is to evaluate the candidate's answer
to the EXACT interview question provided below.

IMPORTANT RULES:

1. Evaluate ONLY the question and answer provided.
2. DO NOT create a hypothetical question.
3. DO NOT invent a different question.
4. DO NOT assume that the question or answer is missing.
5. The text between QUESTION START and QUESTION END
   is the exact question asked to the candidate.
6. The text between ANSWER START and ANSWER END
   is the exact answer given by the candidate.
7. Evaluate the candidate's answer specifically
   against the exact question.
8. If the answer is incomplete, explain what is missing.
9. Give a score from 0 to 100.
10. Return the result in the exact format requested below.

==============================
QUESTION START
==============================

{question}

==============================
QUESTION END
==============================


==============================
ANSWER START
==============================

{answer}

==============================
ANSWER END
==============================


Evaluate the candidate's answer based on:

1. Relevance to the exact question
2. Technical accuracy
3. Clarity
4. Completeness
5. Communication quality


Return EXACTLY in this format:

SCORE: <number between 0 and 100>

FEEDBACK:
<detailed feedback specifically about the candidate's answer>
STRENGTHS:
<what the candidate did well>
IMPROVEMENTS:
<what the candidate should improve>
MODEL_ANSWER:
<a concise example of a strong answer to the exact question>
"""


    # ==========================================
    # CALL GROQ
    # ==========================================

    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[

            {
                "role": "system",

                "content": (
                    "You are a professional technical "
                    "and HR interview evaluator. "
                    "Always evaluate the exact question "
                    "and exact answer provided by the user. "
                    "Never invent hypothetical scenarios."
                )
            },

            {
                "role": "user",

                "content": prompt
            }

        ],

        temperature=0.2,

        max_tokens=1200

    )


    # ==========================================
    # GET GROQ RESPONSE
    # ==========================================

    result = (

        response
        .choices[0]
        .message
        .content
        .strip()

    )
    return result
# ==========================================
# GENERATE FINAL INTERVIEW REPORT
# ==========================================
def generate_final_interview_report(
    interview_questions,
    interview_answers,
    overall_score
):
    """
    Generate the final interview report using Groq.

    Parameters:
        interview_questions : list[str]
        interview_answers   : list[str]
        overall_score       : int

    Returns:
        dict
    """

    qa_text = ""

    for i in range(len(interview_questions)):

        qa_text += f"""
Question {i + 1}:
{interview_questions[i]}

Answer {i + 1}:
{interview_answers[i]}

----------------------------------------
"""


    prompt = f"""
You are an expert technical interviewer.

Below are all the interview questions and answers
given by a candidate.

Overall Interview Score:
{overall_score}

Interview Transcript:

{qa_text}

Analyze the complete interview.

Return ONLY valid JSON.

The JSON format MUST be exactly:

{{
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,

    "strengths": [
        "",
        "",
        ""
    ],

    "weaknesses": [
        "",
        "",
        ""
    ],

    "improvement_suggestions": [
        "",
        "",
        ""
    ],

    "summary": ""
}}

Rules:

1. Scores must be between 0 and 100.
2. strengths must contain exactly 3 points.
3. weaknesses must contain exactly 3 points.
4. improvement_suggestions must contain exactly 3 points.
5. summary should be 100-150 words.
6. Return ONLY JSON.
7. Do not use markdown.
8. Do not wrap the JSON inside ```.

"""


    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[

            {
                "role": "system",

                "content":
                "You are an expert HR and Technical Interview Evaluator."
            },

            {
                "role": "user",

                "content": prompt
            }

        ],

        temperature=0.2,

        max_tokens=1200

    )


    result = (

        response
        .choices[0]
        .message
        .content
        .strip()

    )


    # --------------------------------------
    # Remove markdown if returned
    # --------------------------------------

    if result.startswith("```json"):

        result = result.replace(
            "```json",
            "",
            1
        ).strip()


    if result.startswith("```"):

        result = result.replace(
            "```",
            "",
            1
        ).strip()


    if result.endswith("```"):

        result = result[:-3].strip()


    # --------------------------------------
    # Parse JSON safely
    # --------------------------------------

    try:

        report = json.loads(result)

        return report


    except Exception:

        return {

            "technical_score": overall_score,

            "communication_score": overall_score,

            "confidence_score": overall_score,

            "strengths": [

                "Good understanding of concepts.",

                "Attempted all interview questions.",

                "Demonstrated problem solving ability."

            ],

            "weaknesses": [

                "Needs deeper explanations.",

                "Could improve communication.",

                "Needs more confidence."

            ],

            "improvement_suggestions": [

                "Practice mock interviews.",

                "Improve technical depth.",

                "Answer using structured examples."

            ],

            "summary":

            "The candidate demonstrated a reasonable understanding "
            "of the interview topics. Continued practice, stronger "
            "technical explanations, and improved communication will "
            "help achieve better interview performance."

        }