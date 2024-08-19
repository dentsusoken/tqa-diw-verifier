# Verifire-Frontend
Verifire-Frontendは、ユーザーの資格情報の確認を行うためにバックエンドの認証サービスと連携します。

## バージョン情報

| 言語・フレームワーク | バージョン  |
|------------|------------------|
| Node.js    | 20.16.0   |
| Express    | 4.19.2   |
その他パッケージのバージョンはpackage.jsonを参照してください。

## ディレクトリ情報
```bash
>tree -a -I "node_modules|.git" -L 2 
.
├── .gitignore
├── README.md
├── app.js
├── bin
│   └── www
├── eslint.config.js
├── package-lock.json
├── package.json
├── public
│   └── stylesheets
├── routes
│   └── index.js
└── views
    ├── error.pug
    ├── index.pug
    ├── layout.pug
    ├── presentations.pug
    └── verifiable.pug

6 directories, 13 files
```

## インストール方法
1. リポジトリのクローン
```bash
git clone https://github.com/dentsusoken/tqa-diw-verifier.git
```

2. ディレクトリの変更
```bash
cd project
```
3. 依存パッケージをインストール

```bash
npm install
```
4. サーバー起動
```bash
npm run start 
```
5. ブラウザで`http://localhost:3000`にアクセスして動作確認
