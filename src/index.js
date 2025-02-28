import { assign, createDlFromObject, el, formatTimeMs, getRandomInt, getUniqueRandomIntList, LEVELS, ranks, replayAudio, toTitleCase } from './utils.js';

const loadingQuestions = fetch('./src/questions.json').then((response) => response.json());

const gameContainer = /** @type {HTMLElement} */(document.getElementById('game'));

const QUESTIONS = 3;
const COLUMNS = 10;
const ROWS = 10;

const audios = {
  bgm: assign(new Audio('./assets/bgm.mp3'), { loop: true }),
  success: new Audio('./assets/success.mp3'),
  failure: new Audio('./assets/failure.mp3'),
  boom: new Audio('./assets/boom.mp3'),
};

function resetGame() {
  gameContainer.replaceChildren(
    el('div', { className: 'start-button-list' }, LEVELS.map((level) => {
      const button = el('button', { type: 'button', className: `start-button start-button-${level}` }, [
        `${toTitleCase(level)}`,
      ]);

      button.addEventListener('click', () => {
        startGame(level);
      });

      return button;
    })),
  );
}

/**
 * @typedef {{
 *   majorCharacterDetail: import('./utils.js').QuestionDetail;
 *   minorCharacterDetail: import('./utils.js').QuestionDetail;
 * }} QuestionContent
 */

/**
 * @param {import('./utils.js').Level} level
 */
async function startGame(level) {
  /** @type {import('./utils.js').Questions} */
  const questions = await loadingQuestions;
  const questionsAtLevel = questions[level];

  /** @type {QuestionContent[]} */
  const questionContentList = getUniqueRandomIntList(questionsAtLevel.length, QUESTIONS).map((questionIndex) => {
    const questionItem = questionsAtLevel[questionIndex];
    const uniqueRandomList = getUniqueRandomIntList(questionItem.length, 2);

    return {
      majorCharacterDetail: questionItem[uniqueRandomList[0]],
      minorCharacterDetail: questionItem[uniqueRandomList[1]],
    };
  });

  let time = 0;
  let questionNumber = 0;

  const timeWrapper = el('div', {}, [formatTimeMs(time)]);

  function updateTimeWrapper() {
    timeWrapper.replaceChildren(formatTimeMs(time));
  };

  const questionNumberWrapper = el('div');

  function updateQuestionNumberWrapper() {
    questionNumberWrapper.replaceChildren(`${questionNumber} / ${QUESTIONS}`);
  }

  updateTimeWrapper();
  updateQuestionNumberWrapper();

  const gameContent = el('div');

  gameContainer.replaceChildren(
    createDlFromObject({
      'タイム': timeWrapper,
      '問題': questionNumberWrapper,
    }, { className: 'game-header' }),
    gameContent,
  );

  function askQuestion() {
    questionNumber += 1;
    updateQuestionNumberWrapper();

    const questionContent = questionContentList[questionNumber - 1];
    const { majorCharacterDetail, minorCharacterDetail } = questionContent;

    const answerColumn = getRandomInt(COLUMNS);
    const answerRow = getRandomInt(ROWS);

    const intervalId = setInterval(() => {
      time += 100;
      updateTimeWrapper();
    }, 100);

    /**
     * @param {number} rowIndex
     * @param {number} columnIndex
     */
    function createQuestionButton(rowIndex, columnIndex) {
      const isMinor = rowIndex === answerRow && answerColumn === columnIndex;

      const button = el('button', { type: 'button', className: 'question-button' }, [
        (isMinor ? minorCharacterDetail : majorCharacterDetail).character,
      ]);

      button.addEventListener('click', () => {
        if (isMinor) {
          clearInterval(intervalId);
          replayAudio(audios.success);
          showCharacterDetail(questionContent);
        } else {
          replayAudio(audios.failure);
        }
      });

      return button;
    }

    gameContent.replaceChildren(
      el('pre', { className: 'question' }, (Array.from({ length: ROWS }).flatMap((_, rowIndex) => [
        ...Array.from({ length: COLUMNS }).map((_, columnIndex) => (
          createQuestionButton(rowIndex, columnIndex)
        )),
        '\n',
      ]))),
    );
  }

  /**
   * @param {QuestionContent} questionContent
   */
  function showCharacterDetail(questionContent) {
    const goNextButton = el('button', { type: 'button', className: 'go-next-button' }, ['次に進む']);

    goNextButton.addEventListener('click', () => {
      if (questionNumber === QUESTIONS) {
        audios.bgm.pause();
        showResult();
      } else {
        askQuestion();
      }
    });

    gameContent.replaceChildren(
      el('div', { className: 'character-detail-container' }, [
        el('ul', { className: 'character-detail' }, [
          questionContent.majorCharacterDetail,
          questionContent.minorCharacterDetail,
        ].map(({ character, on, kun, meaning, category }) => (
          el('li', {}, [
            el('div', { className: 'character-outline' }, [
              el('div', { className: 'character' }, [character]),
              el('div', { className: 'category' }, [category]),
            ]),
            createDlFromObject({
              '音:': on,
              '訓:': kun,
              '意味:': meaning,
            }, { className: 'data-list' }),
          ])
        ))),
        goNextButton,
      ]),
    );
  }

  function showResult() {
    const rank = ranks.find((rank) => time / 1000 <= rank.max);

    if (!rank) {
      throw new TypeError('Failed to decide rank.');
    }

    const startAgainButton = el('button', { type: 'button', className: 'start-again-button' }, ['もう一度']);

    startAgainButton.addEventListener('click', () => {
      resetGame();
    });

    replayAudio(audios.boom);

    gameContainer.replaceChildren(
      el('div', { className: 'result-container' }, [
        el('div', { className: 'result-title' }, ['結果']),
        el('div', { className: `result-box result-box-${level}` }, [
          createDlFromObject({
            '難易度': toTitleCase(level),
            'タイム': formatTimeMs(time),
            '階級': rank.name,
          }, { className: 'result-list' }),
          el('div', { className: 'rank-description' }, [rank.description]),
        ]),
        startAgainButton,
      ]),
    );
  }

  replayAudio(audios.bgm);
  askQuestion();
}

resetGame();

const settings = /** @type {HTMLElement} */(document.getElementById('settings'));
const muteButton = el('button', { type: 'button', className: 'mute-button' });

settings.replaceChildren(muteButton);

let muted = false;

const handleMuteUpdated = () => {
  for (const audio of Object.values(audios)) {
    audio.muted = muted;
  }

  muteButton.replaceChildren(
    el('img', muted
      ? {
          src: './assets/volume-muted.svg',
          alt: 'ミュート解除',
        }
      : {
          src: './assets/volume-unmuted.svg',
          alt: 'ミュート',
        }),
  );
};

handleMuteUpdated();

muteButton.addEventListener('click', () => {
  muted = !muted;
  handleMuteUpdated();
});
