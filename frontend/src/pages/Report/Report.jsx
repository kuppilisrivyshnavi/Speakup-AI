import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function Report() {

    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const fetchReport = async () => {

            try {

                setLoading(true);
                setError("");

                const response = await api.get(
                    `/interview/report/int${sessionId}`
                );

                console.log(
                    "Interview report:",
                    response.data
                );

                setReport(
                    response.data.report
                );

            } catch (err) {

                console.error(
                    "Failed to fetch report:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load interview report."
                );

            } finally {

                setLoading(false);

            }

        };

        if (sessionId) {
            fetchReport();
        }

    }, [sessionId]);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

                <div className="text-center">

                    <div className="text-4xl mb-4">
                        📊
                    </div>

                    <p className="text-lg text-slate-300">
                        Loading your interview report...
                    </p>

                </div>

            </div>

        );

    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error || !report) {

        return (

            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">

                <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                    <div className="text-5xl mb-5">
                        ⚠️
                    </div>

                    <h1 className="text-2xl font-bold mb-3">
                        Unable to Load Report
                    </h1>

                    <p className="text-red-400 mb-6">
                        {error || "Interview report not found."}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                    >
                        Back to Dashboard
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="min-h-screen bg-slate-950 text-white">


            {/* ==================================
                HEADER
            ================================== */}

            <header className="border-b border-slate-800">

                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

                    <div>

                        <h1 className="text-2xl font-bold">
                            SpeakUp AI
                        </h1>

                        <p className="text-sm text-slate-400">
                            Interview Performance Report
                        </p>

                    </div>


                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="px-5 py-2.5 border border-slate-700 rounded-xl hover:bg-slate-800"
                    >
                        Dashboard
                    </button>

                </div>

            </header>


            <main className="max-w-7xl mx-auto px-6 py-8">


                {/* ==================================
                    TITLE
                ================================== */}

                <div className="mb-8">

                    <p className="text-blue-400 text-sm font-medium">
                        INTERVIEW COMPLETED
                    </p>

                    <h2 className="text-4xl font-bold mt-2">
                        Your Interview Report
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Here is your detailed AI-powered performance analysis.
                    </p>

                </div>


                {/* ==================================
                    SCORE CARDS
                ================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">


                    {/* OVERALL */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400 text-sm">
                            Overall Score
                        </p>

                        <p className="text-4xl font-bold text-blue-400 mt-3">
                            {report.overall_score}/100
                        </p>

                    </div>


                    {/* TECHNICAL */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400 text-sm">
                            Technical
                        </p>

                        <p className="text-4xl font-bold text-purple-400 mt-3">
                            {report.technical_score}/100
                        </p>

                    </div>


                    {/* COMMUNICATION */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400 text-sm">
                            Communication
                        </p>

                        <p className="text-4xl font-bold text-green-400 mt-3">
                            {report.communication_score}/100
                        </p>

                    </div>


                    {/* CONFIDENCE */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400 text-sm">
                            Confidence
                        </p>

                        <p className="text-4xl font-bold text-yellow-400 mt-3">
                            {report.confidence_score}/100
                        </p>

                    </div>

                </div>


                {/* ==================================
                    SUMMARY
                ================================== */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">

                    <h3 className="text-xl font-semibold mb-4">
                        📝 AI Summary
                    </h3>

                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                        {report.summary || "No summary available."}
                    </p>

                </div>


                {/* ==================================
                    STRENGTHS / WEAKNESSES
                ================================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">


                    {/* STRENGTHS */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <h3 className="text-xl font-semibold mb-4">
                            ⭐ Strengths
                        </h3>

                        <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                            {report.strengths || "No strengths recorded."}
                        </div>

                    </div>


                    {/* WEAKNESSES */}

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <h3 className="text-xl font-semibold mb-4">
                            ⚠️ Areas to Improve
                        </h3>

                        <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                            {report.weaknesses || "No weaknesses recorded."}
                        </div>

                    </div>

                </div>


                {/* ==================================
                    IMPROVEMENT SUGGESTIONS
                ================================== */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">

                    <h3 className="text-xl font-semibold mb-4">
                        💡 Improvement Suggestions
                    </h3>

                    <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                        {report.improvement_suggestions ||
                            "No improvement suggestions available."}
                    </div>

                </div>


                {/* ==================================
                    QUESTION-BY-QUESTION ANALYSIS
                ================================== */}

                <div className="mb-8">

                    <h3 className="text-2xl font-bold mb-5">
                        Question-by-Question Analysis
                    </h3>


                    <div className="space-y-5">

                        {report.questions &&
                        report.questions.length > 0 ? (

                            report.questions.map(
                                (item, index) => (

                                    <div
                                        key={index}
                                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                                    >

                                        <div className="flex justify-between items-start gap-4 mb-5">

                                            <div>

                                                <p className="text-sm text-blue-400 mb-2">
                                                    Question {item.question_number}
                                                </p>

                                                <h4 className="text-lg font-semibold leading-relaxed">
                                                    {item.question}
                                                </h4>

                                            </div>


                                            <div className="shrink-0 text-center">

                                                <p className="text-2xl font-bold text-green-400">
                                                    {item.score}/100
                                                </p>

                                                <p className="text-xs text-slate-500">
                                                    Score
                                                </p>

                                            </div>

                                        </div>


                                        <div className="mb-5">

                                            <p className="text-sm text-slate-400 mb-2">
                                                Your Answer
                                            </p>

                                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">

                                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                                    {item.answer}
                                                </p>

                                            </div>

                                        </div>


                                        <div>

                                            <p className="text-sm text-slate-400 mb-2">
                                                AI Feedback
                                            </p>

                                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">

                                                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                                                    {item.feedback}
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                )

                            )

                        ) : (

                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-400">
                                No question analysis available.
                            </div>

                        )}

                    </div>

                </div>


                {/* ==================================
                    FOOTER ACTIONS
                ================================== */}

                <div className="flex flex-wrap gap-4 pt-4">

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className="px-7 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"
                    >
                        ← Back to Dashboard
                    </button>


                    <button
                        onClick={() =>
                            navigate("/history")
                        }
                        className="px-7 py-3 border border-slate-700 hover:bg-slate-800 rounded-xl font-semibold"
                    >
                        View Interview History
                    </button>

                </div>

            </main>

        </div>

    );

}

export default Report;