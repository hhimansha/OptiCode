import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Face from './AI Interview/Face'

import Form from './Login_signup/Form'

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
