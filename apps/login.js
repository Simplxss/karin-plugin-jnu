import { plugin, segment } from '#Karin'
import { userNameLogin, codeLogin } from '../lib/apis/webvpn.js'
import EJNAccount from '../lib/database/EJNAccount.js'
import User from '../lib/database/User.js'

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
          fnc: 'passwordLogin',
          log: false,
          permission: 'all'
        },
        {
          reg: `^手机号登录(.*)$`,
          fnc: 'phoneLogin',
          log: false,
          permission: 'all'
        },
        {
          reg: `^自动登录$`,
          fnc: 'autoLogin',
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

      let ejnAccount = new EJNAccount(params[1])
      ejnAccount.create(params[2], cookies)
      await ejnAccount.save()

      let user = await new User(this.e.self_id, this.e.user_id).load()
      await user.addEJNAccount(ejnAccount)

      this.reply('登录成功')
    } catch (e) {
      this.reply(e.message)
    }
  }

  async phoneLogin () {
    let params = /^手机号登录(.*)$/.exec(this.e.msg)
    try {
      let cookies = await codeLogin(params[1], async (image, err) => {
        if (err) {
          this.reply(err)
        }
        this.reply('请输入验证码')
        this.reply(segment.image(`base64://${Buffer.from(image).toString('base64')}`))
        return await new Promise((resolve) => {
          this.setContext(() => {
            this.finish()
            resolve(this.e.msg)
          }, true)
        })
      }, async (err) => {
        if (err) {
          this.reply(err)
        }
        this.reply('请输入短信验证码')
        return new Promise((resolve) => {
          this.setContext(() => {
            this.finish()
            resolve(this.e.msg)
          }, true)
        })
      })

      let ejnAccount = new EJNAccount(params[1])
      ejnAccount.create(params[2], cookies)
      await ejnAccount.save()

      let user = await new User(this.e.self_id, this.e.user_id).load()
      await user.addEJNAccount(ejnAccount)

      this.reply('登录成功')
    } catch (e) {
      this.reply(e.message)
    }
  }

  async autoLogin () {
    try {
      let user = await new User(this.e.self_id, this.e.user_id).load()
      let ejnAccount = await user.getEJNAccount()
      let cookies = await userNameLogin(ejnAccount.account_id, ejnAccount.password)
      ejnAccount.setCookie(cookies)

      this.reply('登录成功')
    } catch (e) {
      this.reply(e.message)
    }
  }
}
