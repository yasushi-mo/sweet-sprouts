# Sweet Sprouts Backend

このディレクトリには、赤ちゃんのお世話記録アプリ「Sweet Sprouts」のバックエンド API が含まれています。
Node.js、Express.js、TypeScript、Prisma ORM を使用して構築されています。

## 🚀 開発環境のセットアップ

1.  **ディレクトリへ移動**:

    ```bash
    cd sweet-sprouts/backend
    ```

2.  **依存関係のインストール**:

    ```bash
    npm install
    ```

    Volta が自動的に `package.json` で指定された Node.js および npm のバージョンを適用します。

3.  **`.env` ファイルの作成**:
    プロジェクトのルートに `.env` ファイルを作成し、環境変数を設定してください。
    （**後ほどデータベース接続文字列などをここに追加します**）

    ```
    # .env ファイルの例 (仮)
    DATABASE_URL="postgresql://user:password@localhost:5432/sweet_sprouts_db"
    PORT=3000
    JWT_SECRET="your_very_strong_secret_key"
    ```

## ▶️ 開発サーバーの起動

開発中は、ファイル変更を自動検知して再起動する開発サーバーを使用します。

```bash
npm run dev
```

サーバーは通常 `http://localhost:3000` で起動します。ブラウザでアクセスして「Hello from Sweet Sprouts Backend\!」と表示されれば成功です。

## 📦 ビルドと本番起動

本番デプロイ用にプロジェクトをビルドするには、以下のコマンドを実行します。

```bash
npm run build
```

これにより、TypeScript コードが `./dist` ディレクトリに JavaScript としてコンパイルされます。

ビルドされたアプリケーションを本番環境で起動するには、以下を実行します。

```bash
npm start
```

## ⚙️ 主要な設定ファイル

### `package.json`

アプリケーションのメタデータ、依存関係、そして実行可能なスクリプトを定義しています。

- **`main`: `dist/index.js`**
  - ビルド後のアプリケーションのエントリーポイントです。
- **`scripts`**:
  - `dev`: 開発モードでサーバーを起動します。`ts-node-dev` を使用し、TypeScript ファイルを直接実行しつつ、ファイルの変更を監視して自動でサーバーを再起動します。`--respawn` オプションにより、サーバーがクラッシュした場合も自動的に再起動します。`--transpile-only` オプションで型チェックをスキップするため、開発時の起動が高速です。
  - `build`: TypeScript コンパイラ (`tsc`) を実行し、ソースコードを JavaScript にコンパイルします。本番デプロイ用の成果物 (`./dist` ディレクトリ) を生成します。
  - `start`: ビルド済みの JavaScript コードを Node.js で実行します。これは本番環境でのアプリケーション起動に使用されます。
- **`volta`**:
  - Volta (Node.js バージョンマネージャー) によって管理される Node.js と npm のバージョンを定義しています。プロジェクト内で統一された開発環境を保証します。

### `tsconfig.json`

TypeScript コンパイラの動作を定義するファイルです。

```json
{
  "compilerOptions": {
    "target": "ES2020" /* Node.js 20系で安定して動作するESバージョンを指定 */,
    "module": "CommonJS" /* Node.jsの標準モジュール形式としてCommonJSを出力 */,
    "outDir": "./dist" /* コンパイル済みJavaScriptの出力先ディレクトリ */,
    "rootDir": "./src" /* TypeScriptソースコードのルートディレクトリ */,
    "esModuleInterop": true /* CommonJSモジュールを 'import X from Y;' 形式でインポート可能にする */,
    "forceConsistentCasingInFileNames": true /* ファイル名の大文字小文字の不一致による問題を防止 (Linux環境での問題回避) */,
    "strict": true /* 全ての厳格な型チェックオプションを有効にし、コード品質を向上 */,
    "skipLibCheck": true /* node_modules内の型定義ファイルの型チェックをスキップ (不必要なエラー回避) */,
    "sourceMap": true /* デバッグを容易にするため、ソースマップファイルを生成 */
  },
  "include": [
    "src/**/*.ts"
  ] /* srcディレクトリ内のすべてのTypeScriptファイルをコンパイル対象に含める */,
  "exclude": [
    "node_modules",
    "dist"
  ] /* node_modulesとdistディレクトリはコンパイル対象から除外 */
}
```

---
