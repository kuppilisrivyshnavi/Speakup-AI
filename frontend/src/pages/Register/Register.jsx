import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {

            const response = await api.post(
                "/auth/register",
                formData
            );


            setMessage(
                response.data.message ||
                "Registration successful"
            );


            setTimeout(() => {

                navigate("/");

            }, 1500);


        } catch(err) {

            setError(
                err.response?.data?.message ||
                "Registration failed"
            );

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">


            <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800">


                <h1 className="text-3xl font-bold text-center mb-6">
                    Create Account
                </h1>


                {
                    message &&
                    <p className="text-green-400 mb-4 text-center">
                        {message}
                    </p>
                }


                {
                    error &&
                    <p className="text-red-400 mb-4 text-center">
                        {error}
                    </p>
                }



                <form onSubmit={handleSubmit}>


                    <input

                        type="text"

                        name="name"

                        placeholder="Full Name"

                        value={formData.name}

                        onChange={handleChange}

                        className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"

                        required

                    />



                    <input

                        type="email"

                        name="email"

                        placeholder="Email"

                        value={formData.email}

                        onChange={handleChange}

                        className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"

                        required

                    />



                    <input

                        type="password"

                        name="password"

                        placeholder="Password"

                        value={formData.password}

                        onChange={handleChange}

                        className="w-full mb-4 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700"

                        required

                    />



                    <button

                        type="submit"

                        className="w-full py-3 bg-blue-600 rounded-lg hover:bg-blue-700 font-semibold"

                    >

                        Register

                    </button>


                </form>



                <p className="text-center mt-5 text-slate-400">

                    Already have an account?

                    <button

                        onClick={() => navigate("/login")}

                        className="text-blue-400 ml-2"

                    >

                        Login

                    </button>

                </p>


            </div>


        </div>

    );

}


export default Register;