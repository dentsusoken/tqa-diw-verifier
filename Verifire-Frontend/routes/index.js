var express = require('express');
var router = express.Router();
var axios = require('axios');
var QRcode = require('qrcode');


// GET トップ画面：VP要求ボタンを表示
router.get('/', function(req, res, next) {
  res.render('index');
});

// GET /initiate：VP要求ボタンを押下後
router.get('/initiate', function(retiq, res, next){

  const date = {
    type: "vp_token",
    presentation_definition: {
      id: "32f54163-7166-48f1-93d8-ff217bdb0653",
      input_descriptors:[
        {
            id: "eu.europa.ec.eudi.pid.1",
            name: "EUDI PID",
            purpose: "We need to verify your identity",
            format: {
                mso_mdoc: {
                    alg: ["ES256", "ES384", "ES512", "EdDSA"]
                }
            },
            constraints:{
                fields:[
                    {
                        path:["$['eu.europa.ec.eudi.pid.1']['family_name']"],
                        intent_to_retain: true
                    }
                ]
            }
        }
        ]
    },
    nonce: "9b1271e7-f85b-43cd-8a66-2bfdaee1eeb2",
    wallet_response_redirect_uri_template: "http://localhost:3000/get-wallet-code?response_code={RESPONSE_CODE}"
  }

  axios.post('https://verifier-backend.eudiw.dev/ui/presentations', date)
  .then(response => {
    console.log('responseUrl:',response.data);
    // 後続Get wallet response実行のためにpresentation_idを取得
    presentationId = response.data.presentation_id;
    console.log('presentationId:',presentationId);

    // request_uriを取得
    const requestUri = response.data.request_uri;
    console.log('requestUri',requestUri);

    // request_uriをエンコード
    const encodedURI = encodeURIComponent(requestUri);
    console.log('encodedURI:',encodedURI);

    // eudi-openid4vp~のURLを生成
    const url = "eudi-openid4vp://verifier-backend.eudiw.dev?client_id=verifier-backend.eudiw.dev&request_uri=" + encodedURI;
    console.log('url:',url);

    // verifiable画面のQRコードを生成する
    QRcode.toDataURL(url, function(err, qrCodeDataURL){ // QRコードを生成後、コールバック関数を実行
      if(err){
        console.log('error:',err);
      }
      console.log('qrCodeDataURL:',qrCodeDataURL);
    // リンクとQRコードを渡す
      res.render('verifiable', {qrCodeDataURL: qrCodeDataURL, url: url});
    });
  })
  .catch(error => {
    console.log('error:',error);
  });
});

// GET Get wallet response passing response_code
router.get('/get-wallet-code', function(req, res, next) {
  // response_codeをログに出力
  console.log(req.query);
  axios.get('https://verifier-backend.eudiw.dev/ui/presentations/'+presentationId+'?response_code='+req.query.response_code) 
  .then(response => {
    console.log('response:',response.data);

  // response.dataをJSON文字列に変換
    const responseJsonString = JSON.stringify(response.data,null,2);
  // VP提示結果を渡す
    res.render('presentations', {responseJsonString: responseJsonString});
  })
  .catch(error => {
    console.log('error:',error);
  });
});

module.exports = router;
