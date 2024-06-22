import { requsest, toUrlEncoded, WEBVPN1_DOMAIN } from './utils.js'

export async function login (cookies) {
  await requsest(`${WEBVPN1_DOMAIN}/http/77726476706e69737468656265737421fae046903f24265a770987ab96542d7bbb440a4f4868/sso/jziotlogin`,
    'GET',
    null,
    null,
    cookies,
    {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Referer": "https://webvpn1.jiangnan.edu.cn/https/77726476706e69737468656265737421f5b94b95263e6f5e7f06c7a99c406d36db/default/index.html",
    })
}

export async function getScore (cookies) {
  let data = {
    xnm: 2023,
    xqm: 12,
    kcbj: '',
    _search: false,
    nd: Date.now(),
    'queryModel.showCount': 15,
    'queryModel.currentPage': 1,
    'queryModel.sortName': '',
    'queryModel.sortOrder': 'asc',
    time: 1
  }
  let res = await requsest(`${WEBVPN1_DOMAIN}/http/77726476706e69737468656265737421fae046903f24265a770987ab96542d7bbb440a4f4868/cjcx/cjcx_cxXsgrcj.html`,
    'POST',
    { "vpn-12-o1-jwglxt.jiangnan.edu.cn": "", "doType": "query", "gnmkdm": "N305005" },
    toUrlEncoded(data),
    cookies,
    {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "Origin": "https://webvpn1.jiangnan.edu.cn",
      "Referer": "https://webvpn1.jiangnan.edu.cn/http/77726476706e69737468656265737421fae046903f24265a770987ab96542d7bbb440a4f4868/cjcx/cjcx_cxDgXscj.html?gnmkdm=N305005&layout=default",
    })

  return JSON.parse(res)
}