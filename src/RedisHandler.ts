import * as Redis from "ioredis";
import { Constants } from "./enum";

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

  getValue(key: string): Promise<any> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<any>((resolve, reject) => {
      this.redisClient.hgetall(`${key}`, (error: any, result: any[]) => {
        if (error) {
          this.redisClient.get(`${key}`, (error: any, singleResult: any) => {
            if (error) {
              console.log(error);
              reject();
            }
            resolve(singleResult);
          });
          return;
        }
        resolve(result);
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
  getKeysV2(pattern: string): Promise<string[]> {
    if (!this.isConnected) { return Promise.reject(); }

    return new Promise<string[]>((resolve, reject) => {
      let limit = Constants.RedisScanLimit || 100;
      let stream = this.redisClient.scanStream({ match: pattern, count: limit });
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

  setObject(key: string, value: any) {
    if (!this.isConnected) { return; }
    let keys = Object.keys(value);
    let convertArr = [];
    for (let key of keys) {
      convertArr.push(key);
      convertArr.push(value[key]);
    }
    this.redisClient.hmset(key, convertArr);
  }

  setValue(key: string, value: string) {
    if (!this.isConnected) { return; }
    this.redisClient.set(key, value);
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
