// import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Error404 from "./assets/pages/Error404.tsx";
import Landing from "./assets/pages/Landing.tsx";
import Login from "./assets/pages/Login.tsx";
import Signup from "./assets/pages/Signup.tsx"; 

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </>
  );
}

export default App;
