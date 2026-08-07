import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Interview() {

    const navigate = useNavigate();

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);

    // ==========================================
    // INTERVIEW STATE
    // ==========================================

    const [sessionId, setSessionId] = useState(null);

    const [questionNumber, setQuestionNumber] = useState(1);

    const [totalQuestions, setTotalQuestions] = useState(0);

    const [question, setQuestion] = useState("");

    const [interviewType, setInterviewType] =
        useState("mixed");


    // ==========================================
    // MEDIA STATE
    // ==========================================

    const [cameraAllowed, setCameraAllowed] =
        useState(false);

    const [micAllowed, setMicAllowed] =
        useState(false);


    // ==========================================
    // SPEECH STATE
    // ==========================================

    const [isListening, setIsListening] =
        useState(false);

    const [transcript, setTranscript] =
        useState("");


    // ==========================================
    // UI STATE
    // ==========================================

    const [loading, setLoading] =
        useState(true);

    const [starting, setStarting] =
        useState(false);

    const [submitting, setSubmitting] =
        useState(false);

    const [evaluation, setEvaluation] =
        useState("");

    const [score, setScore] =
        useState(null);

    const [error, setError] =
        useState("");

    const [speechSupported, setSpeechSupported] =
        useState(true);

    const [interviewCompleted, setInterviewCompleted] =
        useState(false);


    // ==========================================
    // START CAMERA + MICROPHONE
    // ==========================================

    const startMedia = async () => {

    setError("");

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user",
                    width: {
                        ideal: 1280
                    },
                    height: {
                        ideal: 720
                    }
                },

                audio: true

            });


        streamRef.current = stream;

        setCameraAllowed(true);

        setMicAllowed(true);


        // Attach camera stream to video element
        if (videoRef.current) {

            videoRef.current.srcObject =
                stream;

            try {

                await videoRef.current.play();

            } catch (err) {

                console.log(
                    "Video play error:",
                    err
                );

            }

        }

    } catch (err) {

        console.error(
            "Camera/Microphone error:",
            err
        );

        setCameraAllowed(false);

        setMicAllowed(false);

        setError(
            "Unable to access camera or microphone. Please check browser permissions."
        );

    }

};
    useEffect(() => {

    if (
        cameraAllowed &&
        sessionId &&
        streamRef.current &&
        videoRef.current
    ) {

        videoRef.current.srcObject =
            streamRef.current;

        videoRef.current
            .play()
            .catch((err) => {

                console.log(
                    "Video play error:",
                    err
                );

            });

    }

}, [cameraAllowed, sessionId]);


    // ==========================================
    // START INTERVIEW
    // ==========================================

    const startInterview = async () => {

        setError("");

        setStarting(true);

        try {

            const response = await api.post(
                "/interview/start",
                {
                    interview_type: interviewType,
                    number_of_questions: 5
                }
            );


            const data = response.data;


            console.log(
                "Interview started:",
                data
            );


            setSessionId(
                data.session_id
            );


            setQuestionNumber(
                data.current_question || 1
            );


            setTotalQuestions(
                data.total_questions || 0
            );


            setQuestion(
                data.question || ""
            );


            setInterviewType(
                data.interview_type || "mixed"
            );


            setTranscript("");

            setEvaluation("");

            setScore(null);

            setInterviewCompleted(false);


        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to start interview."
            );


        } finally {

            setStarting(false);

        }

    };


    // ==========================================
    // SPEECH RECOGNITION SETUP
    // ==========================================

    useEffect(() => {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            setSpeechSupported(false);

            return;

        }


        const recognition =
            new SpeechRecognition();


        recognition.continuous = true;

        recognition.interimResults = true;

        recognition.lang = "en-US";


        recognition.onresult = (event) => {

            let finalText = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const text =
                    event.results[i][0].transcript;


                if (
                    event.results[i].isFinal
                ) {

                    finalText += text;

                }

            }


            if (finalText) {

                setTranscript(
                    (previous) =>
                        previous +
                        finalText +
                        " "
                );

            }

        };


        recognition.onerror = (event) => {

            console.error(
                "Speech recognition error:",
                event.error
            );

            setIsListening(false);

        };


        recognition.onend = () => {

            setIsListening(false);

        };


        recognitionRef.current =
            recognition;


        return () => {

            recognition.stop();

        };

    }, []);


    // ==========================================
    // START LISTENING
    // ==========================================

    const startListening = () => {

        setError("");


        if (!speechSupported) {

            setError(
                "Speech recognition is not supported. Please use Google Chrome."
            );

            return;

        }


        if (!micAllowed) {

            setError(
                "Please allow microphone access first."
            );

            return;

        }


        if (!sessionId) {

            setError(
                "Please start the interview first."
            );

            return;

        }


        try {

            recognitionRef.current.start();

            setIsListening(true);

        } catch (err) {

            console.error(err);

        }

    };


    // ==========================================
    // STOP LISTENING
    // ==========================================

    const stopListening = () => {

        if (recognitionRef.current) {

            recognitionRef.current.stop();

        }

        setIsListening(false);

    };


    // ==========================================
    // SUBMIT ANSWER
    // ==========================================

    const submitAnswer = async () => {

        setError("");

        setEvaluation("");

        setScore(null);


        if (!sessionId) {

            setError(
                "Interview session not found."
            );

            return;

        }


        if (!question) {

            setError(
                "No interview question available."
            );

            return;

        }


        if (!transcript.trim()) {

            setError(
                "Please provide an answer before submitting."
            );

            return;

        }


        if (isListening) {

            stopListening();

        }


        setSubmitting(true);


        try {

            const response = await api.post(

                "/practice/submit-answer",

                {

                    session_id:
                        sessionId,

                    question:
                        question,

                    answer:
                        transcript.trim(),

                    question_number:
                        questionNumber

                }

            );


            const data =
                response.data;


            console.log(
                "Answer evaluation:",
                data
            );


            setScore(
                data.score
            );


            setEvaluation(
                data.evaluation || ""
            );


            // ==================================
            // INTERVIEW COMPLETED
            // ==================================

           if (
    data.status ===
    "completed"
) {

    try {

        // Generate and save the final report
        const reportResponse = await api.get(
            `/interview/int${sessionId}/final-report`
        );

        console.log(
            "Final report generated:",
            reportResponse.data
        );

        setInterviewCompleted(true);

    } catch (reportError) {

        console.error(
            "Final report generation failed:",
            reportError
        );

        setError(
            reportError.response?.data?.message ||
            "Interview completed, but final report generation failed."
        );

    }

    return;
}


            // ==================================
            // GET NEXT QUESTION
            // ==================================

            if (
                data.status ===
                "active"
            ) {

                const nextQuestionNumber =
                    data.next_question_number;


                const nextResponse =
                    await api.get(

                        `/interview/int${sessionId}/next-question`

                    );


                const nextData =
                    nextResponse.data;


                console.log(
                    "Next question:",
                    nextData
                );


                setQuestionNumber(
                    nextData.question_number ||
                    nextQuestionNumber
                );


                setQuestion(
                    nextData.question ||
                    ""
                );


                setTranscript("");

                setEvaluation("");

                setScore(null);

            }


        } catch (err) {

            console.error(err);

            setError(

                err.response?.data?.message ||
                "Failed to submit answer."

            );

        } finally {

            setSubmitting(false);

        }

    };


    // ==========================================
    // CLEAR ANSWER
    // ==========================================

    const clearAnswer = () => {

        setTranscript("");

        setEvaluation("");

        setScore(null);

    };


    // ==========================================
    // LOAD INTERVIEW PAGE
    // ==========================================

    useEffect(() => {

        const initialize = async () => {

            try {

                await startMedia();

            } catch (err) {

                console.error(err);

            } finally {

                setLoading(false);

            }

        };


        initialize();

    }, []);


    // ==========================================
    // CLEANUP
    // ==========================================

    useEffect(() => {

        return () => {

            if (
                recognitionRef.current
            ) {

                recognitionRef.current.stop();

            }


            if (
                streamRef.current
            ) {

                streamRef.current
                    .getTracks()
                    .forEach(
                        (track) =>
                            track.stop()
                    );

            }

        };

    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

                <p className="text-lg">
                    Preparing interview environment...
                </p>

            </div>

        );

    }


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="min-h-screen bg-slate-950 text-white">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="border-b border-slate-800">

                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">


                    <div>

                        <h1 className="text-2xl font-bold">
                            SpeakUp AI
                        </h1>

                        <p className="text-sm text-slate-400">
                            AI Mock Interview
                        </p>

                    </div>


                    {sessionId && (

                        <div className="text-sm text-slate-400">

                            Question{" "}

                            {questionNumber}

                            {" "}of{" "}

                            {totalQuestions}

                        </div>

                    )}

                </div>

            </header>


            {/* ==================================
                MAIN
            ================================== */}

            <main className="max-w-7xl mx-auto px-6 py-8">


                {/* ERROR */}

                {error && (

                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">

                        {error}

                    </div>

                )}


                {/* =================================
                    INTERVIEW START SECTION
                ================================= */}

                {!sessionId && (

                    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8">

                        <h2 className="text-3xl font-bold mb-3">
                            Start Your AI Interview
                        </h2>

                        <p className="text-slate-400 mb-8">
                            Your uploaded resume will be used
                            to generate personalized questions.
                        </p>


                        {/* INTERVIEW TYPE */}

                        <label className="block text-sm text-slate-300 mb-2">

                            Interview Type

                        </label>


                        <select
                            value={interviewType}
                            onChange={(e) =>
                                setInterviewType(
                                    e.target.value
                                )
                            }
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 mb-6"
                        >

                            <option value="mixed">
                                Mixed
                            </option>

                            <option value="technical">
                                Technical
                            </option>

                            <option value="hr">
                                HR
                            </option>

                        </select>


                        {/* MEDIA STATUS */}

                        <div className="grid grid-cols-2 gap-4 mb-6">

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">

                                <p className="text-sm text-slate-400">
                                    Camera
                                </p>

                                <p className="mt-1">

                                    {cameraAllowed
                                        ? "🟢 Ready"
                                        : "🔴 Not available"}

                                </p>

                            </div>


                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">

                                <p className="text-sm text-slate-400">
                                    Microphone
                                </p>

                                <p className="mt-1">

                                    {micAllowed
                                        ? "🟢 Ready"
                                        : "🔴 Not available"}

                                </p>

                            </div>

                        </div>


                        <button
                            onClick={startInterview}
                            disabled={
                                starting ||
                                !cameraAllowed ||
                                !micAllowed
                            }
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {starting
                                ? "Generating Interview..."
                                : "Start Interview"}

                        </button>

                    </div>

                )}


                {/* =================================
                    ACTIVE INTERVIEW
                ================================= */}

                {sessionId &&
                !interviewCompleted && (

                    <>

                        {/* CAMERA + QUESTION */}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                            {/* CAMERA */}

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                                <h2 className="text-xl font-semibold mb-4">
                                    Camera
                                </h2>


                                <div className="aspect-video bg-black rounded-xl overflow-hidden">

                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />

                                </div>


                                <div className="mt-4 flex gap-5 text-sm">

                                    <span>

                                        {cameraAllowed
                                            ? "🟢 Camera"
                                            : "🔴 Camera"}

                                    </span>


                                    <span>

                                        {micAllowed
                                            ? "🟢 Microphone"
                                            : "🔴 Microphone"}

                                    </span>

                                </div>

                            </div>


                            {/* QUESTION */}

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                                <p className="text-sm text-blue-400 mb-3">

                                    {interviewType}
                                    {" "}Interview

                                </p>


                                <h2 className="text-2xl font-bold leading-relaxed">

                                    {question}

                                </h2>


                                <div className="mt-8 p-5 rounded-xl bg-slate-950 border border-slate-800">

                                    <p className="text-sm text-slate-400 mb-2">
                                        Interview Tip
                                    </p>

                                    <p className="text-slate-300">

                                        Speak clearly and support
                                        your answer with specific
                                        examples from your projects.

                                    </p>

                                </div>

                            </div>

                        </div>


                        {/* =================================
                            ANSWER AREA
                        ================================= */}

                        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">


                            <div className="flex justify-between items-center mb-5">

                                <div>

                                    <h2 className="text-xl font-semibold">
                                        Your Answer
                                    </h2>

                                    <p className="text-sm text-slate-400 mt-1">

                                        {isListening
                                            ? "Listening..."
                                            : "Click Start Answer and begin speaking."}

                                    </p>

                                </div>


                                {isListening && (

                                    <div className="flex items-center gap-2 text-red-400">

                                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />

                                        Recording

                                    </div>

                                )}

                            </div>


                            {/* TRANSCRIPT */}

                            <div className="min-h-40 p-5 rounded-xl bg-slate-950 border border-slate-800">

                                {transcript ? (

                                    <p className="text-slate-200 leading-relaxed">

                                        {transcript}

                                    </p>

                                ) : (

                                    <p className="text-slate-500">

                                        Your speech will appear here...

                                    </p>

                                )}

                            </div>


                            {/* BUTTONS */}

                            <div className="flex flex-wrap gap-4 mt-5">


                                {!isListening ? (

                                    <button
                                        onClick={
                                            startListening
                                        }
                                        disabled={
                                            !micAllowed ||
                                            submitting
                                        }
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold disabled:opacity-50"
                                    >

                                        🎤 Start Answer

                                    </button>

                                ) : (

                                    <button
                                        onClick={
                                            stopListening
                                        }
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-semibold"
                                    >

                                        ⏹ Stop Answer

                                    </button>

                                )}


                                <button
                                    onClick={
                                        clearAnswer
                                    }
                                    disabled={
                                        !transcript ||
                                        submitting
                                    }
                                    className="px-6 py-3 border border-slate-700 rounded-xl hover:bg-slate-800 disabled:opacity-40"
                                >

                                    Clear Answer

                                </button>


                                <button
                                    onClick={
                                        submitAnswer
                                    }
                                    disabled={
                                        !transcript ||
                                        isListening ||
                                        submitting
                                    }
                                    className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold disabled:opacity-40"
                                >

                                    {submitting
                                        ? "Evaluating..."
                                        : "Submit Answer"}

                                </button>

                            </div>


                            {/* EVALUATION */}

                            {evaluation && (

                                <div className="mt-8 p-6 bg-slate-950 border border-slate-800 rounded-xl">

                                    <div className="flex justify-between items-center mb-4">

                                        <h3 className="text-lg font-semibold">

                                            AI Evaluation

                                        </h3>


                                        {score !== null && (

                                            <span className="text-2xl font-bold text-green-400">

                                                {score}/100

                                            </span>

                                        )}

                                    </div>


                                    <p className="text-slate-300 whitespace-pre-line">

                                        {evaluation}

                                    </p>

                                </div>

                            )}

                        </div>

                    </>

                )}


                {/* =================================
                    COMPLETED
                ================================= */}

                {interviewCompleted && (

                    <div className="max-w-2xl mx-auto text-center bg-slate-900 border border-slate-800 rounded-2xl p-10">

                        <div className="text-6xl mb-5">
                            🎉
                        </div>


                        <h2 className="text-3xl font-bold">
                            Interview Completed
                        </h2>


                        <p className="text-slate-400 mt-3">
                            Your answers have been evaluated
                            successfully.
                        </p>


                        {score !== null && (

                            <div className="mt-6">

                                <p className="text-slate-400">
                                    Last Answer Score
                                </p>

                                <p className="text-5xl font-bold text-green-400 mt-2">
                                    {score}/100
                                </p>

                            </div>

                        )}


                        <button
                            onClick={() =>
                                navigate(
                                    `/report/${sessionId}`
                                )
                            }
                            className="mt-8 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                        >

                            View Final Report

                        </button>

                    </div>

                )}

            </main>

        </div>

    );

}

export default Interview;