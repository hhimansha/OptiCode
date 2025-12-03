import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Face from './modules/AI Interview/Face'

import Form from './pages/Login_signup/Form'

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/face" element={<Face />} />
        
        <Route path="login" element={<Form/>}/>
      </Routes>
    </>
  )
}

export default App
