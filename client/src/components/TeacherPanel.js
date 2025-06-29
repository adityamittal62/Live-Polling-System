import React, { useState, useEffect } from "react";
import socket from "../services/socket";
import PollResults from "./PollResults";
import ChatPopup from "./ChatPopup";

export default function TeacherPanel() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [results, setResults] = useState({});
  const [students, setStudents] = useState([]);
  const [pastPolls, setPastPolls] = useState([]);
  const [currentTotal, setCurrentTotal] = useState(0);

  useEffect(() => {
    socket.on("resultsUpdated", (data) => {
      setResults(data.results);
      setCurrentTotal(data.totalVotes);
    });

    socket.on("studentsUpdated", (data) => setStudents(data));

    socket.on("pollEnded", (past) => {
      setPastPolls(past);
      setResults({});
      setCurrentTotal(0);
    });
  }, []);

  const startPoll = () => {
    socket.emit("createPoll", { question, options });
    setQuestion("");
    setOptions(["", ""]);
  };

  const kickStudent = (name) => {
    socket.emit("kickStudent", name);
  };

  return (
    <div className="panel">
      <h2>Teacher Panel</h2>
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Enter question"
      />
      {options.map((opt, i) => (
        <input
          key={i}
          value={opt}
          onChange={(e) => {
            const newOpts = [...options];
            newOpts[i] = e.target.value;
            setOptions(newOpts);
          }}
          placeholder={`Option ${i + 1}`}
        />
      ))}
      <button onClick={() => setOptions([...options, ""])}>Add Option</button>
      <button onClick={startPoll}>Start Poll</button>

      <h3>Students</h3>
      {students.map((s, i) => (
        <div key={i}>
          {s} <button onClick={() => kickStudent(s)}>Kick</button>
        </div>
      ))}

      <h3>Live Results</h3>
      <PollResults results={results} totalVotes={currentTotal} />

      <h3>Past Polls</h3>
      <ul>
        {pastPolls.map((p, i) => (
          <li key={i}>
            <strong>{p.question}</strong>
            <ul>
              {Object.entries(p.results).map(([opt, count], idx) => {
                const percentage = ((count / p.totalVotes) * 100).toFixed(1);
                return (
                  <li key={idx}>
                    {opt} — {count} votes ({percentage}%)
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <ChatPopup socket={socket} username="Teacher" />
    </div>
  );
}
