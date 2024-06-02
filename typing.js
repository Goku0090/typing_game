const paragraphs = [
  "Isaac Newton believed he was potentially part of a line of great men to receive great and ancient wisdom. He even created a special name for himself \"Jehovah Sanctus Unus,\" or \"to Jehovah, the Holy One.\"",
  "A group of monkeys in Delhi, India reportedly attacked a laboratory assistant and escaped with several coronavirus blood samples. The monkeys were later spotted in a tree chewing one of the sample collection kits.",
  "A female chicken will mate with many different males. If she decides later that she doesn’t want a particular rooster’s offspring, she can eject his sperm. This happens most often when the male is lower in the pecking order.",
  "Beekeepers in France noticed that their bees were producing honey in unusual shades of green and blue. After investigating, the beekeepers discovered that the bees had been eating remnants of M&M candy shells from a nearby factory."
];

const gameTime = 30 * 1000; // 30 seconds
let timer = null;
let gameStart = null;
let correctKeystrokes = 0;
let incorrectKeystrokes = 0;
let totalKeystrokes = 0;

function addClass(el, name) {
  el.className += ' ' + name;
}

function removeClass(el, name) {
  el.className = el.className.replace(new RegExp('\\b' + name + '\\b', 'g'), '').trim();
}

function formatWord(word) {
  return `<div class="word"><span class="letter">${word.split('').join('</span><span class="letter">')}</span></div>`;
}

function newGame() {
  clearInterval(timer);
  removeClass(document.getElementById('game'), 'over');
  document.getElementById('words').innerHTML = '';
  document.getElementById('info').innerHTML = (gameTime / 1000) + 's';
  loadNewParagraph();
  resetCursor();
  timer = null;
  gameStart = null;
  correctKeystrokes = 0;
  incorrectKeystrokes = 0;
  totalKeystrokes = 0;
}

function loadNewParagraph() {
  const wordsElement = document.getElementById('words');
  wordsElement.innerHTML = '';
  const words = randomParagraph().split(' ');
  words.forEach(word => {
    wordsElement.innerHTML += formatWord(word);
  });
  addClass(document.querySelector('.word'), 'current');
  addClass(document.querySelector('.word .letter'), 'current');
}

function randomParagraph() {
  const randomIndex = Math.floor(Math.random() * paragraphs.length);
  return paragraphs[randomIndex];
}

function resetCursor() {
  const nextLetter = document.querySelector('.letter.current');
  const nextWord = document.querySelector('.word.current');
  const cursor = document.getElementById('cursor');
  cursor.style.top = (nextLetter || nextWord).getBoundingClientRect().top + 2 + 'px';
  cursor.style.left = (nextLetter || nextWord).getBoundingClientRect()[nextLetter ? 'left' : 'right'] + 'px';
}

function getWpm() {
  const wordsTyped = Math.round([...document.querySelectorAll('.word .letter.correct')].length / 5); // Average word length is 5 characters
  const minutes = (gameTime / 1000) / 60;
  return wordsTyped / minutes;
}

function getAccuracy() {
  return totalKeystrokes === 0 ? 0 : (correctKeystrokes / totalKeystrokes) * 100;
}

function gameOver() {
  clearInterval(timer);
  addClass(document.getElementById('game'), 'over');
  const wpm = getWpm();
  const accuracy = getAccuracy();
  document.getElementById('info').innerHTML = `WPM: ${wpm.toFixed(2)}<br>Accuracy: ${accuracy.toFixed(2)}%`;
}

document.getElementById('game').addEventListener('keyup', ev => {
  const key = ev.key;
  const currentWord = document.querySelector('.word.current');
  const currentLetter = document.querySelector('.letter.current');
  const expected = currentLetter?.innerHTML || ' ';
  const isLetter = key.length === 1 && key !== ' ';
  const isSpace = key === ' ';
  const isBackspace = key === 'Backspace';
  const isFirstLetter = currentLetter === currentWord.firstChild;

  if (document.querySelector('#game.over')) {
    return;
  }

  if (!timer && isLetter) {
    timer = setInterval(() => {
      if (!gameStart) {
        gameStart = (new Date()).getTime();
      }
      const currentTime = (new Date()).getTime();
      const msPassed = currentTime - gameStart;
      const sPassed = Math.round(msPassed / 1000);
      const sLeft = Math.round((gameTime / 1000) - sPassed);
      if (sLeft <= 0) {
        gameOver();
        return;
      }
      document.getElementById('info').innerHTML = sLeft + 's';
    }, 1000);
  }

  if (isLetter) {
    totalKeystrokes++;
    if (expected === ' ') {
      addClass(currentLetter, 'incorrect');
      incorrectKeystrokes++;
    } else {
      if (currentLetter) {
        addClass(currentLetter, key === expected ? 'correct' : 'incorrect');
        removeClass(currentLetter, 'current');
        if (currentLetter.className.includes('correct')) {
          correctKeystrokes++;
        } else {
          incorrectKeystrokes++;
        }
        if (currentLetter.nextSibling) {
          addClass(currentLetter.nextSibling, 'current');
        } else if (!currentLetter.nextSibling && !currentWord.nextSibling) {
          // If the current letter is the last letter and current word is the last word, load new paragraph
          loadNewParagraph();
        }
      } else {
        const incorrectLetter = document.createElement('span');
        incorrectLetter.innerHTML = key;
        incorrectLetter.className = 'letter incorrect extra';
        currentWord.appendChild(incorrectLetter);
        incorrectKeystrokes++;
      }
    }
  }

  if (isSpace) {
    ev.preventDefault();
    if (expected !== ' ') {
      const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter:not(.correct)')];
      lettersToInvalidate.forEach(letter => {
        addClass(letter, 'incorrect');
        incorrectKeystrokes++;
      });
    }
    removeClass(currentWord, 'current');
    addClass(currentWord.nextSibling, 'current');
    if (currentLetter) {
      removeClass(currentLetter, 'current');
    }
    addClass(currentWord.nextSibling.firstChild, 'current');
    resetCursor();
  }

  if (isBackspace) {
    ev.preventDefault();
    if (currentLetter && isFirstLetter) {
      removeClass(currentWord, 'current');
      addClass(currentWord.previousSibling, 'current');
      removeClass(currentLetter, 'current');
      addClass(currentWord.previousSibling.lastChild, 'current');
      removeClass(currentWord.previousSibling.lastChild, 'incorrect');
      removeClass(currentWord.previousSibling.lastChild, 'correct');
      correctKeystrokes--; // Decrease correct keystrokes as a letter is removed
    }
    if (currentLetter && !isFirstLetter) {
      removeClass(currentLetter, 'current');
      addClass(currentLetter.previousSibling, 'current');
      removeClass(currentLetter.previousSibling, 'incorrect');
      removeClass(currentLetter.previousSibling, 'correct');
      correctKeystrokes--; // Decrease correct keystrokes as a letter is removed
    }
    if (!currentLetter) {
      addClass(currentWord.lastChild, 'current');
      removeClass(currentWord.lastChild, 'incorrect');
      removeClass(currentWord.lastChild, 'correct');
      correctKeystrokes--; // Decrease correct keystrokes as a letter is removed
    }
    resetCursor();
  }

  if (currentWord.getBoundingClientRect().top > 250) {
    const words = document.getElementById('words');
    const margin = parseInt(words.style.marginTop || '0px');
    words.style.marginTop = (margin - 35) + 'px';
  }

  resetCursor();
});

document.getElementById('newGameBtn').addEventListener('click', () => {
  location.reload();
});

document.getElementById('focus-error').addEventListener('click', () => {
  document.getElementById('game').focus();
});

document.getElementById('startBtn').addEventListener('click', () => {
  document.getElementById('game-container').classList.remove('blur');
  document.getElementById('startBtn').classList.add('hidden');
  document.getElementById('game').focus();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('game-container').classList.add('blur');
});

newGame();
