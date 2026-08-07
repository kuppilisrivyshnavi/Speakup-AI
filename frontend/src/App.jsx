import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ResumeUpload from "./pages/ResumeUpload/ResumeUpload";
import Interview from "./pages/Interview/Interview";
import InterviewHistory from "./pages/InterviewHistory/InterviewHistory";
import Report from "./pages/Report/Report";
import NotFound from "./pages/NotFound/NotFound";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
    path="/login"
    element={<Login />}
/>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/resume"
                    element={<ResumeUpload />}
                />

                <Route
                    path="/interview"
                    element={<Interview />}
                />

                <Route
                    path="/history"
                    element={<InterviewHistory />}
                />

                <Route
                    path="/report/:sessionId"
                    element={<Report />}
                />

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;