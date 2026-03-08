import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CodeConceptExtractor from './component/IT22601360/CodeConceptExtractor'
//import AIInterview from './component/AIInterview'
import './App.css';
import AssessmentUI from "./component/IT22604194/AssessmentUI";
import Form from "./Login_signup/Form";
import TaskEditor from "./component/IT22604194/TaskEditor";
import Chatbot from './AI Interview/Chatbot';
import LiveInterview from './component/IT22639226/LiveKitRoom';
import Face from './modules/AI Interview/Face';
import AssessmentPage from "./component/IT22604194/AssessmentPage";
import AssessmentResultPage from "./component/IT22604194/AssessmentResultPage";
import StudentProfile from "./component/IT22604194/StudentProfile";
import ConceptChatbot from "./component/IT22604194/ConceptChatbot";
import DemoPage from "./component/IT22604194/DemoPage";

// Pages
import Home from './pages/IT22606860/Home'
import RefactorPage from './pages/IT22606860/RefactorPage'
import History from './pages/IT22606860/History'
import Interviewquestion from './component/IT22639226/Interviewquestion'

// // Components
// import Header from './components/IT22606860/Header'
// import Footer from './components/IT22606860/Footer'

const App = () => {
  return (
    <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/refactor" element={<RefactorPage />} />
        <Route path="/history" element={<History />} />
        <Route path="/" element={<Form />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/result" element={<AssessmentResultPage />} />
        <Route path="/exercise" element={<TaskEditor />} />
        <Route path="/face" element={<Face />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/code" element={<CodeConceptExtractor />} />
        <Route path="/livekit"element={<LiveInterview/>}/>  
        <Route path="/interview" element={<Interviewquestion/>} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/concept-tutor" element={<ConceptChatbot />} />
        <Route path="/demo" element={<DemoPage />} />
      </Routes>
  );
}

export default App;
