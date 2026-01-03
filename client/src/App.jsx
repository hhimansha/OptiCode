import React from 'react'
import { Route, Routes } from 'react-router-dom'

// Pages
import Home from './pages/IT22606860/Home'
import RefactorPage from './pages/IT22606860/RefactorPage'
import History from './pages/IT22606860/History'
import Face from './modules/AI Interview/Face.jsx'
import Form from './pages/Login_signup/Form'

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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
