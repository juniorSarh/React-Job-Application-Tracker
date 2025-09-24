// import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Error404 from "./assets/pages/Error404.tsx";
import Landing from "./assets/pages/Landing.tsx";
import Login from "./assets/pages/Login.tsx";
import Signup from "./assets/pages/Signup.tsx"; 
import Home from "./assets/pages/Home.tsx"
import JobPage from "./assets/pages/JobPage.tsx";
import JobForm from "./assets/components/JobForm.tsx";
import JobList from "./assets/components/Jobslist.tsx";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/jobpage" element={<JobPage />} />
        <Route path="/jobform" element={<JobForm />} />
        <Route path="/jobform/:id" element={<JobForm />} />
        <Route path="/joblist" element={<JobList />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </>
  );
}

export default App;
