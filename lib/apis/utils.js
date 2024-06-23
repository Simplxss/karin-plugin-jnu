import exp from 'constants'
import crypto from 'crypto'


export const HOST = "jiangnan.edu.cn"
export const WEBVPN1_DOMAIN = `https://webvpn1.${HOST}`

let $aes_chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
let aes_chars_len = $aes_chars.length
function randomString (len) {
  let retStr = ''
  for (let i = 0; i < len; i++) {
    retStr += $aes_chars.charAt(Math.floor(Math.random() * aes_chars_len))
  }
  return retStr
}

export function encrypt (data, key) {
  let plain = randomString(64) + data
  let iv = randomString(16)
  let cipher = crypto.createCipheriv('aes-128-cbc', key, iv)
  let encrypted = cipher.update(plain, 'utf-8', 'base64') // `base64` here represents output encoding
  encrypted += cipher.final('base64')
  return encrypted
}

export function decrypt (data, key) {
  let iv = randomString(16)
  let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
  let decrypted = decipher.update(data, 'base64', 'utf-8')
  decrypted += decipher.final('utf-8')
  return decrypted.slice(64)
}

export function toUrlEncoded (obj) {
  return new URLSearchParams(obj).toString()
}

export async function requsest (url, method = 'GET', queries = null, data = null, cookies = {}, headers = {}) {
  let query = queries ? `?${toUrlEncoded(queries)}` : ''

  let cookie = ''
  for (let key in cookies) {
    cookie += `${key}=${cookies[key]};`
  }
  headers = { ...headers, 'Cookie': cookie } // redef headers, prevent from changing the original headers

  let params = {
    method: method,
    body: data,
    headers: headers
  }

  for (var i = 0; i < 3; i++) {
    let response
    try { response = await fetch(url + query, params) }
    catch (err) {
      logger.error(`${err.name}: ${err.message}`)
      throw new Error(`[requsest] 请求失败, 请稍后重试`)
    }

    if (!response.ok) {
      logger.error(`[requsest] ${response.status}: ${response.statusText}`)
      throw new Error(`[requsest] 请求失败, 请稍后重试`)
    }

    response.headers.getSetCookie().forEach(c => {
      cookie = c.split(';')[0]
      let kv = cookie.split('=')
      cookies[kv[0]] = kv[1]
    }) // update cookies

    return await response
  }
  logger.error('[requsest] retry 3 times failed')
  throw new Error('请求失败, 请稍后重试')
}