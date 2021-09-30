const gameBoard = (() => {
    const board = new Array(9);

    const setField = (index, sign) => {
        board[index] = sign;
    }

    const getField = (index) => board[index];

    const getEmpty = () => {
        const forEmpty = [];

        for(let i = 0; i < board.length; i++)
            if(board[i] === undefined)
                forEmpty.push(i);
  
        return forEmpty;
    }

    const resetBoard = () => {
        board.forEach((child, i, arr) => arr[i] = undefined);
    }

    return {setField, getField, getEmpty, resetBoard};
})();

const Player = (sign) => {
    this.sign = sign;

    const getPlayerSign = () => sign;

    const setPlayerSign = (newSign) => sign = newSign;

    return {getPlayerSign, setPlayerSign};
}

const displayController = (() => {
    let mode = `vsPlayer`;

    const getMode = () => mode;

    // gameBoard fields
    const fields = document.querySelectorAll('#gameBoard div');
    
    fields.forEach((field, fieldIndex) => {
        field.addEventListener('click', () => {
            if(field.textContent !== '' || gameController.getGameStatus()) return;
            
            if(mode === `vsPlayer`) {
                gameController.humanGame(fieldIndex);
                _updateDisplayBoard();
            } else {
                gameController.aiGame(fieldIndex);
                _updateDisplayBoard();
            }
        });
    });
    
    const _updateDisplayBoard = () => {
        fields.forEach((field, i) => field.textContent = gameBoard.getField(i));
    }
    
    // Tic Tac Toe title & Result string
    const gameResult = document.querySelector('#postGame p');

    const displayGameResult = (result) => {
        if(result === 'draw') {
            gameResult.textContent = `It's a draw!`
            return;
        }

        gameResult.textContent = `Player ${result} won!`
    }

    // Restart button
    const reset = document.querySelector('#postGame button');
    reset.addEventListener('click', _resetPressed);
    
    function _resetPressed() {
        gameBoard.resetBoard();

        if(gameMode.textContent === `AI` && gameController.human.getPlayerSign() === `O`)
            gameBoard.setField(minimaxAI.moveAI(), gameController.bot.getPlayerSign());

        _updateDisplayBoard();
        gameController.infoReset();
        gameResult.textContent = `Tic Tac Toe`;
    }

    // gameMode toggler
    const footer = document.querySelector('#contentHolder footer');
    const options = document.getElementById('options');
    const gameMode = document.querySelector('#gameMode button');

    gameMode.addEventListener('click', _changeMode);

    function _changeMode(e) {
        e.target.classList = ``;

        if(e.target.textContent === `Player`) {
            e.target.classList.add(`vsAI`);
            e.target.textContent = `AI`;

            footer.style.visibility = `hidden`;
            options.style.visibility = `visible`;
            mode = `vsAI`;
        } else {
            e.target.classList.add(`vsPlayer`);
            e.target.textContent = `Player`;
            
            footer.style.visibility = `visible`;
            options.style.visibility = `hidden`;
            mode = `vsPlayer`;
        }

        _resetPressed();
    }

    // difficulties for AI mode
    const form = document.querySelector('#options form');
    form.addEventListener('change', _difficultyChanged);

    function _difficultyChanged(e) {
        if(e.target.value === `Normal`)
            minimaxAI.setDifficulty(50);
        
        else if(e.target.value === `Challenging`)
            minimaxAI.setDifficulty(75);
        
        else minimaxAI.setDifficulty(100);

        _resetPressed();
    }

    // playerSign changer for AI mode
    const signX = document.getElementById('signX');
    const signO = document.getElementById('signO');

    signX.addEventListener('click', () => {
        signX.classList.add('active');
        signO.classList.remove('active');

        gameController.human.setPlayerSign('X');
        gameController.bot.setPlayerSign('O');

        _resetPressed();
    });

    signO.addEventListener('click', () => {
        signO.classList.add('active');
        signX.classList.remove('active');

        gameController.human.setPlayerSign('O');
        gameController.bot.setPlayerSign('X');

        _resetPressed();
    });
    
    return {getMode, displayGameResult};
})();

const gameController = (() => {
    let moveCounter = 1;
    let gameOver = false;

    // Player vs Player
    const playerX = Player('X');
    const playerO = Player('O');
    
    const humanGame = (index) => {
        gameBoard.setField(index, _currentPlayerSign());

        if(checkWin(_currentPlayerSign())) {
            _forWin(_currentPlayerSign());
            return;
        }

        if(moveCounter === 9) {
            _forDraw();
            return;
        }

        moveCounter++;
    }

    const _currentPlayerSign = () => {
        return (moveCounter % 2 === 0) ? playerO.getPlayerSign() : playerX.getPlayerSign();
    }

    // Human vs AI
    const human = Player('X');
    const bot = Player('O');

    const aiGame = (index) => {
        gameBoard.setField(index, human.getPlayerSign());
        
        if(checkWin(human.getPlayerSign())) {
            _forWin(human.getPlayerSign());
            return;
        }

        gameBoard.setField(minimaxAI.moveAI(), bot.getPlayerSign());
        
        if(checkWin(bot.getPlayerSign())) {
            _forWin(bot.getPlayerSign());
            return;
        }

        if(moveCounter === 9) {
            _forDraw();
            return;
        }

        moveCounter += 2;
    }

    // Utility Functions
    const _forWin = (winner) => {
        displayController.displayGameResult(winner);
        gameOver = true;
    }

    const _forDraw = () => {
        displayController.displayGameResult('draw');
        gameOver = true;
    }

    const checkWin = (sign) => {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        return winPatterns.some(pattern => {
            return pattern.every(patternChild => gameBoard.getField(patternChild) === sign);
        });
    }

    const getGameStatus = () => gameOver;

    const infoReset = () => {
        moveCounter = (human.getPlayerSign() === `O`) ? 3 : 1;
        gameOver = false;
    }

    return {humanGame, human, bot, aiGame, checkWin, getGameStatus, infoReset};
})();

const minimaxAI = (() => {
    let difficultyLevel = 50;

    const setDifficulty = (level) => {
        difficultyLevel = level;
    }

    const moveAI = () => {
        const chance = Math.floor(Math.random() * 100) + 1;

        if(chance > difficultyLevel) {
            const availSpots = gameBoard.getEmpty();
            const randMove = Math.floor(Math.random() * availSpots.length);

            return availSpots[randMove];
        }

        return _minimax(gameBoard, gameController.bot).index;
    }

    // algo explanation from Sebastian Lague https://www.youtube.com/watch?v=l-hh51ncgDI
    // code from freeCodeCamp.org https://www.youtube.com/watch?v=P2TcQ3h0ipQ
    const _minimax = (board, player) => {
        const availSpots = board.getEmpty();

        if(gameController.checkWin(gameController.human.getPlayerSign()))
            return {score: -10};

        if(gameController.checkWin(gameController.bot.getPlayerSign()))
            return {score: 10};

        if(availSpots.length === 0)
            return {score: 0};

        const moves = [];

        for(let i = 0; i < availSpots.length; i++) {
            const move = {};

            move.index = availSpots[i];
            board.setField(availSpots[i], player.getPlayerSign());

            if(player.getPlayerSign() === gameController.bot.getPlayerSign()) {
                const result = _minimax(board, gameController.human);
                move.score = result.score;
            } else {
                const result = _minimax(board, gameController.bot);
                move.score = result.score;
            }

            board.setField(availSpots[i], undefined);
            moves.push(move);
        }

        return _getBestMove(moves, player);
    }
    
    const _getBestMove = (evaluatedMoves, player) => {
        let bestMove;
    
        if(player.getPlayerSign() === gameController.bot.getPlayerSign()) {
            let bestScore = -Infinity;
    
            for(let i = 0; i < evaluatedMoves.length; i++)
                if(evaluatedMoves[i].score > bestScore) {
                    bestScore = evaluatedMoves[i].score;
                    bestMove = i;
                }
    
        } else {
            let bestScore = Infinity;
    
            for(let i = 0; i < evaluatedMoves.length; i++)
                if(evaluatedMoves[i].score < bestScore) {
                    bestScore = evaluatedMoves[i].score;
                    bestMove = i;
                }
        }
    
        return evaluatedMoves[bestMove];
    }

    return {setDifficulty, moveAI}
})();