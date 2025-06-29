const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let currentPoll = null;
let pastPolls = [];
let students = {};
let submittedAnswers = {};  // track submissions per socket.id

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("studentJoined", (name) => {
    students[socket.id] = name;
    io.emit("studentsUpdated", Object.values(students));
  });

  socket.on("createPoll", (data) => {
    currentPoll = { ...data, results: {}, totalVotes: 0, startTime: Date.now() };
    submittedAnswers = {};  // reset on new poll
    io.emit("newPoll", currentPoll);
  });

  socket.on("submitAnswer", (answer) => {
    if (!currentPoll) return;
    if (submittedAnswers[socket.id]) return;  // disallow multiple votes

    if (!currentPoll.results[answer]) currentPoll.results[answer] = 0;
    currentPoll.results[answer]++;
    currentPoll.totalVotes++;
    submittedAnswers[socket.id] = true;

    io.emit("resultsUpdated", {
      results: currentPoll.results,
      totalVotes: currentPoll.totalVotes,
    });

    if (currentPoll.totalVotes >= Object.keys(students).length) {
      io.emit("resultsUpdated", currentPoll.results); // final push
      pastPolls.push(currentPoll);
      currentPoll = null;
      io.emit("pollEnded", pastPolls);
    }
  });

  socket.on("sendMessage", (msg) => {
    io.emit("newMessage", msg);
  });

  socket.on("kickStudent", (name) => {
    const idToKick = Object.keys(students).find((id) => students[id] === name);
    if (idToKick) {
      io.to(idToKick).emit("kicked");
      delete students[idToKick];
      delete submittedAnswers[idToKick];
      io.emit("studentsUpdated", Object.values(students));
    }
  });

  socket.on("disconnect", () => {
    delete students[socket.id];
    delete submittedAnswers[socket.id];
    io.emit("studentsUpdated", Object.values(students));
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
