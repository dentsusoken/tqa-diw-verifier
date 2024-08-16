const express = require("express");
const router = express.Router();
const axios = require("axios");
const QRcode = require("qrcode");
const base64url = require("base64url");
const cbor = require("cbor");
const { v4: uuid } = require("uuid");
const VERIFIER_FRONTEND_URL = "http://localhost:3000";
const WALLET_RESPONSE_PATH = "/get-wallet-code";
const VERIFIER_ENDPONT_URL =
  "https://verifier-backend.eudiw.dev/ui/presentations";
const CUSTOM_URL_SCHEME = "openid4vp://";

// デバイスの種類を判別する関数
const getDeviceType = (req) => {
  const userAgent = req.headers["user-agent"].toLowerCase();
  if (
    /(android.+mobile|blackberry|iphone|ipod|opera mini|iemobile)/i.test(
      userAgent,
    )
  ) {
    return "Mobile";
  } else if (
    /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(ip|ap|wp))))/i.test(
      userAgent,
    )
  ) {
    return "Tablet";
  } else {
    return "Desktop";
  }
};

// GET トップ画面：VP要求ボタンを表示
router.get("/", (req, res) => {
  // デバイス判別
  const deviceType = getDeviceType(req);
  res.locals.verifier_frontend_url = VERIFIER_FRONTEND_URL;
  res.render("index");
});

// GET /initiate：VP要求ボタンを押下後
router.get("/initiate", (req, res) => {
  const deviceType = getDeviceType(req);
  const date = {
    type: "vp_token",
    presentation_definition: {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors: [
        {
          id: "eu.europa.ec.eudi.pid.1",
          name: "EUDI PID",
          purpose: "We need to verify your identity",
          format: {
            mso_mdoc: {
              alg: ["ES256", "ES384", "ES512", "EdDSA"],
            },
          },
          constraints: {
            fields: [
              {
                path: ["$['eu.europa.ec.eudi.pid.1']['family_name']"],
                intent_to_retain: false,
              },
              {
                path: ["$['eu.europa.ec.eudi.pid.1']['given_name']"],
                intent_to_retain: false,
              },
            ],
          },
        },
      ],
    },
    nonce: uuid(),
  };
  // deviceTypeがMobile（=Same Device）の場合にwallet_response_redirect_uri_templateを追加
  if (deviceType === "Mobile") {
    date.wallet_response_redirect_uri_template =
      VERIFIER_FRONTEND_URL +
      WALLET_RESPONSE_PATH +
      "?response_code={RESPONSE_CODE}";
  }

  axios
    .post(VERIFIER_ENDPONT_URL, date)
    .then((response) => {
      // 後続Get wallet response実行のためにpresentation_idを取得
      presentationId = response.data.presentation_id;

      // request_uriを取得
      const requestUri = response.data.request_uri;

      // request_uriをエンコード
      const encodedURI = encodeURIComponent(requestUri);

      // openid4vp~のURLを生成
      const url =
        CUSTOM_URL_SCHEME +
        "verifier-backend.eudiw.dev?client_id=verifier-backend.eudiw.dev&request_uri=" +
        encodedURI;

      if (deviceType === "Desktop") {
        // verifiable画面のQRコードを生成する
        QRcode.toDataURL(url, (err, qrCodeDataURL) => {
          // QRコードを生成後、コールバック関数を実行
          if (err) {
            console.log("error:", err);
          }
          // リンクとQRコードを渡す
          res.render("verifiable", {
            qrCodeDataURL: qrCodeDataURL,
            url: url,
            deviceType: deviceType,
            presentationId: presentationId,
          });
        });
      } else {
        // Mobileの場合はQRコードを表示せず、リンクを返す
        res.render("verifiable", {
          url: url,
          deviceType: deviceType,
          presentationId: presentationId,
        });
      }
    })
    .catch((error) => {
      console.log("error:", error);
    });
});

// GET /poll：VP提示結果を取得
router.get("/poll", (req, res) => {
  if (!presentationId) {
    return res.status(400).json({ error: "presentationId is not found" });
  }

  axios
    .get(VERIFIER_ENDPONT_URL + "/" + presentationId)
    .then(async (response) => {
      // asyncを追加

      const vpToken = response.data.vp_token;
      const presentedClaims = [];

      // ステップ1: Base64URLデコード
      const decodedVpToken = base64url.toBuffer(vpToken);

      // cbor.decodeFirstをPromiseにラップする関数
      const decodeFirstPromise = (data) => {
        return new Promise((resolve, reject) => {
          cbor.decodeFirst(data, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      };

      // ステップ2: CBORデコード (async/awaitを使用)
      try {
        const obj = await decodeFirstPromise(decodedVpToken);
        for (const document of obj.documents) {
          const taggedArray =
            document.issuerSigned.nameSpaces["eu.europa.ec.eudi.pid.1"];
          for (const tagged of taggedArray) {
            const decodedObj = await decodeFirstPromise(tagged.value);
            const elementValue = decodedObj.elementValue;
            const elementIdentifier = decodedObj.elementIdentifier;
            presentedClaims.push({
              claim: elementValue,
              id: elementIdentifier,
            });
          }
        }
        // VP提示結果をセッションに保存
        req.session.presentedClaims = presentedClaims;
        return res.json({ result: true });
      } catch (error) {
        console.error("CBORデコード中にエラーが発生しました:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .catch((error) => {
      console.log("error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
  return null;
});

// GET /presentations：VP提示結果を表示
router.get("/presentations", (req, res) => {
  const presentedClaims = req.session.presentedClaims;
  res.render("presentations", { response: presentedClaims });
});

// GET Get wallet response passing response_code
router.get(WALLET_RESPONSE_PATH, (req, res) => {
  const deviceType = getDeviceType(req);
  axios
    .get(
      VERIFIER_ENDPONT_URL +
        "/" +
        presentationId +
        "?response_code=" +
        req.query.response_code,
    )
    .then(async (response) => {
      // asyncを追加

      const vpToken = response.data.vp_token;
      const presentedClaims = [];

      // ステップ1: Base64URLデコード
      const decodedVpToken = base64url.toBuffer(vpToken);

      // cbor.decodeFirstをPromiseにラップする関数
      const decodeFirstPromise = (data) => {
        return new Promise((resolve, reject) => {
          cbor.decodeFirst(data, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      };
      // ステップ2: CBORデコード (async/awaitを使用)
      try {
        const obj = await decodeFirstPromise(decodedVpToken);
        for (const document of obj.documents) {
          const taggedArray =
            document.issuerSigned.nameSpaces["eu.europa.ec.eudi.pid.1"];
          for (const tagged of taggedArray) {
            const decodedObj = await decodeFirstPromise(tagged.value);
            const elementValue = decodedObj.elementValue;
            const elementIdentifier = decodedObj.elementIdentifier;
            presentedClaims.push({
              claim: elementValue,
              id: elementIdentifier,
            });
          }
        }
        console.log(presentedClaims);
        // VP提示結果を渡す
        res.render("presentations", {
          response: presentedClaims,
          deviceType: deviceType,
        });
      } catch (error) {
        console.error("CBORデコード中にエラーが発生しました:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    })
    .catch((error) => {
      console.log("error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

module.exports = router;
