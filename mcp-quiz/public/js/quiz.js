import transportsQuestions from "./transports_questions.js";
import lifecycleQuestions from "./lifecycle_questions.js";
import resourcesQuestions from "./resources_questions.js";
import promptsQuestions from "./prompts_questions.js";
import toolsQuestions from "./tools_questions.js";

document.addEventListener("DOMContentLoaded", () => {
  // グローバル変数
  let currentCategory = "";
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];

  // カテゴリと問題データのマッピング
  const questionData = {
    transports: transportsQuestions,
    lifecycle: lifecycleQuestions,
    resources: resourcesQuestions,
    prompts: promptsQuestions,
    tools: toolsQuestions,
  };

  // カテゴリ選択ボタンをクリックしたときの処理
  for (const button of document.querySelectorAll(".category-btn")) {
    button.addEventListener("click", function () {
      currentCategory = this.dataset.category;
      document.getElementById(
        "category-title"
      ).textContent = `${currentCategory} Quiz`;
      loadQuestions(currentCategory);
    });
  }

  // 問題をロードする関数
  function loadQuestions(category) {
    const data = questionData[category];

    if (!data) {
      console.error("Error: Question data not found for category:", category);
      alert("指定されたカテゴリの問題が見つかりませんでした。");
      return;
    }

    // ランダムに5問選択
    questions = getRandomQuestions(data.questions, 5);

    // ユーザーの回答を初期化
    userAnswers = Array(questions.length).fill(null);

    // 最初の問題を表示
    currentQuestionIndex = 0;
    showQuestion(currentQuestionIndex);

    // 画面の切り替え
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector(".question-container").style.display = "block";
    document.querySelector(".results-container").style.display = "none";
  }

  // ランダムに問題を選択する関数
  function getRandomQuestions(allQuestions, count) {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // 問題を表示する関数
  function showQuestion(index) {
    const question = questions[index];
    document.getElementById("current-question").textContent = index + 1;
    document.getElementById("question-text").textContent = question.question;

    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";

    for (const [optionIndex, option] of question.options.entries()) {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.textContent = option;

      // ユーザーが既に回答している場合、選択状態を反映
      if (userAnswers[index] === optionIndex) {
        button.classList.add("selected");
      }

      button.addEventListener("click", () => {
        // 選択状態の更新
        for (const btn of document.querySelectorAll(".option-btn")) {
          btn.classList.remove("selected");
        }
        button.classList.add("selected");

        // 回答を保存
        userAnswers[index] = optionIndex;
      });

      optionsContainer.appendChild(button);
    }

    // ナビゲーションボタンの更新
    document.getElementById("prev-btn").disabled = index === 0;

    if (index === questions.length - 1) {
      document.getElementById("next-btn").style.display = "none";
      document.getElementById("submit-btn").style.display = "block";
    } else {
      document.getElementById("next-btn").style.display = "block";
      document.getElementById("submit-btn").style.display = "none";
    }
  }

  // 前の問題ボタンのイベントリスナー
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      showQuestion(currentQuestionIndex);
    }
  });

  // 次の問題ボタンのイベントリスナー
  document.getElementById("next-btn").addEventListener("click", () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      showQuestion(currentQuestionIndex);
    }
  });

  // 提出ボタンのイベントリスナー
  document.getElementById("submit-btn").addEventListener("click", () => {
    // すべての問題に回答したか確認
    if (userAnswers.includes(null)) {
      alert("すべての問題に回答してください。");
      return;
    }

    // 結果を表示
    showResults();
  });

  // 結果を表示する関数
  function showResults() {
    // 正解数を計算
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correctAnswer) {
        correctCount++;
      }
    }

    // スコアを表示
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = `${correctCount} / ${questions.length} 問正解`;

    // 各問題のレビューを表示
    const reviewListElement = document.getElementById("review-list");
    reviewListElement.innerHTML = "";

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const userAnswer = userAnswers[i];
      const isCorrect = userAnswer === question.correctAnswer;

      const reviewItem = document.createElement("div");
      reviewItem.className = `review-item ${
        isCorrect ? "correct" : "incorrect"
      }`;

      const reviewQuestion = document.createElement("div");
      reviewQuestion.className = "review-question";
      reviewQuestion.textContent = `問題 ${i + 1}: ${question.question}`;

      const reviewAnswer = document.createElement("div");
      reviewAnswer.className = "review-answer";
      if (isCorrect) {
        reviewAnswer.textContent = `正解: ${
          question.options[question.correctAnswer]
        }`;
      } else {
        reviewAnswer.textContent = `あなたの回答: ${
          question.options[userAnswer]
        } / 正解: ${question.options[question.correctAnswer]}`;
      }

      const explanation = document.createElement("div");
      explanation.className = "explanation";
      explanation.textContent = question.explanation;

      reviewItem.appendChild(reviewQuestion);
      reviewItem.appendChild(reviewAnswer);
      reviewItem.appendChild(explanation);

      reviewListElement.appendChild(reviewItem);
    }

    // 画面の切り替え
    document.querySelector(".question-container").style.display = "none";
    document.querySelector(".results-container").style.display = "block";
  }

  // もう一度試すボタンのイベントリスナー
  document.getElementById("try-again-btn").addEventListener("click", () => {
    // 最初の画面に戻る
    document.querySelector(".start-screen").style.display = "block";
    document.querySelector(".results-container").style.display = "none";
  });
});
