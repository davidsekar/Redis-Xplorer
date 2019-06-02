import * as Redis from "ioredis";

class RedisHandler {
  private redisClient!: Redis.Redis;
  private redisOptions: Redis.RedisOptions;

  constructor(redisHost?: string, port = 6379) {
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

  connect(redisHost?: string, port = 6379): Promise<Redis.Redis> {
    return new Promise(resolve => {      
      this.redisClient = new Redis(redisHost, this.redisOptions);

      this.redisClient.connect(function () {
        console.log("Redis Connected!!!!!!!!!!!!!!!!!!!");
        resolve();
      });
    });
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
    if (!this.isConnected) return Promise.reject();

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

  getKeys(): Promise<string[]> {
    if (!this.isConnected) return Promise.reject();

    return new Promise<string[]>((resolve, reject) => {
      this.redisClient.keys("*", (error: any, result: any[]) => {
        if (error) {
          reject();
          return;
        }
        resolve(result.sort());
      });
    }).catch(e => {
      return [];
    });
  }

  getInfo(): Promise<string> {
    if (!this.isConnected) return Promise.reject();

    return new Promise<string>((resolve, reject) => {
      this.redisClient.info((error: any, result: any) => {
        if (error) {
          reject();
          return "";
        }
        resolve(result);
      });
    }).catch(e => {
      return "";
    });
  }

  setObject(key: string, value: any) {
    if (!this.isConnected) return;
    let keys = Object.keys(value);
    let convertArr = [];
    for (let key of keys) {
      convertArr.push(key);
      convertArr.push(value[key]);
    }
    this.redisClient.hmset(key, convertArr);
  }

  setValue(key: string, value: string) {
    if (!this.isConnected) return;
    this.redisClient.set(key, value);
  }

  delete(key: string) {
    if (!this.isConnected) return;
    this.redisClient.del(key);
  }

  flushAll() {
    if (!this.isConnected) return;
    this.redisClient.flushall();
  }
}
export default RedisHandler;
