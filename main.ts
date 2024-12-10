namespace ef {

  export class FwdEduDialClient extends modules.RotaryEncoderClient {
    private _cwAction: (delta: number) => void;
    private _ccwAction: (delta: number) => void;

    constructor(role: string) {
      super(role);

      // 默认情况下，不执行任何操作
      this._cwAction = (_) => {};
      this._ccwAction = (_) => {};

      // 监听旋转编码器的变化
      this.onReadingChangedBy(1, (delta) => {
        if (delta > 0) {
          this._cwAction(delta); // 顺时针
        } else if (delta < 0) {
          this._ccwAction(delta); // 逆时针
        }
      });
    }

    /**
     * 设置当顺时针旋转时触发的动作。
     */
    setOnCWAction(action: (delta: number) => void): void {
      this._cwAction = action;
    }

    /**
     * 设置当逆时针旋转时触发的动作。
     */
    setOnCCWAction(action: (delta: number) => void): void {
      this._ccwAction = action;
    }

    /**
     * 获取每转点击数。
     */
    //% group="Dial"
    //% block="%dial clicks per full turn"
    //% blockId=fwd_dial_get_clicks_per_turn
    clicksPerTurn(): number { 
      // 返回实际每转点击数，假设父类提供了这个方法
      return super.clicksPerTurn(); 
    }

    /**
     * 获取当前位置。
     */
    //% group="Dial"
    //% block="%rotaryencoder absolute position"
    //% blockId=fwd_dial_get_position
    position(): number { 
      // 返回实际位置，假设父类提供了这个方法
      return super.position(); 
    }
  }

  // 创建一个名为 "ef1" 的固定实例
  //% fixedInstance whenUsed weight=1 block="ef1"
  export const ef1 = new FwdEduDialClient("ef1");
}
