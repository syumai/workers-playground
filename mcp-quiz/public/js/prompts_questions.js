export default {
  questions: [
    {
      id: "p1",
      question: "MCPにおけるプロンプトとは何を指しますか？",
      options: [
        "言語モデルの入力として使用される質問文",
        "サーバーが提供する構造化されたメッセージとテンプレート",
        "クライアントからの要求に対する応答",
        "システムエラーメッセージ",
      ],
      correctAnswer: 1,
      explanation:
        "MCPにおけるプロンプトとは、言語モデルとの対話のためにサーバーがクライアントに提供する構造化されたメッセージとテンプレートを指します。",
    },
    {
      id: "p2",
      question:
        "プロンプト機能のユーザーインタラクションモデルはどのように設計されていますか？",
      options: [
        "ユーザー制御型",
        "アプリケーション制御型",
        "モデル制御型",
        "システム制御型",
      ],
      correctAnswer: 0,
      explanation:
        "プロンプトはユーザー制御型に設計されています。つまり、ユーザーが明示的にプロンプトを選択して使用することを意図してサーバーからクライアントに公開されます。",
    },
    {
      id: "p3",
      question:
        "MCPでプロンプトをサポートするサーバーが初期化時に宣言すべき機能は何ですか？",
      options: ["prompts", "templates", "messages", "conversations"],
      correctAnswer: 0,
      explanation:
        "プロンプトをサポートするサーバーは初期化時に 'prompts' 機能を宣言する必要があります。",
    },
    {
      id: "p4",
      question:
        "MCPのプロンプト機能におけるlistChangedオプションの目的は何ですか？",
      options: [
        "利用可能なプロンプトのリストを取得する",
        "プロンプトの内容が変更されたことを通知する",
        "利用可能なプロンプトのリストが変更されたときに通知を送信するかどうかを示す",
        "プロンプトの引数リストが変更されたことを通知する",
      ],
      correctAnswer: 2,
      explanation:
        "listChangedオプションは、サーバーが利用可能なプロンプトのリストが変更されたときに通知を送信するかどうかを示します。",
    },
    {
      id: "p5",
      question: "MCPのプロンプト定義に含まれる必須情報はどれですか？",
      options: [
        "名前、説明、引数",
        "名前、内容、引数",
        "名前のみ",
        "名前、説明、内容",
      ],
      correctAnswer: 2,
      explanation:
        "プロンプト定義には少なくとも名前（一意の識別子）が含まれている必要があります。説明と引数はオプションです。",
    },
    {
      id: "p6",
      question:
        "MCPのプロンプトメッセージのロールとして有効でないものはどれですか？",
      options: ["user", "assistant", "system", "function"],
      correctAnswer: 3,
      explanation:
        "プロンプトメッセージのロールとして定義されているのは 'user' と 'assistant' のみです。'system' や 'function' は定義されていません。",
    },
    {
      id: "p7",
      question:
        "MCPのプロンプトメッセージでサポートされているコンテンツタイプではないものはどれですか？",
      options: ["テキスト", "画像", "音声", "動画"],
      correctAnswer: 3,
      explanation:
        "プロンプトメッセージでサポートされているコンテンツタイプはテキスト、画像、音声、および埋め込みリソースですが、動画は明示的に定義されていません。",
    },
    {
      id: "p8",
      question:
        "MCPのプロンプトリストが変更されたとき、どのような通知が送信されますか？",
      options: [
        "prompts/changed",
        "notifications/prompts/list_changed",
        "prompts/list_updated",
        "prompts/notification/changed",
      ],
      correctAnswer: 1,
      explanation:
        "利用可能なプロンプトのリストが変更されたとき、listChanged機能を宣言したサーバーは 'notifications/prompts/list_changed' 通知を送信します。",
    },
    {
      id: "p9",
      question:
        "MCPのプロンプトリストリクエストがサポートする機能はどれですか？",
      options: [
        "キャッシング",
        "ページネーション",
        "フィルタリング",
        "ソーティング",
      ],
      correctAnswer: 1,
      explanation:
        "prompts/listリクエストはページネーションをサポートしています。次のページを取得するためにカーソルを使用できます。",
    },
    {
      id: "p10",
      question: "MCPのプロンプト引数の補完はどのAPIを通じて行われますか？",
      options: [
        "prompts/completion",
        "completion",
        "prompts/autocomplete",
        "autocomplete",
      ],
      correctAnswer: 1,
      explanation:
        "プロンプト引数は補完APIを通じて自動補完することができます。これは一般的なcompletion APIです。",
    },
    {
      id: "p11",
      question:
        "MCPのプロンプトgetリクエストで引数が欠落している場合、サーバーはどのようにエラーを通知すべきですか？",
      options: [
        "カスタムエラーコードで",
        "エラーなしで、デフォルト値を使用する",
        "Invalid params (-32602) エラーコードで",
        "Internal error (-32603) エラーコードで",
      ],
      correctAnswer: 2,
      explanation:
        "必須の引数が欠落している場合、サーバーは標準のJSON-RPCエラーコード -32602（Invalid params）を返すべきです。",
    },
    {
      id: "p12",
      question:
        "MCPのプロンプトメッセージに埋め込みリソースが含まれる場合、どのような形式になりますか？",
      options: [
        "リソースへの参照URLのみ",
        "リソースのURIと内容を含む完全なリソースオブジェクト",
        "リソースIDのみ",
        "リソースの名前と説明のみ",
      ],
      correctAnswer: 1,
      explanation:
        "埋め込みリソースを含むメッセージには、有効なリソースURI、適切なMIMEタイプ、およびテキストまたはBase64エンコードされたブロブデータのいずれかを含む完全なリソースオブジェクトが含まれます。",
    },
    {
      id: "p13",
      question:
        "MCPのプロンプトを実装する際に考慮すべきセキュリティ上の要件は何ですか？",
      options: [
        "すべてのプロンプト入力のみを検証する",
        "すべてのプロンプト出力のみを検証する",
        "すべてのプロンプト入力と出力の両方を検証する",
        "プロンプトの引数のみを検証する",
      ],
      correctAnswer: 2,
      explanation:
        "実装はインジェクション攻撃や不正アクセスを防ぐために、すべてのプロンプト入力と出力の両方を慎重に検証する必要があります。",
    },
    {
      id: "p14",
      question:
        "MCPのプロンプト機能で画像コンテンツを含める場合、どのような要件がありますか？",
      options: [
        "URIとサイズのみが必要",
        "Base64エンコードされたデータとMIMEタイプが必要",
        "URLと名前のみが必要",
        "画像の説明と参照のみが必要",
      ],
      correctAnswer: 1,
      explanation:
        "画像コンテンツを含める場合、画像データはBase64エンコードされており、有効なMIMEタイプ（例：image/png）を含んでいる必要があります。これによりマルチモーダルな対話が可能になります。",
    },
    {
      id: "p15",
      question: "MCPにおけるプロンプトの主な使用目的は何ですか？",
      options: [
        "サーバーの状態を管理するため",
        "言語モデルとの対話のための構造化されたメッセージを提供するため",
        "クライアントの認証を行うため",
        "ネットワーク接続を最適化するため",
      ],
      correctAnswer: 1,
      explanation:
        "プロンプトの主な目的は、言語モデルとの対話のための構造化されたメッセージと指示を提供することです。これによりユーザーは言語モデルを効果的に活用できます。",
    },
  ],
};
