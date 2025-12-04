import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Face from './AI Interview/Face'
import Form from './Login_signup/Form'
import Chatbot from './AI Interview/Chatbot'
//import AIInterview from './component/AIInterview'
import LiveInterview from './component/IT22639226/LiveKitRoom'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/face" element={<Face />} />
        <Route path="/" element={<Form />} />
        <Route path="/chat" element={<Chatbot />} />
      
        <Route path="/livekit"element={<LiveInterview/>}/>  
      </Routes>
    </>
  )
}

export default App
