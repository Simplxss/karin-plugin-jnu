import { Bot, common, plugin, segment } from '#Karin'
import { KarinContact } from '../../../lib/bot/KarinElement.js'
import { login, getScore } from '../lib/apis/jwxt.js'
import User, { getNeedRefreshedUser } from '../lib/database/User.js'

const default_interval = 10

export class jwxt extends plugin {
  constructor () {
    super({
      // 必选 插件名称
      name: '教务系统',
      // 插件描述
      dsc: '教务系统',
      // 监听消息事件 默认message
      event: 'message',
      // 优先级
      priority: 1000,
      // 以下rule、task、button、handler均为可选，如键入，则必须为数组
      rule: [
        {
          reg: `^成绩查询$`,
          fnc: 'getScoreList',
          log: false,
          permission: 'all'
        },
        {
          reg: `^(开启|关闭)成绩自动刷新$`,
          fnc: 'setRefresh',
          log: false,
          permission: 'all'
        },
        {
          reg: `^设置成绩自动刷新间隔([0-9]+)$`,
          fnc: 'setRefreshInterval',
          log: false,
          permission: 'all'
        }
      ],
      task: [
        {
          name: '成绩自动刷新',
          cron: '0 * * * * *',
          fnc: 'refreshScore',
          log: false,
        }
      ],
    })
  }

  async getScore (ejn_account) {
    let cookies = ejn_account.cookie
    let res
    try {
      res = await getScore(cookies)
    } catch (e) {
      try {
        await login(cookies)
        res = await getScore(cookies)
      } catch (e) {
        throw new Error('教务系统登录失败, 请重新登录e江南账号')
      }
    }
    return res
  }

  async setRefresh () {
    let enable = this.e.msg === '开启成绩自动刷新'
    let user = await new User(this.e.self_id, this.e.user_id).load()
    user.setRefreshTime(enable ? Math.floor(new Date().getTime() / 1000 / 60) : null)
    this.reply(enable ? '已开启自动刷新' : '已关闭自动刷新')
  }

  async setRefreshInterval () {
    let params = /^设置成绩自动刷新间隔([0-9]+)$/.exec(this.e.msg)
    let interval = parseInt(params[1])
    if (interval >= 10) {
      let user = await new User(this.e.self_id, this.e.user_id).load()
      user.setData('refresh_interval', interval)
      user.setRefreshTime(Math.floor(new Date().getTime() / 1000 / 60))
      this.reply(`设置成功, 刷新间隔为${interval}分钟`)
    } else {
      this.reply('刷新间隔不能小于10分钟')
    }
  }

  async sendList (bot, contact, res) {
    try {
      let re = '|   课程名称   |  成绩  |  绩点  |\n'
      res.items.forEach(item => {
        re += `| ${item.kcmc} | ${item.cj} | ${item.jd} |\n`
      })

      let makeForward1 = common.makeForward(segment.markdown(re), String(bot.account.uin), bot.account.name)
      let id1 = await bot.UploadForwardMessage(contact, makeForward1)
      let makeForward2 = common.makeForward(segment.forward(id1), String(bot.account.uin), bot.account.name)
      let id2 = await bot.UploadForwardMessage(contact, makeForward2)

      try {
        bot.SendMessage(contact, [segment.long_msg(id2)])
      } catch (e) {
        bot.SendMessage(contact, [segment.forward(id2)])
      }
    }
    catch (e) {
      bot.SendMessage(contact, [segment.text(e.message)])
    }
  }

  async getScoreList () {
    try {
      let user = await new User(this.e.self_id, this.e.user_id).load()
      let ejn_account = await user.getEJNAccount()
      this.sendList(this.e.bot, this.e.contact, await this.getScore(ejn_account))
    } catch (e) {
      this.reply(e.message)
    }
  }

  async refreshScore () {
    try {
      let mins = Math.floor(new Date().getTime() / 1000 / 60)
      let users = await getNeedRefreshedUser(mins)
      for (let user of users) {
        let bot = Bot.getBot(user.user_from)
        let contact = KarinContact.private(user.user_id)
        let ejn_account = await user.getEJNAccount()
        try {
          let res = await this.getScore(ejn_account)
          let previous = await user.getData('score')

          if (previous) {
            let new_score = res.items.map(item => item.kcmc + item.cj + item.jd).join('')
            let old_score = previous.items.map(item => item.kcmc + item.cj + item.jd).join('')
            if (new_score !== old_score) {
              bot.SendMessage(contact, [segment.text(`[成绩查询] e江南账号: ${ejn_account.account_id} 成绩有更新\n`)])
              this.sendList(bot, contact, res)
            }
          }
          user.setData('score', res)

          let interval = await user.getData('refresh_interval') || default_interval
          user.setRefreshTime(mins + interval)
        } catch (e) {
          bot.SendMessage(contact, [segment.text(`[成绩查询] e江南账号: ${ejn_account.account_id} 自动查询出现错误, 已暂停\n${e.message}`)])
          user.setRefreshTime(null)
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
}
