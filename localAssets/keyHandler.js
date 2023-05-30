/*
 * 设置按键侦听类
 * 方便其它脚本调用
 * const keyHandler = new KeyHandler();
 */

class KeyHandler {
  constructor() {
    this.keyDown = {};
    this.lastKey = null;
    this.lastKeyDownTime = null;
    this.leaderKeyDown = false;
    this.leaderKey = [];

    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e) {
    this.keyDown[e.key] = true;

    if (this.leaderKeyDown) {
      this.checkLeaderFollowKey(e.key);
    }
  }

  handleKeyUp(e) {
    this.keyDown[e.key] = false;
  }

  singleKey(key, callback) {
    document.addEventListener('keydown', (e) => {
      if (e.key === key) {
        callback();
        //console.log(this.keyDown);
      }
    });
  }

  combinationKey(keys, callback) {
    document.addEventListener('keydown', (e) => {
      const allKeysPressed = keys.every((key) => this.keyDown[key]);
      if (allKeysPressed) {
        callback();
        //console.log(this.keyDown);
      }
    });
  }

  doubleKey(key, interval, callback) {
    document.addEventListener('keydown', (e) => {
      if (e.key === key) {
        const currentTime = new Date().getTime();
        if (this.lastKey === key && currentTime - this.lastKeyDownTime < interval) {
          callback();
        }
        this.lastKey = key;
        this.lastKeyDownTime = currentTime;
      }
    });
  }

  comboKey(leaderKeys, followKey, callback) {
    this.leaderKey = leaderKeys;
    document.addEventListener('keydown', (e) => {
      const allKeysPressed = leaderKeys.every((key) => this.keyDown[key]);
      if (allKeysPressed) {
        this.leaderKeyDown = true;
      }
    });

    this.checkLeaderFollowKey = (key) => {
      if (key === followKey) {
        callback();
      }
      this.leaderKeyDown = false;
    };
  }
}
