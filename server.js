// server.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

const potValues = []; // Array untuk menyimpan history nilai potensiometer

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/potensiometer', (req, res) => {
  const potValue = parseInt(req.query.value);
  
  // Menambah nilai ke array dan membatasi array menjadi 10 elemen terbaru
  potValues.push(potValue);
  if (potValues.length > 10) {
    potValues.shift(); // Menghapus elemen paling awal jika sudah lebih dari 10
  }

  io.emit('potensiometer', potValue); // Mengirim nilai potensiometer ke semua klien terhubung
  io.emit('history', potValues); // Mengirim history nilai potensiometer ke semua klien terhubung
  res.send('OK');
});

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('requestHistory', () => {
    // Mengirim history nilai potensiometer ke klien yang meminta
    socket.emit('history', potValues);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
