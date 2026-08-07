import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter email and password.");
            return;
        }

        try {

            setLoading(true);

            const data = await loginUser(
                email,
                password
            );

            // Save JWT token
            localStorage.setItem(
                "token",
                data.token
            );

            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Go to dashboard
            navigate("/dashboard");

        } catch (err) {

            console.error(err);

            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Unable to connect to the server."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo / Brand */}

                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold text-white">
                        SpeakUp AI
                    </h1>

                    <p className="text-slate-400 mt-2">
                        Your AI-powered interview coach
                    </p>

                </div>


                {/* Login Card */}

                <div className="bg-white rounded-2xl shadow-2xl p-8">

                    <h2 className="text-2xl font-bold text-slate-900">
                        Welcome back
                    </h2>

                    <p className="text-slate-500 mt-1 mb-6">
                        Sign in to continue your interview practice.
                    </p>


                    {/* Error */}

                    {error && (

                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>

                    )}


                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Email */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />

                        </div>


                        {/* Password */}

                        <div>

                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>

                            <div className="relative">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 pr-20 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium"
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* Login Button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign In"}

                        </button>

                    </form>


                    {/* Register */}

                    <p className="text-center text-sm text-slate-500 mt-6">

                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Create account
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;