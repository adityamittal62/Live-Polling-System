import React, { useState } from "react";

export default function ChatPopup({ socket, username, messages = [] }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const send = () => {
    if (text.trim() !== "") {
      socket.emit("sendMessage", `${username}: ${text}`);
      setText("");
    }
  };

  return (
    <div className="chat-popup">
      <button className="chat-toggle" onClick={() => setOpen(!open)}>💬</button>
      {open && (
        <div className="chat-window">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i}>{m}</div>
            ))}
          </div>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type message" />
          <button onClick={send}>Send</button>
        </div>
      )}
    </div>
  );
}
