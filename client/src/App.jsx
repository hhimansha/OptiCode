import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import AssessmentUI from "./component/IT22604194/AssessmentUI";
import Form from "./Login_signup/Form";
import TaskEditor from "./component/IT22604194/TaskEditor";
import Chatbot from './AI Interview/Chatbot';
import LiveInterview from './component/IT22639226/LiveKitRoom';
import Face from './modules/AI Interview/Face';
import AssessmentPage from "./component/IT22604194/AssessmentPage";
import AssessmentResultPage from "./component/IT22604194/AssessmentResultPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/result" element={<AssessmentResultPage />} />
        <Route path="/exercise" element={<TaskEditor />} />
        <Route path="/face" element={<Face />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/livekit" element={<LiveInterview />} />
      </Routes>
    </BrowserRouter>
  );
}
