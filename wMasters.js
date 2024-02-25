const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const WOD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_URL = "https://words.dev-apis.com/validate-word";
const ROUNDS = 6;

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading = true;

  const res = await fetch(WOD_URL);
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordParts = word.split('');
  let done = false;
  isLoading = false;
  setLoadingIndicator(isLoading);

  console.log(word);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }

    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
  }

  async function commit() {
    if (currentGuess.length != ANSWER_LENGTH) {
      // do nothing
      return;
    }

    isLoading = true;
    setLoadingIndicator(isLoading);
    const res = await fetch(VALIDATE_URL, {
      method: "POST",
      body: JSON.stringify({ word: currentGuess })
    });
    isLoading = false;
    setLoadingIndicator(isLoading);

    const resObj = await res.json();
    const validWord = resObj.validWord

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split('');
    const map = makeMap(wordParts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      // mark as correct
      if (guessParts[i] === wordParts[i]) {
        letters[ANSWER_LENGTH * currentRow + i].classList.add('correct');
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessParts[i] === wordParts[i]) {
        // do nothing
      } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0) {
        // mark as close
        letters[ANSWER_LENGTH * currentRow + i].classList.add('close');
        map[guessParts[i]]--;
      } else {
        letters[ANSWER_LENGTH * currentRow + i].classList.add('wrong');
      }
    }

    currentRow++;

    if (currentGuess === word) {
      alert('you win!');
      document.querySelector('.brand').classList.add("winner");
      done = true;
    } else if (currentRow === ROUNDS) {
      alert(`you loose, the word was ${word}`);
      done = true;
      return;
    }

    currentGuess = '';

  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = '';
  }

  function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[ANSWER_LENGTH * currentRow + i].classList.remove('invalid');

      setTimeout(function () {
        letters[ANSWER_LENGTH * currentRow + i].classList.add('invalid');
      }, 10);
    }
  }


  document.addEventListener('keydown', function handleKeyPress(event) {


    if (done || isLoading) {
      return;
    }
    const action = event.key;

    if (action === 'Enter') {
      commit();
    } else if (action === 'Backspace') {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase())
    } else {
      // do nothing
    }

  })
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoadingIndicator(isLoading) {
  loadingDiv.classList.toggle('hidden', !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();