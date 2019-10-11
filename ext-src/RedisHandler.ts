import * as Redis from "ioredis";
import { DataType, Constants } from "./enum";

class RedisHandler {
  private redisClient!: Redis.Redis;
  private redisOptions: Redis.RedisOptions;

  constructor() {
    this.redisOptions = {
      retryStrategy: function (times) {
        if (times < 3) {
          return 200;
        }
        return false;
      },
      lazyConnect: true,
      maxRetriesPerRequest: 1
    };
  }

  connect(redisHost?: string): Promise<Redis.Redis> {
    return new Promise(resolve => {
      this.redisClient = new Redis(redisHost, this.redisOptions);

      this.redisClient.connect(function () {
        resolve();
      });
    });
  }

  setTlsOn() {
    this.redisOptions.tls = true as any;
  }

  disconnect(): void {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  get isConnected(): Boolean {
    if (this.redisClient) {
      return true;
    }
    return false;
  }

  /**
   * This function returns datatype of the current selected redis key
   * @param key redis key
   */
  getType(key: string): Promise<string> {
    return this.redisClient.type(key).then((res) => { return res; });
  }

  /**
   /**
   * This function returns list of values retrived from a List datatype
   * @param key redis key
   * @param start specify staring index of items to fetch from
   * @param end specify the number of items to fetch
   */
  getListValues(key: string, start: number = 0, count: number = Constants.DefaultRedisListItemsLimit): Promise<string[]> {
    return this.redisClient.lrange(key, start, start + count - 1).then((res) => { return res; });
  }

  /**
   * Returns the number of items in a given redis list
   * @param key redis list name
   */
  getListLength(key: string): Promise<number> {
    return this.redisClient.llen(key).then(res => { return res; });
  }

  /**
   * This function returns a string representation of current selected redis key based on its datatype
   * @param key redis key
   */
  getValue(key: string): Promise<any> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<any>((resolve, reject) => {
      this.getType(key).then((res) => {
        console.log(res);
        switch (res) {
          case DataType.String:
            this.redisClient.get(key, (error, result) => {
              if (error) {
                console.log(error);
                reject();
              }
              resolve(result);
            });
            break;
          case DataType.List:
            this.redisClient.lrange(key, 0, 1000, (error, result) => {
              if (error) {
                console.log(error);
                reject();
              }
              resolve(result);
            });
            break;
          case DataType.Set:
            this.redisClient.smembers(key, (error, result) => {
              if (error) {
                console.log(error);
                reject();
              }
              resolve(result);
            });
            break;
          case DataType.ZSet:
            this.redisClient.zrange(key, 0, 1000, "WITHSCORES", (error, result) => {
              if (error) {
                console.log(error);
                reject();
              }
              resolve(result);
            });
            break;
          case DataType.Hash:
            this.redisClient.hgetall(`${key}`, (error: any, result: any[]) => {
              if (error) {
                console.log(error);
                reject();
              }
              resolve(JSON.stringify(result));
            });
            break;
          case DataType.Stream:
            resolve(this.redisClient.xrange(key, "-", "+"));
            break;
          default:
            console.warn("Unknown data type!");
            reject();
            break;
        }
      }, (reason) => {
        reject(reason);
      });
    }).catch(e => {
      console.log(e);
      return {};
    });
  }

  /**
   * This function returns all the redis keys after filtering using text pattern
   * Warning: This uses Redis keys() method, that should not be used in production environment
   * with large number of keys.
   * @param pattern Text pattern to use and filter the Redis keys
   */
  getKeys(pattern: string): Promise<string[]> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<string[]>((resolve, reject) => {
      this.redisClient.keys(pattern, (error: any, result: any[]) => {
        if (error) {
          reject();
          return;
        }
        resolve(result.sort());
      });
    }).catch(() => {
      return [];
    });
  }

  /**
   * This function returns all the redis keys after filtering using text pattern.
   * This method can be safetly used in production environment, as it reads small set of records on 
   * each scan request.
   * @param pattern Text pattern to use and filter the Redis keys
   */
  getKeysV2(pattern: string, scanLimit: number): Promise<string[]> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<string[]>((resolve, reject) => {
      let stream = this.redisClient.scanStream({ match: pattern, count: scanLimit });
      let result: any[] = [];

      stream.on('data', (resultKeys) => {
        for (var i = 0; i < resultKeys.length; i++) {
          result.push(resultKeys[i]);
        }
      });

      stream.on('error', (err) => {
        console.log(err);
        reject();
        return;
      });

      stream.on('end', () => {
        resolve(result.sort());
      });
    }).catch(() => {
      return [];
    });
  }

  getInfo(): Promise<string> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<string>((resolve, reject) => {
      this.redisClient.info((error: any, result: any) => {
        if (error) {
          reject();
          return;
        }
        resolve(result);
      });
    }).catch(() => {
      return "";
    });
  }

  /**
   * This function sets the value for the provided redis key
   * @param key redis key
   * @param value value to set for the provided key
   */
  setValue(key: string, value: any): Promise<boolean> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<boolean>((resolve, reject) => {
      this.redisClient.type(key, (error, result) => {
        switch (result) {
          case "string":
            this.redisClient.set(key, value);
            resolve(true);
            break;
          default:
            console.warn("Set method not implemented for data type => " + result);
            reject();
            break;
        }
      });
    }).catch(() => {
      return false;
    });
  }

  delete(key: string) {
    if (!this.isConnected) { return; }
    this.redisClient.del(key);
  }

  flushAll() {
    if (!this.isConnected) { return; }
    this.redisClient.flushall();
  }
}
export default RedisHandler;
