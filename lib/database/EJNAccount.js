import { db } from './init.js'

export default class EJNAccount {
  constructor (account_id, password) {
    this.account_id = account_id
    this.password = password
    this.cookie = ''
  }

  async load () {
    let row = db.prepare('select * from EJNAccount where account_id = ?')
      .get(this.account_id)
    if (row) {
      this.password = row.password
      this.cookie = row.cookie
      return true
    }
    return false
  }

  async save () {
    db.prepare('insert or replace into EJNAccount (account_id, password, cookie) values (?, ?, ?)')
      .run(this.account_id, this.password, this.cookie)
      .finalize()
  }
}