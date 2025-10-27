import { GameType } from '../types';

// Base interface for all game states
export interface BaseGameState {
  currentPlayer: string;
  players: string[];
  winner?: string;
  isDraw?: boolean;
  timeRemaining?: number;
}

// UNO specific types
export interface UnoCard {
  color: 'red' | 'blue' | 'green' | 'yellow' | 'wild';
  value: string | number;
  id: string;
}

export interface UnoGameState extends BaseGameState {
  deck: UnoCard[];
  discardPile: UnoCard[];
  playerHands: Map<string, UnoCard[]>;
  currentColor?: string;
  direction: 1 | -1;
  drawStack: number;
}

// Chess specific types
export type ChessPiece = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type ChessColor = 'white' | 'black';

export interface ChessSquare {
  piece?: ChessPiece;
  color?: ChessColor;
}

export interface ChessGameState extends BaseGameState {
  board: ChessSquare[][];
  currentTurn: ChessColor;
  enPassant?: string;
  castling: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
  inCheck: boolean;
  checkmate: boolean;
  stalemate: boolean;
  moveHistory: ChessMove[];
}

export interface ChessMove {
  from: string;
  to: string;
  piece: ChessPiece;
  captured?: ChessPiece;
  promotion?: ChessPiece;
  notation: string;
}

// Checkers specific types
export interface CheckersPiece {
  color: 'red' | 'black';
  isKing: boolean;
}

export interface CheckersGameState extends BaseGameState {
  board: (CheckersPiece | null)[][];
  currentTurn: 'red' | 'black';
  mustCapture: boolean;
  captureSequence: string[];
  moveHistory: CheckersMove[];
}

export interface CheckersMove {
  from: [number, number];
  to: [number, number];
  captured?: [number, number][];
  becameKing?: boolean;
}

class GameLogicService {
  // Validate move based on game type
  validateMove(gameType: GameType, gameState: any, move: any): boolean {
    switch (gameType) {
      case GameType.UNO:
        return this.validateUnoMove(gameState, move);
      case GameType.CHESS:
        return this.validateChessMove(gameState, move);
      case GameType.CHECKERS:
        return this.validateCheckersMove(gameState, move);
      default:
        return false;
    }
  }

  // Apply move to game state
  applyMove(gameType: GameType, gameState: any, move: any): any {
    switch (gameType) {
      case GameType.UNO:
        return this.applyUnoMove(gameState, move);
      case GameType.CHESS:
        return this.applyChessMove(gameState, move);
      case GameType.CHECKERS:
        return this.applyCheckersMove(gameState, move);
      default:
        return gameState;
    }
  }

  // Check if game is over
  checkGameOver(gameType: GameType, gameState: any): { isOver: boolean; winner?: string; isDraw?: boolean } {
    switch (gameType) {
      case GameType.UNO:
        return this.checkUnoGameOver(gameState);
      case GameType.CHESS:
        return this.checkChessGameOver(gameState);
      case GameType.CHECKERS:
        return this.checkCheckersGameOver(gameState);
      default:
        return { isOver: false };
    }
  }

  // UNO Logic
  private validateUnoMove(state: UnoGameState, move: any): boolean {
    const { cardId, playerId, color } = move;
    const playerHand = state.playerHands.get(playerId);
    
    if (!playerHand) return false;
    
    const card = playerHand.find(c => c.id === cardId);
    if (!card) return false;
    
    const topCard = state.discardPile[state.discardPile.length - 1];
    
    // Wild cards can always be played
    if (card.color === 'wild') return true;
    
    // Match color or value
    return card.color === topCard.color || card.value === topCard.value;
  }

  private applyUnoMove(state: UnoGameState, move: any): UnoGameState {
    const newState = { ...state };
    const { cardId, playerId, color } = move;
    
    // Remove card from player's hand
    const playerHand = newState.playerHands.get(playerId)!;
    const cardIndex = playerHand.findIndex(c => c.id === cardId);
    const [card] = playerHand.splice(cardIndex, 1);
    
    // Add to discard pile
    newState.discardPile.push(card);
    
    // Handle special cards
    if (card.value === 'skip') {
      // Skip next player
      const currentIndex = newState.players.indexOf(playerId);
      const nextIndex = (currentIndex + newState.direction + newState.players.length) % newState.players.length;
      newState.currentPlayer = newState.players[nextIndex];
    } else if (card.value === 'reverse') {
      newState.direction *= -1;
    } else if (card.value === 'draw2') {
      newState.drawStack += 2;
    } else if (card.value === 'draw4') {
      newState.drawStack += 4;
      newState.currentColor = color;
    } else if (card.color === 'wild') {
      newState.currentColor = color;
    }
    
    // Move to next player
    const currentIndex = newState.players.indexOf(playerId);
    const nextIndex = (currentIndex + newState.direction + newState.players.length) % newState.players.length;
    newState.currentPlayer = newState.players[nextIndex];
    
    return newState;
  }

  private checkUnoGameOver(state: UnoGameState): { isOver: boolean; winner?: string } {
    for (const [playerId, hand] of state.playerHands.entries()) {
      if (hand.length === 0) {
        return { isOver: true, winner: playerId };
      }
    }
    return { isOver: false };
  }

  // Chess Logic
  private validateChessMove(state: ChessGameState, move: ChessMove): boolean {
    // Simplified validation - implement full chess rules
    const { from, to } = move;
    
    // Convert notation to board indices
    const fromCol = from.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRow = parseInt(from[1]) - 1;
    const toCol = to.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRow = parseInt(to[1]) - 1;
    
    const piece = state.board[fromRow][fromCol];
    if (!piece || piece.color !== state.currentTurn) return false;
    
    // Basic move validation based on piece type
    switch (piece.piece) {
      case 'pawn':
        return this.validatePawnMove(state, fromRow, fromCol, toRow, toCol);
      case 'rook':
        return this.validateRookMove(state, fromRow, fromCol, toRow, toCol);
      case 'knight':
        return this.validateKnightMove(fromRow, fromCol, toRow, toCol);
      case 'bishop':
        return this.validateBishopMove(state, fromRow, fromCol, toRow, toCol);
      case 'queen':
        return this.validateQueenMove(state, fromRow, fromCol, toRow, toCol);
      case 'king':
        return this.validateKingMove(state, fromRow, fromCol, toRow, toCol);
      default:
        return false;
    }
  }

  private validatePawnMove(state: ChessGameState, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const piece = state.board[fromRow][fromCol];
    const direction = piece?.color === 'white' ? 1 : -1;
    const startRow = piece?.color === 'white' ? 1 : 6;
    
    // Forward move
    if (fromCol === toCol) {
      if (toRow === fromRow + direction && !state.board[toRow][toCol].piece) {
        return true;
      }
      // Double move from start
      if (fromRow === startRow && toRow === fromRow + 2 * direction && 
          !state.board[toRow][toCol].piece && !state.board[fromRow + direction][fromCol].piece) {
        return true;
      }
    }
    
    // Capture
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction) {
      const targetPiece = state.board[toRow][toCol];
      if (targetPiece.piece && targetPiece.color !== piece?.color) {
        return true;
      }
    }
    
    return false;
  }

  private validateRookMove(state: ChessGameState, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Rook moves horizontally or vertically
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    // Check path is clear
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (state.board[currentRow][currentCol].piece) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    // Check destination
    const targetPiece = state.board[toRow][toCol];
    const movingPiece = state.board[fromRow][fromCol];
    
    return !targetPiece.piece || targetPiece.color !== movingPiece.color;
  }

  private validateKnightMove(fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  private validateBishopMove(state: ChessGameState, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Bishop moves diagonally
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
    
    // Check path is clear
    const rowStep = toRow > fromRow ? 1 : -1;
    const colStep = toCol > fromCol ? 1 : -1;
    
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
    
    while (currentRow !== toRow) {
      if (state.board[currentRow][currentCol].piece) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    
    // Check destination
    const targetPiece = state.board[toRow][toCol];
    const movingPiece = state.board[fromRow][fromCol];
    
    return !targetPiece.piece || targetPiece.color !== movingPiece.color;
  }

  private validateQueenMove(state: ChessGameState, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Queen moves like rook or bishop
    return this.validateRookMove(state, fromRow, fromCol, toRow, toCol) || 
           this.validateBishopMove(state, fromRow, fromCol, toRow, toCol);
  }

  private validateKingMove(state: ChessGameState, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // King moves one square in any direction
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if (rowDiff > 1 || colDiff > 1) {
      // Check for castling
      return this.validateCastling(state, fromRow, fromCol, toRow, toCol);
    }
    
    // Check destination
    const targetPiece = state.board[toRow][toCol];
    const movingPiece = state.board[fromRow][fromCol];
    
    return !targetPiece.piece || targetPiece.color !== movingPiece.color;
  }

  private validateCastling(state: ChessGameState, fromRow: number, fromCol: number, toRow: number, toCol: number): boolean {
    // Simplified castling validation
    if (state.inCheck) return false;
    
    const color = state.board[fromRow][fromCol].color;
    const row = color === 'white' ? 0 : 7;
    
    if (fromRow !== row || toRow !== row) return false;
    
    // King side castling
    if (toCol === 6) {
      if (color === 'white' && !state.castling.whiteKingSide) return false;
      if (color === 'black' && !state.castling.blackKingSide) return false;
      
      // Check squares are empty
      return !state.board[row][5].piece && !state.board[row][6].piece;
    }
    
    // Queen side castling
    if (toCol === 2) {
      if (color === 'white' && !state.castling.whiteQueenSide) return false;
      if (color === 'black' && !state.castling.blackQueenSide) return false;
      
      // Check squares are empty
      return !state.board[row][1].piece && !state.board[row][2].piece && !state.board[row][3].piece;
    }
    
    return false;
  }

  private applyChessMove(state: ChessGameState, move: ChessMove): ChessGameState {
    const newState = { ...state };
    
    // Convert notation to board indices
    const fromCol = move.from.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromRow = parseInt(move.from[1]) - 1;
    const toCol = move.to.charCodeAt(0) - 'a'.charCodeAt(0);
    const toRow = parseInt(move.to[1]) - 1;
    
    // Move piece
    newState.board[toRow][toCol] = newState.board[fromRow][fromCol];
    newState.board[fromRow][fromCol] = {};
    
    // Handle promotion
    if (move.promotion) {
      newState.board[toRow][toCol].piece = move.promotion;
    }
    
    // Update castling rights
    if (move.piece === 'king') {
      if (newState.currentTurn === 'white') {
        newState.castling.whiteKingSide = false;
        newState.castling.whiteQueenSide = false;
      } else {
        newState.castling.blackKingSide = false;
        newState.castling.blackQueenSide = false;
      }
    }
    
    // Switch turns
    newState.currentTurn = newState.currentTurn === 'white' ? 'black' : 'white';
    
    // Add to move history
    newState.moveHistory.push(move);
    
    return newState;
  }

  private checkChessGameOver(state: ChessGameState): { isOver: boolean; winner?: string; isDraw?: boolean } {
    if (state.checkmate) {
      return { isOver: true, winner: state.currentTurn === 'white' ? 'black' : 'white' };
    }
    
    if (state.stalemate) {
      return { isOver: true, isDraw: true };
    }
    
    return { isOver: false };
  }

  // Checkers Logic
  private validateCheckersMove(state: CheckersGameState, move: CheckersMove): boolean {
    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    
    const piece = state.board[fromRow][fromCol];
    if (!piece || piece.color !== state.currentTurn) return false;
    
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    // Must be diagonal
    if (rowDiff !== colDiff) return false;
    
    // Check if destination is empty
    if (state.board[toRow][toCol]) return false;
    
    // Simple move
    if (rowDiff === 1) {
      if (state.mustCapture) return false; // Must capture if possible
      
      // Regular pieces can only move forward
      if (!piece.isKing) {
        const direction = piece.color === 'red' ? 1 : -1;
        return (toRow - fromRow) * direction > 0;
      }
      
      return true;
    }
    
    // Capture move
    if (rowDiff === 2) {
      const middleRow = (fromRow + toRow) / 2;
      const middleCol = (fromCol + toCol) / 2;
      const middlePiece = state.board[middleRow][middleCol];
      
      return middlePiece !== null && middlePiece.color !== piece.color;
    }
    
    return false;
  }

  private applyCheckersMove(state: CheckersGameState, move: CheckersMove): CheckersGameState {
    const newState = { ...state };
    const [fromRow, fromCol] = move.from;
    const [toRow, toCol] = move.to;
    
    // Move piece
    newState.board[toRow][toCol] = newState.board[fromRow][fromCol];
    newState.board[fromRow][fromCol] = null;
    
    // Handle capture
    const rowDiff = Math.abs(toRow - fromRow);
    if (rowDiff === 2) {
      const middleRow = (fromRow + toRow) / 2;
      const middleCol = (fromCol + toCol) / 2;
      newState.board[middleRow][middleCol] = null;
      
      // Check for additional captures
      if (this.hasMoreCaptures(newState, toRow, toCol)) {
        newState.captureSequence.push(`${toRow},${toCol}`);
        return newState; // Same player continues
      }
    }
    
    // Check for king promotion
    const piece = newState.board[toRow][toCol];
    if (piece && !piece.isKing) {
      if ((piece.color === 'red' && toRow === 7) || 
          (piece.color === 'black' && toRow === 0)) {
        piece.isKing = true;
        move.becameKing = true;
      }
    }
    
    // Switch turns
    newState.currentTurn = newState.currentTurn === 'red' ? 'black' : 'red';
    newState.captureSequence = [];
    
    // Add to move history
    newState.moveHistory.push(move);
    
    return newState;
  }

  private hasMoreCaptures(state: CheckersGameState, row: number, col: number): boolean {
    const piece = state.board[row][col];
    if (!piece) return false;
    
    // Check all diagonal directions for possible captures
    const directions = [
      [-2, -2], [-2, 2], [2, -2], [2, 2]
    ];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) continue;
      
      const middleRow = row + dr / 2;
      const middleCol = col + dc / 2;
      const middlePiece = state.board[middleRow][middleCol];
      
      if (middlePiece && middlePiece.color !== piece.color && !state.board[newRow][newCol]) {
        return true;
      }
    }
    
    return false;
  }

  private checkCheckersGameOver(state: CheckersGameState): { isOver: boolean; winner?: string } {
    let redPieces = 0;
    let blackPieces = 0;
    let redCanMove = false;
    let blackCanMove = false;
    
    // Count pieces and check for possible moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (!piece) continue;
        
        if (piece.color === 'red') {
          redPieces++;
          if (!redCanMove && this.hasPossibleMoves(state, row, col)) {
            redCanMove = true;
          }
        } else {
          blackPieces++;
          if (!blackCanMove && this.hasPossibleMoves(state, row, col)) {
            blackCanMove = true;
          }
        }
      }
    }
    
    // Check win conditions
    if (redPieces === 0 || !redCanMove) {
      return { isOver: true, winner: 'black' };
    }
    
    if (blackPieces === 0 || !blackCanMove) {
      return { isOver: true, winner: 'red' };
    }
    
    return { isOver: false };
  }

  private hasPossibleMoves(state: CheckersGameState, row: number, col: number): boolean {
    const piece = state.board[row][col];
    if (!piece || piece.color !== state.currentTurn) return false;
    
    // Check all possible moves
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : piece.color === 'red' 
        ? [[1, -1], [1, 1]]
        : [[-1, -1], [-1, 1]];
    
    for (const [dr, dc] of directions) {
      // Check simple move
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && !state.board[newRow][newCol]) {
        return true;
      }
      
      // Check capture
      const captureRow = row + dr * 2;
      const captureCol = col + dc * 2;
      if (captureRow >= 0 && captureRow < 8 && captureCol >= 0 && captureCol < 8) {
        const middlePiece = state.board[newRow][newCol];
        if (middlePiece && middlePiece.color !== piece.color && !state.board[captureRow][captureCol]) {
          return true;
        }
      }
    }
    
    return false;
  }
}

export const gameLogicService = new GameLogicService();