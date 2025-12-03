import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Face from './modules/AI Interview/Face'
import History from './pages/IT22606860/History'

import Form from './pages/Login_signup/Form'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/face" element={<Face />} />
        <Route path="login" element={<Form />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </>
  )
}

export default App
