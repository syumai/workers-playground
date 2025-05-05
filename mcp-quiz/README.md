# MCP 2025-03-26 クイズアプリ

Model Context Protocol（MCP）の2025-03-26仕様についての理解を深めるためのクイズアプリケーションです。Cloudflare Workersで動作します。

## URL

https://mcp-quiz.syumai.workers.dev/

## 特徴

- 以下の5つのカテゴリからクイズを出題します：
  - Transports: MCPのトランスポートメカニズム
  - Lifecycle: MCPの接続ライフサイクル
  - Resources: MCPのリソース機能
  - Prompts: MCPのプロンプト機能
  - Tools: MCPのツール機能
- 全カテゴリから各5問ずつ、合計25問をランダムに出題します
- 回答後に正解と解説を表示します
- 結果をSNS（X）でシェアできます

## 使用方法

### 開発環境での実行

#### 1. 依存関係のインストール

```bash
pnpm install
```

#### 2. 開発サーバーの起動

以下のコマンドを実行して、開発サーバーを起動します：

```bash
pnpm run dev
# または
pnpm start
```

#### 3. ブラウザでアクセス

ブラウザで以下のURLにアクセスします：

```
http://localhost:8787
```

### デプロイ方法

以下のコマンドでCloudflare Workersにデプロイできます：

```bash
pnpm run deploy
```

### クイズの進め方

1. 「クイズを開始する」ボタンをクリックします
2. 全カテゴリから出題される25問に順番に回答します
3. すべての質問に回答したら「提出」ボタンをクリックします
4. 結果と解説を確認します
5. 結果をSNSでシェアできます
6. 「もう一度試す」ボタンをクリックして、再度クイズに挑戦できます

## 技術情報

このアプリケーションは以下の技術で構築されています：

- フロントエンド: HTML, CSS, JavaScript
- バックエンド: Cloudflare Workers
- データ: JSON形式の問題セット

## ライセンス

MIT