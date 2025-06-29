import React, { useState, useEffect } from "react";
import socket from "../services/socket";
import PollResults from "./PollResults";
import ChatPopup from "./ChatPopup";

export default function StudentPanel() {
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState("");
  const [results, setResults] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [timer, setTimer] = useState(60);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (name) socket.emit("studentJoined", name);

    socket.on("newPoll", (p) => {
      setPoll(p);
      setTimer(60);
    });

    socket.on("resultsUpdated", ({ results, totalVotes }) => {
      setResults(results);
      setTotalVotes(totalVotes);
    });

    socket.on("pollEnded", () => {
      setPoll(null);
      setResults({});
      setTotalVotes(0);
    });

    socket.on("kicked", () => {
      alert("You were kicked out");
      setName("");
      localStorage.removeItem("name");
      window.location.reload();
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    const interval = setInterval(() => setTimer(t => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(interval);
  }, [name]);

  const submit = () => {
    if (selected) socket.emit("submitAnswer", selected);
    setSelected("");
  };

  const joinPoll = () => {
    if (name.trim().length < 2) {
      alert("Please enter a valid name (min 2 characters).");
      return;
    }
    localStorage.setItem("name", name);
    socket.emit("studentJoined", name);
  };

  if (!name)
    return (
      <div className="panel">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <button onClick={joinPoll}>Join Poll</button>
      </div>
    );

  if (!poll)
    return (
      <div className="panel">
        Waiting for poll…
        <ChatPopup socket={socket} username={name} messages={messages} />
      </div>
    );

  return (
    <div className="panel">
      <h2>{poll.question}</h2>
      {poll.options.map((opt, i) => (
        <div key={i}>
          <input
            type="radio"
            value={opt}
            checked={selected === opt}
            onChange={() => setSelected(opt)}
          />{" "}
          {opt}
        </div>
      ))}
      <button onClick={submit}>Submit</button>
      <div>Time left: {timer} sec</div>

      <PollResults results={results} totalVotes={totalVotes} />

      <ChatPopup socket={socket} username={name} messages={messages} />
    </div>
  );
}
