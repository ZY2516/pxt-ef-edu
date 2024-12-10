namespace ef {

  export class FwdEduDialClient extends modules.RotaryEncoderClient {
    private _cwAction: (delta: number) => void;
    private _ccwAction: (delta: number) => void;

    constructor(role: string) {
      super(role);

      this.onReadingChangedBy(1, (delta) => {
        if (delta > 0) {
          this._cwAction(delta); // 顺时针
        } else if (delta < 0) {
          this._ccwAction(delta); // 逆时针
        }
      });
    }

    setOnCWAction(action: (delta: number) => void): void {
      this._cwAction = action;
    }

    setOnCCWAction(action: (delta: number) => void): void {
      this._ccwAction = action;
    }

    // 假设 RotaryEncoderClient 中实现了这些方法
    clicksPerTurn(): number { 
      // 返回实际每转点击数
      return /* 实际每转点击数 */;
    }

    position(): number { 
      // 返回实际位置
      return /* 实际位置 */;
    }
  }

  export const ef1 = new FwdEduDialClient("ef1");
}
