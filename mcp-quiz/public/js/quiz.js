import transportsQuestions from "./transports_questions.js";
import lifecycleQuestions from "./lifecycle_questions.js";
import resourcesQuestions from "./resources_questions.js";
import promptsQuestions from "./prompts_questions.js";
import toolsQuestions from "./tools_questions.js";

document.addEventListener("DOMContentLoaded", () => {
  // グローバル変数
  const allCategories = [
    "transports",
    "lifecycle",
    "resources",
    "prompts",
    "tools",
  ];
  let allQuestions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let categoryScores = {};
  let totalCorrect = 0;
  let selectedCategories = [...allCategories]; // デフォルトですべてのカテゴリを選択

  // カテゴリと問題データのマッピング
  const questionData = {
    transports: transportsQuestions,
    lifecycle: lifecycleQuestions,
    resources: resourcesQuestions,
    prompts: promptsQuestions,
    tools: toolsQuestions,
  };

  // スタートボタンのイベントリスナー（全カテゴリモード）
  document.getElementById("start-quiz-btn").addEventListener("click", () => {
    selectedCategories = [...allCategories]; // すべてのカテゴリを選択
    initializeQuiz();
  });
  
  // カテゴリ選択ボタンのイベントリスナー
  document.getElementById("select-category-btn").addEventListener("click", () => {
    // スタート画面を非表示にし、カテゴリ選択画面を表示
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector(".category-selection-screen").style.display = "block";
  });
  
  // 戻るボタンのイベントリスナー
  document.getElementById("back-to-start-btn").addEventListener("click", () => {
    // カテゴリ選択画面を非表示にし、スタート画面を表示
    document.querySelector(".category-selection-screen").style.display = "none";
    document.querySelector(".start-screen").style.display = "block";
  });
  
  // カテゴリボタンのイベントリスナーを設定
  const categoryButtons = document.querySelectorAll('.category-btn');
  for (const button of categoryButtons) {
    button.addEventListener("click", () => {
      // ボタンのdata-category属性から選択されたカテゴリを取得
      const selectedCategory = button.getAttribute('data-category');
      
      // 選択されたカテゴリだけを配列に設定
      selectedCategories = [selectedCategory];
      
      // クイズを初期化して開始
      initializeQuiz();
    });
  }

  // クイズを初期化する関数
  function initializeQuiz() {
    // 選択されたカテゴリから問題を集める
    allQuestions = [];
    categoryScores = {};
    totalCorrect = 0;

    // 各カテゴリから5問ずつランダムに選択して追加
    for (const category of selectedCategories) {
      const data = questionData[category];
      if (!data) {
        console.error("Error: Question data not found for category:", category);
        continue;
      }

      // ランダムに5問選択
      const categoryQuestions = getRandomQuestions(data.questions, 5);

      // カテゴリ情報を追加
      for (const q of categoryQuestions) {
        q.category = category;
      }

      // 全問題リストに追加
      allQuestions = [...allQuestions, ...categoryQuestions];

      // カテゴリごとのスコアを初期化
      categoryScores[category] = {
        correct: 0,
        total: categoryQuestions.length,
      };
    }

    // ユーザーの回答を初期化
    userAnswers = Array(allQuestions.length).fill(null);

    // 最初の問題を表示
    currentQuestionIndex = 0;
    showQuestion(currentQuestionIndex);

    // 画面の切り替え
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector(".category-selection-screen").style.display = "none";
    document.querySelector(".question-container").style.display = "block";
    document.querySelector(".results-container").style.display = "none";
  }

  // ランダムに問題を選択する関数
  function getRandomQuestions(allQuestions, count) {
    // Fisher-Yatesシャッフルアルゴリズムを使用し、cryptoで乱数を生成
    const array = [...allQuestions];
    
    // シャッフル処理
    for (let i = array.length - 1; i > 0; i--) {
      // crypto.getRandomValuesを使用して安全な乱数を生成
      const randomValues = new Uint32Array(1);
      crypto.getRandomValues(randomValues);
      // 0からiまでの範囲の乱数を生成
      const j = randomValues[0] % (i + 1);
      
      // 要素を交換
      [array[i], array[j]] = [array[j], array[i]];
    }
    
    return array.slice(0, count);
  }

  // 問題を表示する関数
  function showQuestion(index) {
    const question = allQuestions[index];
    const currentCategory = question.category;

    // 進捗表示の更新
    document.getElementById("current-question").textContent = index + 1;
    document.getElementById("total-questions").textContent =
      allQuestions.length;

    // カテゴリタイトルの更新
    document.getElementById(
      "category-title"
    ).textContent = `${currentCategory} Quiz`;

    // 問題テキストの更新
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

    if (index === allQuestions.length - 1) {
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
    if (currentQuestionIndex < allQuestions.length - 1) {
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
    let totalCorrect = 0;

    // カテゴリごとの正解数を計算
    for (let i = 0; i < allQuestions.length; i++) {
      const question = allQuestions[i];
      const userAnswer = userAnswers[i];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        totalCorrect++;
        categoryScores[question.category].correct++;
      }
    }

    // 総合スコアを表示
    const scoreElement = document.getElementById("score");
    scoreElement.textContent = `${totalCorrect} / ${allQuestions.length} 問正解`;

    // カテゴリごとのスコアを表示
    const categoryScoresElement = document.getElementById("category-scores");
    categoryScoresElement.innerHTML = "";

    // 選択されたカテゴリのスコアのみを表示
    for (const category of selectedCategories) {
      const score = categoryScores[category];
      if (score) { // スコアが存在する場合のみ表示
        const scoreItem = document.createElement("div");
        scoreItem.className = "category-score";
        scoreItem.textContent = `${category}: ${score.correct} / ${score.total} 問正解`;
        categoryScoresElement.appendChild(scoreItem);
      }
    }

    // 各問題のレビューを表示
    const reviewListElement = document.getElementById("review-list");
    reviewListElement.innerHTML = "";

    for (let i = 0; i < allQuestions.length; i++) {
      const question = allQuestions[i];
      const userAnswer = userAnswers[i];
      const isCorrect = userAnswer === question.correctAnswer;

      const reviewItem = document.createElement("div");
      reviewItem.className = `review-item ${
        isCorrect ? "correct" : "incorrect"
      }`;

      const reviewQuestion = document.createElement("div");
      reviewQuestion.className = "review-question";
      reviewQuestion.textContent = `問題 ${i + 1} (${question.category}): ${
        question.question
      }`;

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

    // シェアボタンのテキストを設定
    let shareText;
    
    // カテゴリが1つだけ選択されている場合はカテゴリ名を含める
    if (selectedCategories.length === 1) {
      shareText = `MCP Quizの${selectedCategories[0]}カテゴリで${totalCorrect}/${allQuestions.length}問正解しました！ #MCPQuiz`;
    } else {
      shareText = `MCP Quizで${totalCorrect}/${allQuestions.length}問正解しました！ #MCPQuiz`;
    }
    
    document.getElementById("share-text").value = shareText;

    // Twitterシェアボタンの設定
    const twitterButton = document.getElementById("twitter-share");
    twitterButton.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}`;

    // 画面の切り替え
    document.querySelector(".question-container").style.display = "none";
    document.querySelector(".results-container").style.display = "block";
  }

  // もう一度試すボタンのイベントリスナー
  document.getElementById("try-again-btn").addEventListener("click", () => {
    // クイズを再初期化
    initializeQuiz();
  });

  // シェアテキストをコピーする機能
  document.getElementById("copy-share").addEventListener("click", () => {
    const shareText = document.getElementById("share-text");
    shareText.select();
    document.execCommand("copy");
    alert("結果をクリップボードにコピーしました！");
  });
});
