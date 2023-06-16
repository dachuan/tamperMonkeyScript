/*
 * 设置按键侦听类
 * 方便其它脚本调用
 * const keyHandler = new KeyHandler();
 *
 * 2023/6/16 上午11:46
 * ------------------------------
 *  add usage reference
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

// usage reference
/*
keyHandler.singleKey('k', () => {
  console.log('k');
});

keyHandler.combinationKey(['Control', 'k'], () => {
  console.log('Control, k');
});

keyHandler.combinationKey(['Meta', 'k'], () => {
  console.log('Meta, k');
    // bug : k is not released
});

keyHandler.combinationKey(['Meta', 'j'], () => {
  console.log('Meta, j');
});

keyHandler.combinationKey(['Control','Shift', 'K'], () => {
  console.log('Control, shift, k');
});

keyHandler.combinationKey(['Control', 'j'], () => {
  console.log('Control, j');
});

keyHandler.doubleKey('k', 1000, () => {
  console.log('double k');
});

keyHandler.doubleKey('j', 1000, () => {
  console.log('double j');
});

keyHandler.comboKey(['Control', 'q'], 'k', () => {
  console.log('leader key is ctrl+q, follow key is k');
});

keyHandler.comboKey(['Control', 'q'], 'j', () => {
  console.log('leader key is ctrl+q, follow key is j');
});
*/
