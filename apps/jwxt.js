import { common, plugin, segment } from '#Karin'
import { login, getScore } from '../lib/apis/jwxt.js'
import User from '../lib/database/User.js'

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
        }
      ],
      task: [
        {
          name: '刷新成绩',
          cron: '0 0 0 * * *',
          fnc: 'refreshScore',
          log: false,
        }
      ],
    })
  }

  async getScoreList () {
    let cookies = (await (await new User(this.e.user_id).load()).getEJNAccount()).cookie
    let res
    try {
      res = await getScore(cookies)
    }
    catch (e) {
      try {
        await login(cookies)
        res = await getScore(cookies)
      }
      catch (e) {
        this.e.reply(e.message)
      }
    }
    try {
      let re = '|   课程名称   |  成绩  |  绩点  |\n'
      res.items.forEach(item => {
        re += `| ${item.kcmc} | ${item.cj} | ${item.jd} |\n`
      })
      const makeForward1 = common.makeForward(segment.markdown(re), this.e.user_id, this.e.sender.nick)
      const id1 = await this.e.bot.UploadForwardMessage(this.e.contact, makeForward1)
      const makeForward2 = common.makeForward(segment.forward(id1), this.e.user_id, this.e.sender.nick)
      const id2 = await this.e.bot.UploadForwardMessage(this.e.contact, makeForward2)
      try {
        this.reply(segment.long_msg(id2))
      } catch (e) {
        this.reply(segment.forward(id2))
      }
    }
    catch (e) {
      this.e.reply(e.message)
    }
  }

  async refreshScore () {

  }
}
