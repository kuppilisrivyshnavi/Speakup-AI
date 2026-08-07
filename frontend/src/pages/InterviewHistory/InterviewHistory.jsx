import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";


function InterviewHistory() {

    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const response = await api.get(
                    "/interview/history"
                );

                console.log(
                    "Interview History:",
                    response.data
                );

                setHistory(
                    response.data.history
                );


            } catch(err) {

                console.error(
                    "History error:",
                    err
                );

                setError(
                    err.response?.data?.message ||
                    "Failed to load interview history."
                );

            }
            finally {

                setLoading(false);

            }

        };


        fetchHistory();

    }, []);



    if (loading) {

        return (

            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

                <h2 className="text-xl">
                    Loading interview history...
                </h2>

            </div>

        );

    }



    return (

        <div className="min-h-screen bg-slate-950 text-white">


            {/* Header */}

            <header className="border-b border-slate-800">

                <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">


                    <div>

                        <h1 className="text-3xl font-bold">
                            SpeakUp AI
                        </h1>

                        <p className="text-slate-400">
                            Previous Interview Attempts
                        </p>

                    </div>


                    <button

                        onClick={() =>
                            navigate("/dashboard")
                        }

                        className="px-5 py-2 bg-blue-600 rounded-xl hover:bg-blue-700"

                    >

                        Dashboard

                    </button>


                </div>

            </header>



            <main className="max-w-6xl mx-auto px-6 py-8">


                <h2 className="text-4xl font-bold mb-8">

                    Interview History

                </h2>



                {
                    error && (

                        <div className="bg-red-900/40 border border-red-700 p-4 rounded-xl">

                            {error}

                        </div>

                    )
                }



                {
                    history.length === 0 ? (

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                            <h3 className="text-xl">

                                No interviews completed yet

                            </h3>


                            <button

                                onClick={() =>
                                    navigate("/interview")
                                }

                                className="mt-5 px-6 py-3 bg-blue-600 rounded-xl"

                            >

                                Start Interview

                            </button>


                        </div>


                    ) : (


                        <div className="space-y-6">


                            {
                                history.map(
                                    (item) => (

                                    <div

                                        key={item.session_id}

                                        className="bg-slate-900 border border-slate-800 rounded-2xl p-6"

                                    >


                                        <div className="flex justify-between items-start mb-5">


                                            <div>

                                                <h3 className="text-2xl font-bold">

                                                    {item.interview_type.toUpperCase()} Interview

                                                </h3>


                                                <p className="text-slate-400 mt-2">

                                                    Completed: {item.completed_at}

                                                </p>


                                                <p className="text-slate-400">

                                                    Session ID: {item.session_id}

                                                </p>


                                            </div>



                                            <div className="text-center">

                                                <p className="text-4xl font-bold text-blue-400">

                                                    {item.overall_score}

                                                </p>

                                                <p className="text-sm text-slate-400">

                                                    Overall Score

                                                </p>


                                            </div>


                                        </div>





                                        {/* Scores */}

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">


                                            <div className="bg-slate-950 rounded-xl p-4">

                                                <p className="text-slate-400 text-sm">

                                                    Technical

                                                </p>

                                                <p className="text-xl font-bold text-purple-400">

                                                    {item.technical_score}/100

                                                </p>

                                            </div>



                                            <div className="bg-slate-950 rounded-xl p-4">

                                                <p className="text-slate-400 text-sm">

                                                    Communication

                                                </p>

                                                <p className="text-xl font-bold text-green-400">

                                                    {item.communication_score}/100

                                                </p>

                                            </div>



                                            <div className="bg-slate-950 rounded-xl p-4">

                                                <p className="text-slate-400 text-sm">

                                                    Confidence

                                                </p>

                                                <p className="text-xl font-bold text-yellow-400">

                                                    {item.confidence_score}/100

                                                </p>

                                            </div>



                                            <div className="bg-slate-950 rounded-xl p-4">

                                                <p className="text-slate-400 text-sm">

                                                    Questions

                                                </p>

                                                <p className="text-xl font-bold">

                                                    {item.total_questions}

                                                </p>

                                            </div>


                                        </div>





                                        {/* Summary */}

                                        <div className="bg-slate-950 rounded-xl p-4 mb-5">

                                            <h4 className="font-semibold mb-2">

                                                AI Summary

                                            </h4>


                                            <p className="text-slate-300 leading-relaxed">

                                                {item.summary}

                                            </p>


                                        </div>





                                        <button

                                            onClick={() =>
                                                navigate(
                                                    `/report/${item.session_id}`
                                                )
                                            }

                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold"

                                        >

                                            View Full Report

                                        </button>



                                    </div>

                                ))

                            }


                        </div>


                    )

                }


            </main>


        </div>

    );

}


export default InterviewHistory;