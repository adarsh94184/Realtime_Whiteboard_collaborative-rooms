const memoryBoards = new Map();

const getMemoryBoard = (roomId) => memoryBoards.get(roomId);

const setMemoryBoard = (roomId, boardData) => memoryBoards.set(roomId, boardData);

module.exports = {
  memoryBoards,
  getMemoryBoard,
  setMemoryBoard
};
