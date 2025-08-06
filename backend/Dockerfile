# ベースイメージとして軽量な Node.js 22 を使用
FROM node:22-alpine3.22

# コンテナ内の作業ディレクトリを /app に設定
WORKDIR /app

# 変更される頻度が低いホストの package.json と package-lock.json をコンテナにコピー
# このステップを先に置くことで、依存関係が変更されない限り npm install のキャッシュが利用され、ビルド時間を短縮する
COPY package*.json ./

# npm パッケージをインストール
# 上の COPY コマンドがキャッシュから再利用される場合、このコマンドはスキップされる
RUN npm install

# ホストのすべてのファイルをコンテナの作業ディレクトリにコピー
COPY . .

# 外部からのアクセスを許可するポートを指定
EXPOSE 3000

# コンテナ起動時に実行されるデフォルトコマンド
# TODO: このコマンドは、npm startなどのアプリケーション起動コマンドに置き換えられる
CMD ["node", "dist/main.js"]