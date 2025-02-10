const gameContainer = document.getElementById('game');

const screens = {
  start: document.getElementById('start-screen'),
  question: document.getElementById('question-screen'),
  characterDetail: document.getElementById('character-detail-screen'),
  result: document.getElementById('result-screen')
};

const startButtons = {
  easy: document.getElementById('start-easy'),
  normal: document.getElementById('start-normal'),
  hard: document.getElementById('start-hard'),
};

const question = document.getElementById('question');
const questionNumberWrapper = document.getElementById('question-number');
const timeWrapper = document.getElementById('time');

const characterDetail = document.getElementById('character-detail');
const goNextButton = document.getElementById('go-next');

const result = document.getElementById('result');
const startAgainButton = document.getElementById('start-again');

const QUESTIONS = 3;
const COLUMNS = 10;
const ROWS = 10;

const bgmAudio = new Audio('./assets/bgm.mp3');
bgmAudio.loop = true;
const successAudio = new Audio('./assets/success.mp3');

/**
 * 0からmaxまでの乱数を生成
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * 0からmaxまでの一意のsize個の乱数を生成
 * @example
 * getUniqueRandomIntList(5, 2) // [1, 3]
 * getUniqueRandomIntList(5, 3) // [0, 4, 2]
 */
function getUniqueRandomIntList(max, size) {
  if (size > max) {
    throw new RangeError('size must be smaller than max.');
  }

  const shuffled = Array.from({ length: max }, (_, i) => i)
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled.slice(0, size);
}

function formatTimeMs(ms) {
  return (ms / 1000).toFixed(1);
}

function replaceDlItems(dl, obj) {
  dl.replaceChildren();

  for (const [key, value] of Object.entries(obj)) {
    const dt = document.createElement('dt');
    dt.append(key);
    const dd = document.createElement('dd');
    dd.append(value);
    dl.append(dt, dd);
  }
}

function createCharacterDetailLi({ character, on, kun, meaning, jouyou }) {
  const characterWrapper = document.createElement('div');
  characterWrapper.classList.add('character');
  characterWrapper.replaceChildren(character);

  const jouyouWrapper = document.createElement('div');
  jouyouWrapper.classList.add('jouyou');
  jouyouWrapper.replaceChildren(jouyou);

  const characterOutline = document.createElement('div');
  characterOutline.classList.add('character-outline');
  characterOutline.replaceChildren(characterWrapper, jouyouWrapper);

  const dl = document.createElement('dl');
  dl.classList.add('data-list');
  replaceDlItems(dl, {
    '音:': on,
    '訓:': kun,
    '意味:': meaning,
  });

  const li = document.createElement('li');
  li.append(characterOutline, dl);

  return li;
}

function toggleScreen(screenName) {
  for (const [key, screen] of Object.entries(screens)) {
    if (key === screenName) {
      screen.style.removeProperty('display');
    } else {
      screen.style.display = 'none';
    }
  }
}

function askQuestion(level, currentQuestionNumber, timeMs) {
  toggleScreen('question');

  question.replaceChildren();

  const answerColumn = getRandomInt(COLUMNS);
  const answerRow = getRandomInt(ROWS);

  const questionList = questions[level];
  const questionItem = questionList[getRandomInt(questionList.length)];
  const uniqueRandomList = getUniqueRandomIntList(questionItem.length, 2);
  const majorityCharacterDetail = questionItem[uniqueRandomList[0]];
  const minorityCharacterDetail = questionItem[uniqueRandomList[1]];

  questionNumberWrapper.replaceChildren(`${currentQuestionNumber} / ${QUESTIONS}`);

  let currentTimeMs = timeMs;

  timeWrapper.replaceChildren(formatTimeMs(currentTimeMs));

  const intervalId = setInterval(() => {
    currentTimeMs += 100;
    timeWrapper.replaceChildren(formatTimeMs(currentTimeMs));
  }, 100);

  for (let rowIndex = 0; rowIndex < ROWS; rowIndex++) {
    for (let columnIndex = 0; columnIndex < COLUMNS; columnIndex++) {
      const button = document.createElement('button');
      button.type = 'button';
      let char;

      if (rowIndex === answerRow && answerColumn === columnIndex) {
        char = minorityCharacterDetail.character;

        button.addEventListener('click', function () {
          clearInterval(intervalId);

          toggleScreen('characterDetail');

          successAudio.play();

          characterDetail.replaceChildren(
            createCharacterDetailLi(majorityCharacterDetail),
            createCharacterDetailLi(minorityCharacterDetail),
          );

          function goNext() {
            goNextButton.removeEventListener('click', goNext);

            if (currentQuestionNumber === QUESTIONS) {
              toggleScreen('result');

              bgmAudio.pause();
              bgmAudio.currentTime = 0;

              replaceDlItems(result, {
                '難易度': level,
                'タイム': formatTimeMs(currentTimeMs),
              });
            } else {
              askQuestion(level, currentQuestionNumber + 1, currentTimeMs);
            }
          }

          goNextButton.addEventListener('click', goNext);
        });
      } else {
        char = majorityCharacterDetail.character;
      }

      button.textContent = char;

      question.append(button);
    }

    question.append('\n');
  }
}

function startGame(level) {
  bgmAudio.play();
  askQuestion(level, 1, 0);
}

toggleScreen('start');

startButtons.easy.addEventListener('click', function () {
  startGame('easy');
});

startButtons.normal.addEventListener('click', function () {
  startGame('normal');
});

startButtons.hard.addEventListener('click', function () {
  startGame('hard');
});

startAgainButton.addEventListener('click', function () {
  toggleScreen('start');
});
