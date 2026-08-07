import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function ResumeUpload() {

    const navigate = useNavigate();

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (event) => {

        const selectedFile = event.target.files[0];

        setError("");
        setMessage("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        // Only allow PDF/DOC/DOCX
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!allowedTypes.includes(selectedFile.type)) {

            setError(
                "Please upload a PDF, DOC, or DOCX file."
            );

            setFile(null);
            return;
        }

        setFile(selectedFile);
    };


    const handleUpload = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");

        if (!file) {

            setError(
                "Please select your resume first."
            );

            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append(
                "resume",
                file
            );

            const response = await api.post(
                "/resume/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            console.log(
                "Resume upload response:",
                response.data
            );

            setMessage(
                response.data.message ||
                "Resume uploaded successfully."
            );

            // Give the user a moment to see success
            setTimeout(() => {
                navigate("/interview");
            }, 1000);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to upload resume."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-slate-950 text-white">

            {/* NAVBAR */}

            <nav className="border-b border-slate-800">

                <div className="max-w-6xl mx-auto px-6 py-4">

                    <h1 className="text-2xl font-bold">
                        SpeakUp AI
                    </h1>

                </div>

            </nav>


            {/* CONTENT */}

            <main className="max-w-3xl mx-auto px-6 py-12">

                <div className="mb-8">

                    <h2 className="text-3xl font-bold">
                        Upload Your Resume
                    </h2>

                    <p className="text-slate-400 mt-2">
                        We'll use your resume to generate
                        personalized interview questions.
                    </p>

                </div>


                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">


                    {/* ERROR */}

                    {error && (

                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                            {error}
                        </div>

                    )}


                    {/* SUCCESS */}

                    {message && (

                        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
                            {message}
                        </div>

                    )}


                    <form onSubmit={handleUpload}>


                        {/* FILE AREA */}

                        <label
                            htmlFor="resume"
                            className="block cursor-pointer"
                        >

                            <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-blue-500 transition">

                                <div className="text-5xl mb-4">
                                    📄
                                </div>

                                <h3 className="text-xl font-semibold">
                                    {file
                                        ? file.name
                                        : "Choose your resume"}
                                </h3>

                                <p className="text-slate-400 mt-2">
                                    PDF, DOC or DOCX
                                </p>

                                {!file && (

                                    <p className="text-blue-400 mt-4">
                                        Click to browse
                                    </p>

                                )}

                            </div>

                        </label>


                        <input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                        />


                        {/* UPLOAD BUTTON */}

                        <button
                            type="submit"
                            disabled={!file || loading}
                            className="w-full mt-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >

                            {loading
                                ? "Uploading..."
                                : "Upload Resume"}

                        </button>

                    </form>


                    {/* BACK */}

                    <button
                        onClick={() => navigate("/dashboard")}
                        className="w-full mt-3 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 transition"
                    >
                        Back to Dashboard
                    </button>

                </div>

            </main>

        </div>
    );
}

export default ResumeUpload;