import React from 'react'
import { Route, Routes } from 'react-router-dom'
import CodeConceptExtractor from './components/IT22601360/CodeConceptExtractor'
import Chatbot from './AI Interview/Chatbot'
//import AIInterview from './component/AIInterview'
import LiveInterview from './component/IT22639226/LiveKitRoom'
import Face from './modules/AI Interview/Face'

import Form from './pages/Login_signup/Form'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/face" element={<Face />} />
        <Route path="/" element={<Form />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/code" element={<CodeConceptExtractor />} />
        <Route path="/livekit"element={<LiveInterview/>}/>  
      </Routes>
    </>
  )
}

export default App
