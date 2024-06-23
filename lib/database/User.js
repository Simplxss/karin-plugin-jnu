import EJNAccount from './EJNAccount.js'
import { db } from './init.js'

export default class User {
  constructor (user_from, user_id, ejn_account = [], data = { ejn_account_index: -1 }, refresh_time = null) {
    this.user_from = user_from
    this.user_id = user_id
    this.ejn_account = ejn_account
    this.data = data
    this.refresh_time = refresh_time
  }

  async load () {
    await new Promise((reslove) => {
      db.prepare('select * from User where user_from = ? and user_id = ?')
        .get([this.user_from, this.user_id], (err, row) => {
          if (err) {
            console.log(err)
          }

          if (row) {
            this.ejn_account = JSON.parse(row.ejn_account)
            this.data = JSON.parse(row.data)
            this.refresh_time = row.refresh_time
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

  async deleteEJNAccount (index) {
    this.ejn_account.splice(index, 1)
    if (this.data.ejn_account_index >= index) {
      this.data.ejn_account_index--
    }
    await this.save()
  }

  async getEJNAccount () {
    return this.data.ejn_account_index == -1 ? null : await new EJNAccount(this.ejn_account[this.data.ejn_account_index]).load()
  }

  async setEJNAccount (index) {
    this.data.ejn_account_index = index
    await this.updateData()
  }

  async getData (key) {
    return this.data[key]
  }

  async setData (key, value) {
    this.data[key] = value
    await this.updateData()
  }

  async setRefreshTime (time) {
    this.refresh_time = time
    await this.updateRefreshTime()
  }

  async save () {
    db.prepare('insert or replace into User (user_from, user_id, ejn_account, data, refresh_time) values (?, ?, ?, ?)')
      .run(this.user_from, this.user_id, JSON.stringify(this.ejn_account), JSON.stringify(this.data), this.refresh_time)
      .finalize()
  }

  async updateData () {
    db.prepare('update User set data = ? where user_from = ? and user_id = ?')
      .run(JSON.stringify(this.data), this.user_from, this.user_id)
      .finalize()
  }

  async updateRefreshTime () {
    db.prepare('update User set refresh_time = ? where user_from = ? and user_id = ?')
      .run(this.refresh_time, this.user_from, this.user_id)
      .finalize()
  }
}

/**
 * get all users that need to be refreshed
 * @param {number} time 
 * @returns {Promise<User[]>}
 */
export async function getNeedRefreshedUser (time) {
  return await new Promise((reslove) => {
    db.prepare('select * from User where refresh_time <= ?')
      .all([time], (err, rows) => {
        if (err) {
          console.log(err)
        }
        reslove(rows.map(row => new User(row.user_from, row.user_id, JSON.parse(row.ejn_account), JSON.parse(row.data), row.refresh_time)))
      })
  })
}