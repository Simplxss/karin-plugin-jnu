import { plugin, segment } from '#Karin'
import { getScore } from '../lib/apis/jwxt.js'

export class hello extends plugin {
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
          fnc: "getScoreList",
          log: false,
          permission: 'all'
        }
      ]
    })
  }

  async getScoreList () {
    try {
      let score = await getScore(cookies)

    } catch (e) {
      this.e.reply(e.message)
    }
  }
}
