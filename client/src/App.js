import React, { useState } from "react";
import StudentPanel from "./components/StudentPanel";
import TeacherPanel from "./components/TeacherPanel";
import "./App.css";

export default function App() {
  const [role, setRole] = useState(null);

  if (!role) {
    return (
      <div className="selector-screen">
        <h1>Welcome to the Live Polling System</h1>
        <button onClick={() => setRole("student")} className="selector-button">I'm a Student</button>
        <button onClick={() => setRole("teacher")} className="selector-button">I'm a Teacher</button>
      </div>
    );
  }

  return role === "student" ? <StudentPanel /> : <TeacherPanel />;
}
