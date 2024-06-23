import { db } from './init.js'

export default class EJNAccount {
  constructor (account_id) {
    this.account_id = account_id
    this.password = ''
    this.cookie = ''
  }

  async load () {
    await new Promise((reslove) => {
      db.prepare('select * from EJNAccount where account_id = ?')
        .get([this.account_id], (err, row) => {
          if (err) {
            console.log(err)
          }

          if (row) {
            this.password = row.password
            this.cookie = JSON.parse(row.cookie)
          }
          reslove()
        })
    })
    return this
  }

  create (password, cookie) {
    this.password = password
    this.cookie = cookie
  }

  async setCookie (cookie) {
    this.cookie = cookie
    await this.updateCookie()
  }

  async save () {
    db.prepare('insert or replace into EJNAccount (account_id, password, cookie) values (?, ?, ?)')
      .run(this.account_id, this.password, JSON.stringify(this.cookie))
      .finalize()
  }

  async updateCookie () {
    db.prepare('update EJNAccount set cookie = ? where account_id = ?')
      .run(JSON.stringify(this.cookie), this.account_id)
      .finalize()
  }
}