export default {
  questions: [
    {
      id: "t1",
      question:
        "MCPで定義されている2つの標準トランスポートメカニズムは何ですか？",
      options: [
        "HTTP と WebSocket",
        "stdio と TCP/IP",
        "stdio と Streamable HTTP",
        "WebSocket と MQTT",
      ],
      correctAnswer: 2,
      explanation:
        "MCPは1) stdio（標準入出力を介した通信）と2) Streamable HTTPの2つの標準トランスポートメカニズムを定義しています。",
    },
    {
      id: "t2",
      question:
        "stdioトランスポートにおいて、サーバーがログを書き込むために使用するのは何ですか？",
      options: ["stdout", "stdin", "stderr", "stdlog"],
      correctAnswer: 2,
      explanation:
        "stdioトランスポートでは、サーバーはログ目的で標準エラー（stderr）にUTF-8文字列を書き込むことができます。",
    },
    {
      id: "t3",
      question: "MCPのメッセージはどのようにエンコードされますか？",
      options: ["ASCII", "UTF-8", "Unicode", "BASE64"],
      correctAnswer: 1,
      explanation:
        "MCPはJSON-RPCを使用してメッセージをエンコードします。JSON-RPCメッセージはUTF-8エンコードされなければなりません。",
    },
    {
      id: "t4",
      question:
        "Streamable HTTPトランスポートで、クライアントがサーバーにメッセージを送信する際に使用するHTTPメソッドは何ですか？",
      options: ["GET", "PUT", "POST", "PATCH"],
      correctAnswer: 2,
      explanation:
        "Streamable HTTPトランスポートでは、クライアントからサーバーへのJSON-RPCメッセージはすべて新しいHTTP POSTリクエストでなければなりません。",
    },
    {
      id: "t5",
      question:
        "Streamable HTTPトランスポートのセキュリティについて、ローカルで実行する場合のサーバーのバインド先として推奨されるのはどれですか？",
      options: ["0.0.0.0", "127.0.0.1", "192.168.1.1", "255.255.255.255"],
      correctAnswer: 1,
      explanation:
        "セキュリティ上の理由から、ローカルで実行する場合、サーバーはすべてのネットワークインターフェース（0.0.0.0）ではなく、localhost（127.0.0.1）にのみバインドすべきです。",
    },
    {
      id: "t6",
      question:
        "MCPのJSON-RPCメッセージのタイプとして含まれないものはどれですか？",
      options: ["リクエスト", "レスポンス", "通知", "エラー"],
      correctAnswer: 3,
      explanation:
        "MCPのJSON-RPCメッセージのタイプは「リクエスト」、「レスポンス」、「通知」の3種類です。「エラー」はレスポンスの一部として含まれることはありますが、独立したメッセージタイプではありません。",
    },
    {
      id: "t7",
      question:
        "Streamable HTTPトランスポートで、サーバーがクライアントにメッセージをストリーミングする技術は何ですか？",
      options: [
        "WebSocket",
        "Server-Sent Events (SSE)",
        "Long Polling",
        "MQTT",
      ],
      correctAnswer: 1,
      explanation:
        "Streamable HTTPトランスポートでは、サーバーはServer-Sent Events (SSE)を使用して複数のサーバーメッセージをストリーミングできます。",
    },
    {
      id: "t8",
      question: "stdioトランスポートでメッセージを区切るものは何ですか？",
      options: ["カンマ", "セミコロン", "タブ", "改行"],
      correctAnswer: 3,
      explanation:
        "stdioトランスポートでは、メッセージは改行で区切られ、埋め込まれた改行を含んではいけません。",
    },
    {
      id: "t9",
      question:
        "Streamable HTTPトランスポートでDNSリバインディング攻撃を防ぐために検証すべきHTTPヘッダーは何ですか？",
      options: ["User-Agent", "Content-Type", "Origin", "Authorization"],
      correctAnswer: 2,
      explanation:
        "Streamable HTTPトランスポートでは、DNSリバインディング攻撃を防ぐために、サーバーはすべての着信接続のOriginヘッダーを検証する必要があります。",
    },
    {
      id: "t10",
      question:
        "MCPのセッション管理で、サーバーがセッションIDを割り当てる場合に使用するHTTPヘッダーは何ですか？",
      options: [
        "Session-Id",
        "Mcp-Session-Id",
        "X-Session-Id",
        "Authorization",
      ],
      correctAnswer: 1,
      explanation:
        "MCPのセッション管理では、Streamable HTTPトランスポートを使用するサーバーは初期化時にMcp-Session-IdヘッダーにセッションIDを含めることで、セッションIDを割り当てることができます。",
    },
    {
      id: "t11",
      question:
        "Streamable HTTPトランスポートでサーバーがSSEストリームを開始する場合、設定すべきContent-Typeは何ですか？",
      options: [
        "application/json",
        "text/plain",
        "text/event-stream",
        "application/x-www-form-urlencoded",
      ],
      correctAnswer: 2,
      explanation:
        "サーバーがSSEストリームを開始する場合、Content-Type: text/event-streamを返す必要があります。",
    },
    {
      id: "t12",
      question:
        "クライアントがStreamable HTTPトランスポートでPOSTリクエストを送信する際に含めるべきAcceptヘッダーの値は何ですか？",
      options: [
        "application/json",
        "text/event-stream",
        "application/json と text/event-stream の両方",
        "application/x-www-form-urlencoded",
      ],
      correctAnswer: 2,
      explanation:
        "クライアントはAcceptヘッダーに application/json と text/event-stream の両方をサポートされるコンテンツタイプとして含める必要があります。",
    },
    {
      id: "t13",
      question:
        "MCPのカスタムトランスポート実装について正しい記述はどれですか？",
      options: [
        "カスタムトランスポートは使用できない",
        "カスタムトランスポートはJSON-RPC形式を変更できる",
        "カスタムトランスポートはJSON-RPC形式を保持する必要がある",
        "カスタムトランスポートはHTTPベースである必要がある",
      ],
      correctAnswer: 2,
      explanation:
        "カスタムトランスポートを選択する実装者は、MCPによって定義されたJSON-RPCメッセージ形式とライフサイクル要件を確実に保持する必要があります。",
    },
    {
      id: "t14",
      question:
        "Streamable HTTPトランスポートでのレスポンスが通知またはレスポンスのみで構成されている場合、サーバーはどのHTTPステータスコードを返すべきですか？",
      options: [
        "200 OK",
        "202 Accepted",
        "204 No Content",
        "206 Partial Content",
      ],
      correctAnswer: 1,
      explanation:
        "入力がJSON-RPCレスポンスまたは通知のみで構成されている場合、サーバーが入力を受け入れる場合、HTTPステータスコード202 Acceptedをボディなしで返す必要があります。",
    },
    {
      id: "t15",
      question:
        "Streamable HTTPトランスポートでクライアントがセッションを明示的に終了するためには、どのHTTPメソッドを使用しますか？",
      options: ["GET", "POST", "PUT", "DELETE"],
      correctAnswer: 3,
      explanation:
        "特定のセッションが不要になったクライアント（例：ユーザーがクライアントアプリケーションを離れる場合）は、セッションを明示的に終了するために、Mcp-Session-Idヘッダーを含むHTTP DELETEをMCPエンドポイントに送信するべきです。",
    },
  ],
};
