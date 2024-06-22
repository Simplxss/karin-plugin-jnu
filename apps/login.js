import { plugin, segment } from '#Karin'
import { userNameLogin } from '../lib/apis/webvpn.js'
import { login, getScore } from '../lib/apis/jwxt.js'

export class hello extends plugin {
  constructor () {
    super({
      // 必选 插件名称
      name: 'e江南登录',
      // 插件描述
      dsc: 'e江南登录',
      // 监听消息事件 默认message
      event: 'message',
      // 优先级
      priority: 1000,
      // 以下rule、task、button、handler均为可选，如键入，则必须为数组
      rule: [
        {
          reg: `^密码登录(.*) (.*)$`,
          fnc: "passwordLogin",
          log: false,
          permission: 'all'
        }
      ]
    })
  }

  async passwordLogin () {
    let params = /^密码登录(.*) (.*)$/.exec(this.e.msg)
    try {
      let cookies = await userNameLogin(params[1], params[2])
      await login(cookies)
      let score = await getScore(cookies)

      this.e.reply('登录成功')
    } catch (e) {
      this.e.reply(e.message)
    }
  }
}
