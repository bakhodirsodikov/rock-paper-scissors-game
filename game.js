const crypto = require('crypto');

class KeyGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString('hex');
  }
}
class HmacCalculator {
  static calculateHmac(key, move) {
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(move);
    return hmac.digest('hex');
  }
}

class RuleGenerator {
  static generateRules(moves) {
    const rules = {};
    const len = moves.length;
    for (let i = 0; i < len; i++) {
      const currentMove = moves[i];
      const currentWinMoves = [];
      const currentLoseMoves = [];
      for (let j = 1; j <= len / 2; j++) {
        const winMoveIndex = (i + j) % len;
        const loseMoveIndex = (i - j + len) % len;
        currentWinMoves.push(moves[winMoveIndex]);
        currentLoseMoves.push(moves[loseMoveIndex]);
      }
      rules[currentMove] = {
        win: currentWinMoves,
        lose: currentLoseMoves
      };
    }
    return rules;
  }
}

class Game {
  constructor(moves) {
    this.moves = moves;
    this.rules = RuleGenerator.generateRules(moves);
    this.key = KeyGenerator.generateKey();
    console.log(`HMAC key: ${this.key}`);
  }

  play(userMove) {
    const computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
    const hmac = HmacCalculator.calculateHmac(this.key, computerMove);
    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);
    console.log(`HMAC: ${hmac}`);
    const result = this.determineResult(userMove, computerMove);
    if (result === 'draw') {
      console.log('It\'s a draw!');
    } else if (result === 'win') {
      console.log('You win!');
    } else if (result === 'lose') {
      console.log('You lose!');
    }
    console.log(`HMAC key: ${this.key}`);
  }

  determineResult(userMove, computerMove) {
    if (userMove === computerMove) {
      return 'draw';
    }
    const possibleWins = this.rules[userMove].win;
    if (possibleWins.includes(computerMove)) {
      return 'win';
    }
    return 'lose';
  }

  printRules() {
    const ruleTable = [['', ...this.moves]];
    for (const move of this.moves) {
      const row = [move];
      for (const otherMove of this.moves) {
        if (move === otherMove) {
          row.push('Draw');
        } else if (this.rules[move].win.includes(otherMove)) {
          row.push('Win');
        } else {
          row.push('Lose');
        }
      }
      ruleTable.push(row);
    }
    console.table(ruleTable);
  }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
    console.error('Invalid arguments. Please provide an odd number of unique moves.');
    console.error('Example: node game.js rock paper scissors lizard spock');
    return;
  }
  const game = new Game(args);
  game.printRules();
  console.log('Enter your move:');
  for (let i = 0; i < args.length; i++) {
    console.log(`${i + 1} - ${args[i]}`);
  }
  console.log('0 - Exit');
  const stdin = process.openStdin();
  stdin.addListener('data', data => {
    const input = data.toString().trim();
    if (input === '0') {
      process.exit();
    }
    const choice = parseInt(input, 10);
    if (isNaN(choice) || choice < 1 || choice > args.length) {
      console.log('Invalid input. Please enter a number between 0 and ' + args.length + '.');
      return;
    }
    game.play(args[choice - 1]);
  });
}

main();