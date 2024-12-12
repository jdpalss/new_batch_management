import { Datastore } from 'nedb';

export interface PromisifiedStore {
  find(query: any): Promise<any[]>;
  findOne(query: any): Promise<any>;
  insert(doc: any): Promise<any>;
  update(query: any, update: any, options?: Nedb.UpdateOptions): Promise<number>;
  remove(query: any, options?: Nedb.RemoveOptions): Promise<number>;
}

export const promisifyStore = (db: Datastore): PromisifiedStore => ({
  find: (query: any) =>
    new Promise((resolve, reject) => {
      db.find(query, (err: Error | null, docs: any[]) => {
        if (err) reject(err);
        else resolve(docs);
      });
    }),

  findOne: (query: any) =>
    new Promise((resolve, reject) => {
      db.findOne(query, (err: Error | null, doc: any) => {
        if (err) reject(err);
        else resolve(doc);
      });
    }),

  insert: (doc: any) =>
    new Promise((resolve, reject) => {
      db.insert(doc, (err: Error | null, newDoc: any) => {
        if (err) reject(err);
        else resolve(newDoc);
      });
    }),

  update: (query: any, update: any, options: Nedb.UpdateOptions = {}) =>
    new Promise((resolve, reject) => {
      db.update(query, update, options, (err: Error | null, numAffected: number) => {
        if (err) reject(err);
        else resolve(numAffected);
      });
    }),

  remove: (query: any, options: Nedb.RemoveOptions = {}) =>
    new Promise((resolve, reject) => {
      db.remove(query, options, (err: Error | null, numRemoved: number) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    })
});