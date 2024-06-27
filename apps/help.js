import { plugin } from '#Karin'

export class help extends plugin {
  constructor () {
    super({
      // 必选 插件名称
      name: '帮助',
      // 插件描述
      dsc: '帮助',
      // 监听消息事件 默认message
      event: 'message',
      // 优先级
      priority: 1000,
      // 以下rule、task、button、handler均为可选，如键入，则必须为数组
      rule: [
        {
          reg: `帮助`,
          fnc: 'help',
          log: false,
          permission: 'all'
        }
      ]
    })
  }

  async help () {
    this.reply(
      'e江南帮助\n' +
      '密码登录[账号] [密码]\n' +
      '手机号登录[手机号]\n' +
      '\n' +
      '教务系统帮助\n' +
      '成绩查询\n' +
      '开启/关闭成绩自动刷新\n' +
      '设置成绩自动刷新间隔[分钟(大于10)]'
    )
  }
}
