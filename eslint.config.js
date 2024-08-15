module.exports = [
  {
    files: ["**/*.js"],
    ignores: ["node_modules/**"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
    },
    plugins: {
      prettier: require("eslint-plugin-prettier"),
      node: require("eslint-plugin-node"),
    },
    rules: {
      "no-console": "off", // Expressではコンソールログを使用することが多いため、オフに設定
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // 使用されていない変数に警告を表示、引数は無視
      eqeqeq: "error", // 厳密等価演算子 (===) を強制
      curly: "error", // すべての制御構造において中括弧を強制
      "no-redeclare": "error", // 同じ変数名の再宣言を禁止
      "no-dupe-keys": "error", // オブジェクト内での重複するキーを禁止
      "no-duplicate-case": "error", // switch文の重複するケースを禁止
      "no-empty": ["error", { allowEmptyCatch: true }], // 空のブロックを禁止、ただしcatchは許可
      "no-ex-assign": "error", // catch節内での例外の再代入を禁止
      "no-extra-semi": "error", // 不要なセミコロンを禁止
      "no-func-assign": "error", // 変数に関数を再代入することを禁止
      "no-irregular-whitespace": "error", // 予期しない空白を禁止
      "no-obj-calls": "error", // MathやJSONなどのグローバルオブジェクトを関数として呼び出すことを禁止
      "no-sparse-arrays": "error", // 疎な配列の使用を禁止
      "no-unreachable": "error", // 到達不能なコードを禁止
      "valid-typeof": "error", // typeof演算子の結果を正しい文字列リテラルと比較することを強制
      "no-prototype-builtins": "off", // Object.prototypeのメソッドを直接使用することを許可
      "consistent-return": "error", // 関数が常に同じ型の値を返すことを強制
      "dot-notation": "warn", // プロパティへのアクセスにドット表記を強制
      "no-var": "error", // varの使用を禁止し、letまたはconstを強制
      "prefer-const": "warn", // 変更されない変数にはconstを使用することを推奨
      "prefer-arrow-callback": "error", // コールバック関数としてアロー関数を優先して使用するように強制
      "arrow-body-style": ["error", "always"], // アロー関数の本体のスタイルを統一(常に中括弧を使用)
      "func-style": ["error", "expression"], // 関数式を使用するよう強制
      "arrow-parens": ["error", "always"], // アロー関数のパラメータの括弧の使用を統一(引数が1つの場合でも括弧を付ける)
      "arrow-spacing": ["error", { before: true, after: true }], // アロー関数の矢印（=>）の前後にスペースを要求
      "no-confusing-arrow": ["error", { allowParens: true }], // アロー関数の構文が=>と混同しやすいケース（特に条件演算子と組み合わせた場合）を避けるために使用
      "no-useless-constructor": "error", // クラスで意味のない（何もしない）コンストラクタを禁止
      "func-names": ["error", "always"], // 無名関数に名前を付けることを強制(デバッグ時にスタックトレースがより明確になるため)
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          singleQuote: false,
          semi: true,
          tabWidth: 2,
        },
      ],
    },
  },
];
