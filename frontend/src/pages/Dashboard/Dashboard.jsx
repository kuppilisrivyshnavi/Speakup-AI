import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const response = await api.get(
                    "/interview/dashboard"
                );

                setDashboard(response.data);

            } catch (err) {

                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Failed to load dashboard."
                );

            } finally {

                setLoading(false);
            }
        };

        loadDashboard();

    }, []);


    const handleLogout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };


    if (loading) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">

                <p className="text-white text-lg">
                    Loading dashboard...
                </p>

            </div>
        );
    }


    if (error) {

        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">

                <div className="bg-white rounded-xl p-8 text-center">

                    <h2 className="text-xl font-bold text-red-600 mb-3">
                        Unable to load dashboard
                    </h2>

                    <p className="text-slate-600 mb-5">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );


    return (

        <div className="min-h-screen bg-slate-950 text-white">

            {/* NAVBAR */}

            <nav className="border-b border-slate-800">

                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold">
                            SpeakUp AI
                        </h1>

                        <p className="text-sm text-slate-400">
                            AI Interview Coach
                        </p>

                    </div>


                    <div className="flex items-center gap-5">

                        <span className="text-slate-300">
                            Hi, {user.name || "Candidate"}
                        </span>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </nav>


            {/* MAIN */}

            <main className="max-w-7xl mx-auto px-6 py-10">

                <div className="mb-10">

                    <h2 className="text-3xl font-bold">
                        Interview Dashboard
                    </h2>

                    <p className="text-slate-400 mt-2">
                        Track your interview performance and improve your skills.
                    </p>

                </div>


                {/* STAT CARDS */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400">
                            Total Interviews
                        </p>

                        <p className="text-4xl font-bold mt-3">
                            {dashboard.total_interviews}
                        </p>

                    </div>


                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400">
                            Average Score
                        </p>

                        <p className="text-4xl font-bold mt-3">
                            {dashboard.average_score}
                        </p>

                        <p className="text-sm text-slate-500 mt-1">
                            out of 100
                        </p>

                    </div>


                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400">
                            Highest Score
                        </p>

                        <p className="text-4xl font-bold mt-3">
                            {dashboard.highest_score}
                        </p>

                    </div>


                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                        <p className="text-slate-400">
                            Lowest Score
                        </p>

                        <p className="text-4xl font-bold mt-3">
                            {dashboard.lowest_score}
                        </p>

                    </div>

                </div>


                {/* START INTERVIEW */}

                <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-8 mb-10">

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                        <div>

                            <h3 className="text-2xl font-bold">
                                Ready for your next interview?
                            </h3>

                            <p className="text-blue-100 mt-2">
                                Practice with AI-generated questions based on your resume.
                            </p>

                        </div>


                        <button
                            onClick={() => navigate("/resume")}
                            className="px-7 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition"
                        >
                            Start Interview
                        </button>

                    </div>

                </div>


                {/* RECENT INTERVIEWS */}

                <div className="bg-slate-900 border border-slate-800 rounded-2xl">

                    <div className="p-6 border-b border-slate-800">

                        <div className="flex items-center justify-between">

                            <div>

                                <h3 className="text-xl font-bold">
                                    Recent Interviews
                                </h3>

                                <p className="text-sm text-slate-400 mt-1">
                                    Your latest interview performance
                                </p>

                            </div>


                            <button
                                onClick={() => navigate("/history")}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                View All
                            </button>

                        </div>

                    </div>


                    <div className="overflow-x-auto">

                        {dashboard.recent_interviews?.length > 0 ? (

                            <table className="w-full">

                                <thead>

                                    <tr className="text-left text-sm text-slate-400 border-b border-slate-800">

                                        <th className="px-6 py-4">
                                            Type
                                        </th>

                                        <th className="px-6 py-4">
                                            Score
                                        </th>

                                        <th className="px-6 py-4">
                                            Technical
                                        </th>

                                        <th className="px-6 py-4">
                                            Communication
                                        </th>

                                        <th className="px-6 py-4">
                                            Confidence
                                        </th>

                                        <th className="px-6 py-4">
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {dashboard.recent_interviews.map(
                                        (interview) => (

                                            <tr
                                                key={interview.interview_session_id}
                                                className="border-b border-slate-800 last:border-0"
                                            >

                                                <td className="px-6 py-4 capitalize">
                                                    {interview.interview_type}
                                                </td>

                                                <td className="px-6 py-4 font-bold">
                                                    {interview.overall_score}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {interview.technical_score}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {interview.communication_score}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {interview.confidence_score}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400">

                                                        {interview.status}

                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        ) : (

                            <div className="p-10 text-center text-slate-400">

                                No interviews completed yet.

                            </div>

                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;