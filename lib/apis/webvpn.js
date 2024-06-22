import * as cheerio from 'cheerio'
import { encrypt, toUrlEncoded, requsest, WEBVPN1_DOMAIN } from './utils.js'

export async function userNameLogin (username, password, captcha = '') {
  let cookies = {}
  let res = await requsest(`${WEBVPN1_DOMAIN}/https/77726476706e69737468656265737421f1e2559434357a467b1ac7a691542d32ea11ab25eb746af45e5f/authserver/login`,
    'GET',
    { 'service': 'https://e.jiangnan.edu.cn/login' },
    null, cookies)
  let $ = cheerio.load(res)

  let pwdLoginDiv = $('div[id="pwdLoginDiv"]')
  let pwdEncryptSalt = pwdLoginDiv.find('input[id="pwdEncryptSalt"]').val()
  let _eventId = pwdLoginDiv.find('input[id="_eventId"]').val()
  let cllt = pwdLoginDiv.find('input[id="cllt"]').val()
  let lt = pwdLoginDiv.find('input[id="lt"]').val()
  let execution = pwdLoginDiv.find('input[id="execution"]').val()

  // `${WEBVPN1_DOMAIN}/https/77726476706e69737468656265737421f1e2559434357a467b1ac7a691542d32ea11ab25eb746af45e5f/authserver/checkNeedCaptcha.htl?vpn-12-o2-authserver.jiangnan.edu.cn&username=1046220113&_=1719054828124`

  let saltPassword = encrypt(password, pwdEncryptSalt)

  let data = {
    username: username,
    password: saltPassword,
    captcha: captcha,
    _eventId: _eventId,
    cllt: cllt,
    lt: lt,
    execution: execution
  }

  res = await requsest(`${WEBVPN1_DOMAIN}/https/77726476706e69737468656265737421f1e2559434357a467b1ac7a691542d32ea11ab25eb746af45e5f/authserver/login`,
    'POST',
    { 'service': 'https://e.jiangnan.edu.cn/login' },
    toUrlEncoded(data), cookies,
    {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Origin": "https://webvpn1.jiangnan.edu.cn",
      "Referer": "https://webvpn1.jiangnan.edu.cn/https/77726476706e69737468656265737421f1e2559434357a467b1ac7a691542d32ea11ab25eb746af45e5f/authserver/login?service=https%3A%2F%2Fwebvpn1.jiangnan.edu.cn%2Flogin%3Fcas_login%3Dtrue%23%2F",
    })

  $ = cheerio.load(res)

  pwdLoginDiv = $('div[id="pwdLoginDiv"]')
  let error = pwdLoginDiv.find('span[id="showErrorTip"]').text()

  if (error) {
    throw new Error(error)
  }

  return cookies
}



// export async function loginTo3rd (cookies) {
//   let res = await requsest(`${WEBVPN1_DOMAIN}/http/77726476706e69737468656265737421fae046903f24265a770987ab96542d7bbb440a4f4868/sso/jziotlogin`,
//     'GET',
//     { 'service': 'https://e.jiangnan.edu.cn/login' },
//     null,
//     cookies)
// }