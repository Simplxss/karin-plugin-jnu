import EJNAccount from './EJNAccount.js'
import { db } from './init.js'

export default class User {
  constructor (user_id) {
    this.user_id = user_id
    this.ejn_account = []
    this.data = { ejn_account_index: -1 }
  }

  async load () {
    await new Promise((reslove) => {
      db.prepare('select * from User where user_id = ?')
        .get([this.user_id], (err, row) => {
          if (err) {
            console.log(err)
          }

          if (row) {
            this.ejn_account = JSON.parse(row.ejn_account)
            this.data = JSON.parse(row.data)
          }
          reslove()
        })
    })
    return this
  }

  async addEJNAccount (ejn_account) {
    if (!this.ejn_account.find(account_id => account_id === ejn_account.account_id))
      this.ejn_account.push(ejn_account.account_id)
    this.data.ejn_account_index = this.ejn_account.indexOf(ejn_account.account_id)
    await this.save()
  }

  async getEJNAccount () {
    return this.data.ejn_account_index == -1 ? null : await new EJNAccount(this.ejn_account[this.data.ejn_account_index]).load()
  }

  async setEJNAccount (index) {
    this.data.ejn_account_index = index
    await this.save()
  }

  async save () {
    db.prepare('insert or replace into User (user_id, ejn_account, data) values (?, ?, ?)')
      .run(this.user_id, JSON.stringify(this.ejn_account), JSON.stringify(this.data))
      .finalize()
  }
}