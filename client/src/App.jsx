import React from 'react'
import { Route, Routes } from 'react-router-dom'

import Chatbot from './AI Interview/Chatbot'
//import AIInterview from './component/AIInterview'
import LiveInterview from './component/IT22639226/LiveKitRoom'
import Face from './modules/AI Interview/Face'

import Form from './pages/Login_signup/Form'
import Interviewquestion from './component/IT22639226/Interviewquestion'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/face" element={<Face />} />
        <Route path="/" element={<Form />} />
        <Route path="/chat" element={<Chatbot />} />
      
        <Route path="/livekit"element={<LiveInterview/>}/>  
        <Route path="/interview" element={<Interviewquestion/>} />
      </Routes>
    </>
  )
}

export default App
