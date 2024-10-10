const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let gameState = {
    currentPlayer: 'Ruperto',
    score: {'Ruperto': 100000, 'Juan': 100000, 'Mauricio': 100000},
    diamondStates: [
        {available: true, emoji: '💎'},
        {available: true, emoji: '💎'},
        {available: true, emoji: '☀️'},
        {available: true, emoji: '☀️'}
    ],
    goldBarStates: [
        {available: true, emoji: '💰'},
        {available: true, emoji: '💰'},
        {available: true, emoji: '🥇'},
        {available: true, emoji: '🥇'}
    ],
    rubyStates: [
        {available: true, emoji: '🔴'},
        {available: true, emoji: '🔴'},
        {available: true, emoji: '🍀'},
        {available: true, emoji: '🍀'}
    ],
    trophyStates: [
        {available: true, emoji: '💚'},
        {available: true, emoji: '💚'},
        {available: true, emoji: '🏆'},
        {available: true, emoji: '🏆'}
    ],
    takenRowsByPlayer: {Ruperto: [], Juan: [], Mauricio: []},
    takenCount: 0,
    timeLeft: 10,
};

app.use(express.static('public'));

const resetGame = () => {
    gameState.currentPlayer = 'Ruperto';
    gameState.takenCount = 0;
    gameState.timeLeft = 10;
    
    // Reiniciar estados de las fichas
    const resetStates = (states) => states.map(state => ({...state, available: true}));
    gameState.diamondStates = resetStates(gameState.diamondStates);
    gameState.goldBarStates = resetStates(gameState.goldBarStates);
    gameState.rubyStates = resetStates(gameState.rubyStates);
    gameState.trophyStates = resetStates(gameState.trophyStates);
    
    // Reiniciar filas tomadas por jugador
    Object.keys(gameState.takenRowsByPlayer).forEach(player => {
        gameState.takenRowsByPlayer[player] = [];
    });
    
    // Emitir el estado reiniciado a todos los clientes
    io.emit('gameReset', gameState);
};

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('initialState', gameState);

    socket.on('updateState', (updatedState) => {
        gameState = updatedState;
        
        // Verificar si se han tomado todas las fichas
        if (gameState.takenCount === 16) {
            resetGame();
        } else {
            io.emit('stateChanged', gameState);
        }
    });

    socket.on('registerPlayer', (username) => {
        gameState.score[username] = 100000;
        gameState.takenRowsByPlayer[username] = [];
        io.emit('updatePlayersList', Object.keys(gameState.score));
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});