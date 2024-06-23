import sqlite3_pkg from 'sqlite3'
import { dataPath } from '../imports/dir.js'
import { logger } from '../../../../lib/index.js'

const sqlite3 = sqlite3_pkg.verbose()

let db = new sqlite3.Database(dataPath + '/data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      logger.error("[DATABASE] Can't open database file.")
      return
    }
    db.exec(`
          create table if not exists User (
              user_from text not null,
              user_id text not null,
              ejn_account text,
              data text,
              refresh_time int,
              primary key (user_from, user_id)
          );
          create table if not exists EJNAccount (
              account_id int primary key not null,
              password text not null,
              cookie text
          );
        `, (err) => {
      if (err) {
        logger.error("[DATABASE] Can't create tables.")
        return
      }
    })
  }
)

export { db }