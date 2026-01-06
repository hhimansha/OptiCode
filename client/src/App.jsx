import React from 'react'
import { Route, Routes } from 'react-router-dom'

//import AIInterview from './component/AIInterview'
import LiveInterview from './component/IT22639226/LiveKitRoom'
import Face from './modules/AI Interview/Face'

// Pages
import Home from './pages/IT22606860/Home'
import RefactorPage from './pages/IT22606860/RefactorPage'
import History from './pages/IT22606860/History'
import Form from './pages/Login_signup/Form'
import Interviewquestion from './component/IT22639226/Interviewquestion'

// Components
import Header from './components/IT22606860/Header'
import Footer from './components/IT22606860/Footer'

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Header />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/refactor" element={<RefactorPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/face" element={<Face />} />
          <Route path="/login" element={<Form />} />
          <Route path="/livekit"element={<LiveInterview/>}/>  
        <Route path="/interview" element={<Interviewquestion/>} />
          
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
