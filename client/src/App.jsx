import React from 'react'
import { Route, Routes, BrowserRouter } from 'react-router-dom'
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


import Interviewquestion from './component/IT22639226/Interviewquestion';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/result" element={<AssessmentResultPage />} />
        <Route path="/exercise" element={<TaskEditor />} />
        <Route path="/face" element={<Face />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/code" element={<CodeConceptExtractor />} />
        <Route path="/livekit"element={<LiveInterview/>}/>  
        <Route path="/interview" element={<Interviewquestion/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
