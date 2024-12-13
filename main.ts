namespace ef {
  // export const enum DialDirection {
  //   //% block="↻"
  //   CW,
  //   //% block="↺"
  //   CCW
  // }

  // /**
  //  * Wrapper for FWD Edu rotary encoder, aka "Dial"
  //  **/
  // //% fixedInstances
  // export class efDialClient extends modules.RotaryEncoderClient {
  //   private _cwAction: (delta: number) => void;
  //   private _ccwAction: (delta: number) => void;

  //   constructor(role: string) {
  //     super(role);

  //     this._cwAction = (_) => { };
  //     this._ccwAction = (_) => { };

  //     this.onReadingChangedBy(1, (delta: number) => {
  //       if (delta > 0) {
  //         this._cwAction(delta);
  //       } else {
  //         this._ccwAction(delta);
  //       }
  //     });
  //   }

  //   /**
  //    * The number of steps that make up a full turn of the dial
  //    */
  //   //% group="Dial"
  //   //% block="$this clicks per full turn"
  //   //% rotaryencoder.defl=dial1
  //   //% blockId=ef_dial_get_clicks_per_turn
  //   efClicksPerTurn(): number { return this.clicksPerTurn(); }

  //   /**
  //    * The absolute position of the dial since it was last connected.
  //    * Positive numbers are clockwise, negative are counter-clockwise. Zero is the starting position.
  //    * This number reflects the sum of all movements, so three steps clockwise followed by five counter-clockwise will read -1 (includes zero as a position)
  //    */
  //   //% group="Dial"
  //   //% block="$this absolute position"
  //   //% blockId=ef_dial_get_position
  //   efPosition(): number { return this.position(); }

  //   /**
  //    * Run code when the dial is turned in a specific direction
  //    * @param direction choose between clockwise and counter-clockwise
  //    * @param difference the number of dial positions turned since the last update
  //    */
  //   //% draggableParameters="reporter"
  //   //% group="Dial"
  //   //% block="on $this turned by $direction $difference"
  //   //% blockId=ef_dial_on_dial_turned
  //   //% weight=98
  //   efOnDialTurned(direction: DialDirection, handler: (difference: number) => void): void {
  //     if (direction === DialDirection.CW) {
  //       this._cwAction = handler;
  //     } else {
  //       this._ccwAction = handler;
  //     }
  //   }
  // }

  // //% fixedInstance whenUsed weight=1 block="dial1"
  // export const dial1 = new efDialClient("dial1");

  //button
  /**
     * A push-button, which returns to inactive position when not operated anymore.
     **/
  //% fixedInstances blockGap=8
  export class ButtonClient extends jacdac.SimpleSensorClient {
    private readonly _analog: jacdac.RegisterClient<[boolean]>
    private _pressed: boolean = false
    private _holdDuration: number = 0

    constructor(role: string) {
      super(efjacdac.SRV_BUTTON, role, "u0.16")

      this._analog = this.addRegister<[boolean]>(
        efjacdac.ButtonReg.Analog,
        efjacdac.ButtonRegPack.Analog,
        jacdac.RegisterClientFlags.Optional |
        jacdac.RegisterClientFlags.Const
      )

      this.on(jacdac.EVENT, pkt => this.handleEvent(pkt))
    }

    private handleEvent(pkt: jacdac.JDPacket) {
      const code = pkt.eventCode
      switch (code) {
        case efjacdac.ButtonEvent.Up:
          this._pressed = false
          this._holdDuration = pkt.intData
          break
        case efjacdac.ButtonEvent.Hold:
          this._pressed = true
          this._holdDuration = pkt.intData
          break
        case efjacdac.ButtonEvent.Down:
          this._pressed = true
          this._holdDuration = 0
          break
      }
    }

    /**
     * Indicates the pressure state of the button, where ``0`` is open.
     */
    //% callInDebugger
    //% group="Button"
    //% weight=100
    pressure(): number {
      return this.reading() * 100
    }

    /**
     * Indicates if the button provides analog ``pressure`` readings.
     */
    //% callInDebugger
    //% group="Button"
    //% weight=95
    analog(): boolean {
      this.start()
      const values = this._analog.pauseUntilValues() as any[]
      return !!values[0]
    }

    /**
     * Determines if the button is pressed currently.
     *
     * If the event ``down`` is observed, ``pressed`` is true; if ``up`` or ``hold`` are observed, ``pressed`` is false.
     * To initialize, wait for any event or timeout to ``pressed`` is true after 750ms (1.5x hold time).
     */
    //% callInDebugger
    //% group="Button"
    //% block="%button pressed"
    //% blockId=jacdac_button_pressed___get
    //% weight=90
    pressed(): boolean {
      this.start()
      return this._pressed
    }

    /**
     * Run code when the pressure changes by the given threshold value.
     */
    //% group="Button"
    //% weight=85
    //% threshold.min=0
    //% threshold.max=100
    //% threshold.defl=5
    onPressureChangedBy(threshold: number, handler: () => void): void {
      this.onReadingChangedBy(threshold / 100, handler)
    }

    /**
     * Register code to run when an event is raised
     */
    //% group="Button"
    //% blockId=jacdac_on_button_event
    //% block="on %button %event"
    //% weight=80
    onEvent(ev: efjacdac.ButtonEvent, handler: () => void): void {
      this.registerEvent(ev, handler)
    }

    /**
     * The latest reported hold duration when the button is down.
     *
     * The `down` and `hold` events also report the total hold duration in milliseconds.
     * The value is the last hold duration while the button is up.
     */
    //% callInDebugger
    //% group="Button"
    //% block="%button hold duration (ms)"
    //% blockId=jacdac_button_hold_duration_get
    //% weight=75
    holdDuration(): number {
      return this._holdDuration
    }

    /**
     * Emitted when button goes from inactive to active.
     */
    //% group="Button"
    //% weight=70
    onDown(handler: () => void): void {
      this.registerEvent(efjacdac.ButtonEvent.Down, handler)
    }
    /**
     * Emitted when button goes from active to inactive. The 'time' parameter
     * records the amount of time between the down and up events.
     */
    //% group="Button"
    //% weight=65
    onUp(handler: () => void): void {
      this.registerEvent(efjacdac.ButtonEvent.Up, handler)
    }
    /**
     * Emitted when the press time is greater than 500ms, and then at least every 500ms
     * as long as the button remains pressed. The 'time' parameter records the the amount of time
     * that the button has been held (since the down event).
     */
    //% group="Button"
    //% weight=50
    onHold(handler: () => void): void {
      this.registerEvent(efjacdac.ButtonEvent.Hold, handler)
    }
  }
  //% fixedInstance whenUsed weight=1 block="button1"
  export const button1 = new ButtonClient("button1")

  //% fixedInstance whenUsed weight=2 block="button2"
  export const button2 = new ButtonClient("button2")

  //% fixedInstance whenUsed weight=3 block="button3"
  export const button3 = new ButtonClient("button3")

  //% fixedInstance whenUsed weight=4 block="button4"
  export const button4 = new ButtonClient("button4")

  //servo
  /**
     * Servo is a small motor with arm that can be pointing at a specific direction.
     * Typically a servo angle is between 0° and 180° where 90° is the middle resting position.
     *
     * The `min_pulse/max_pulse` may be read-only if the servo is permanently affixed to its Jacdac controller.
     **/
  //% fixedInstances blockGap=8
  export class ServoClient extends jacdac.SimpleSensorClient {
    private readonly _angle: jacdac.RegisterClient<[number]>
    private readonly _enabled: jacdac.RegisterClient<[boolean]>
    private readonly _offset: jacdac.RegisterClient<[number]>
    private readonly _minAngle: jacdac.RegisterClient<[number]>
    private readonly _minPulse: jacdac.RegisterClient<[number]>
    private readonly _maxAngle: jacdac.RegisterClient<[number]>
    private readonly _maxPulse: jacdac.RegisterClient<[number]>
    private readonly _stallTorque: jacdac.RegisterClient<[number]>
    private readonly _responseSpeed: jacdac.RegisterClient<[number]>
    private _continuousMode: boolean = undefined

    constructor(role: string) {
      super(efjacdac.SRV_SERVO, role, efjacdac.ServoRegPack.ActualAngle)

      this._angle = this.addRegister<[number]>(
        efjacdac.ServoReg.Angle,
        efjacdac.ServoRegPack.Angle
      )
      this._enabled = this.addRegister<[boolean]>(
        efjacdac.ServoReg.Enabled,
        efjacdac.ServoRegPack.Enabled
      )
      this._offset = this.addRegister<[number]>(
        efjacdac.ServoReg.Offset,
        efjacdac.ServoRegPack.Offset
      )
      this._minAngle = this.addRegister<[number]>(
        efjacdac.ServoReg.MinAngle,
        efjacdac.ServoRegPack.MinAngle,
        jacdac.RegisterClientFlags.Const
      )
      this._minPulse = this.addRegister<[number]>(
        efjacdac.ServoReg.MinPulse,
        efjacdac.ServoRegPack.MinPulse,
        jacdac.RegisterClientFlags.Optional
      )
      this._maxAngle = this.addRegister<[number]>(
        efjacdac.ServoReg.MaxAngle,
        efjacdac.ServoRegPack.MaxAngle,
        jacdac.RegisterClientFlags.Const
      )
      this._maxPulse = this.addRegister<[number]>(
        efjacdac.ServoReg.MaxPulse,
        efjacdac.ServoRegPack.MaxPulse,
        jacdac.RegisterClientFlags.Optional
      )
      this._stallTorque = this.addRegister<[number]>(
        efjacdac.ServoReg.StallTorque,
        efjacdac.ServoRegPack.StallTorque,
        jacdac.RegisterClientFlags.Optional |
        jacdac.RegisterClientFlags.Const
      )
      this._responseSpeed = this.addRegister<[number]>(
        efjacdac.ServoReg.ResponseSpeed,
        efjacdac.ServoRegPack.ResponseSpeed,
        jacdac.RegisterClientFlags.Optional |
        jacdac.RegisterClientFlags.Const
      )

      this.on(jacdac.CONNECT, () => {
        this._minAngle.query()
        this._maxAngle.query()
      })
    }

    /**
     * Specifies the angle of the arm (request).
     */
    //% callInDebugger
    //% group="Servo"
    //% block="%servo angle (°)"
    //% blockId=jacdac_servo_angle___get
    //% weight=1000
    angle(): number {
      this.start()
      const values = this._angle.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * Specifies the angle of the arm (request).
     */
    //% group="Servo"
    //% blockId=jacdac_servo_angle___set
    //% block="set %servo angle to %value (°)"
    //% weight=995
    //% value.min=0
    //% value.max=180
    setAngle(value: number) {
      this.internalSetAngle(value)
      this.internalSetContinuous(false)
    }

    private internalSetAngle(value: number) {
      this.start()
      this.setEnabled(true)
      const values = this._angle.values as any[]
      if (value !== values[0]) {
        values[0] = value
        this._angle.values = values as [number]
      }
    }

    private internalSetContinuous(enabled: boolean) {
      if (this._continuousMode !== enabled) {
        this._continuousMode = enabled
        this.setReg(jacdac.SystemReg.ClientVariant, "s", [
          enabled ? `cont=1` : ``,
        ])
      }
    }

    /**
     * Set the throttle on a continuous servo
     * @param speed the throttle of the motor from -100% to 100%
     */
    //% weight=990
    //% blockId=jacdac_servo_run block="servo continuous %servo run at %speed=speedPicker \\%"
    //% servo.fieldEditor="gridpicker"
    //% servo.fieldOptions.width=220
    //% servo.fieldOptions.columns=2
    //% group="Servo (Continuous)"
    //% blockGap=8
    run(speed: number): void {
      const minAngle = this.minAngle()
      const maxAngle = this.maxAngle()
      const degrees = Math.map(
        Math.clamp(-100, 100, Math.round(speed)),
        -100,
        100,
        minAngle,
        maxAngle
      )
      this.internalSetAngle(degrees)
      this.internalSetContinuous(true)
    }

    /**
     * Stop sending commands to the servo so that its rotation will stop at the current position.
     */
    // On a normal servo this will stop the servo where it is, rather than return it to neutral position.
    // It will also not provide any holding force.
    //% weight=985
    //% blockId=jacdac_servo_stop block="servo continuous %servo stop"
    //% servo.fieldEditor="gridpicker"
    //% servo.fieldOptions.width=220
    //% servo.fieldOptions.columns=2
    //% group="Servo (Continuous)"
    //% blockGap=8
    stop() {
      this.run(0)
      this.setEnabled(false)
    }

    /**
     * Turn the power to the servo on/off.
     */
    //% callInDebugger
    //% group="Servo"
    //% block="%servo enabled"
    //% blockId=jacdac_servo_enabled___get
    //% weight=980
    enabled(): boolean {
      this.start()
      const values = this._enabled.pauseUntilValues() as any[]
      return !!values[0]
    }

    /**
     * Turn the power to the servo on/off.
     */
    //% group="Servo"
    //% blockId=jacdac_servo_enabled___set
    //% block="set %servo %value=toggleOnOff"
    //% weight=975
    setEnabled(value: boolean) {
      this.start()
      const values = this._enabled.values as any[]
      if (!!value !== !!values[0]) {
        values[0] = value ? 1 : 0
        this._enabled.values = values as [boolean]
      }
    }

    /**
     * Correction applied to the angle to account for the servo arm drift.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=970
    offset(): number {
      this.start()
      const values = this._offset.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * Correction applied to the angle to account for the servo arm drift.
     */
    //% group="Servo"
    //% weight=965
    setOffset(value: number) {
      this.start()
      const values = this._offset.values as any[]
      if (value !== values[0]) {
        values[0] = value
        this._offset.values = values as [number]
      }
    }

    /**
     * Lowest angle that can be set, typiclly 0 °.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=960
    minAngle(): number {
      this.start()
      const values = this._minAngle.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * The length of pulse corresponding to lowest angle.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=955
    minPulse(): number {
      this.start()
      const values = this._minPulse.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * The length of pulse corresponding to lowest angle.
     */
    //% group="Servo"
    //% weight=950
    //% value.min=0
    //% value.max=65535
    //% value.defl=500
    setMinPulse(value: number) {
      this.start()
      const values = this._minPulse.values as any[]
      if (value !== values[0]) {
        values[0] = value
        this._minPulse.values = values as [number]
      }
    }

    /**
     * Highest angle that can be set, typically 180°.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=945
    maxAngle(): number {
      this.start()
      const values = this._maxAngle.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * The length of pulse corresponding to highest angle.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=940
    maxPulse(): number {
      this.start()
      const values = this._maxPulse.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * The length of pulse corresponding to highest angle.
     */
    //% group="Servo"
    //% weight=935
    //% value.min=0
    //% value.max=65535
    //% value.defl=2500
    setMaxPulse(value: number) {
      this.start()
      const values = this._maxPulse.values as any[]
      if (value !== values[0]) {
        values[0] = value
        this._maxPulse.values = values as [number]
      }
    }

    /**
     * The servo motor will stop rotating when it is trying to move a ``stall_torque`` weight at a radial distance of ``1.0`` cm.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=930
    stallTorque(): number {
      this.start()
      const values = this._stallTorque.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * Time to move 60°.
     */
    //% callInDebugger
    //% group="Servo"
    //% weight=925
    responseSpeed(): number {
      this.start()
      const values = this._responseSpeed.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * The current physical position of the arm, if the device has a way to sense the position.
     */
    //% callInDebugger
    //% group="Servo"
    //% block="%servo actual angle (°)"
    //% blockId=jacdac_servo_actual_angle___get
    //% weight=920
    actualAngle(): number {
      return this.reading()
    }

    /**
     * Run code when the actual angle changes by the given threshold value.
     */
    //% group="Servo"
    //% blockId=jacdac_servo_on_actual_angle_change
    //% block="on %servo actual angle changed by %threshold (°)"
    //% weight=915
    //% threshold.min=0
    //% threshold.defl=1
    onActualAngleChangedBy(threshold: number, handler: () => void): void {
      this.onReadingChangedBy(threshold, handler)
    }
  }

  //% fixedInstance whenUsed weight=1 block="servo1"
  export const servo1 = new ServoClient("servo1")
  //% fixedInstance whenUsed weight=2 block="servo2"
  export const servo2 = new ServoClient("servo2")
  //% fixedInstance whenUsed weight=3 block="servo3"
  export const servo3 = new ServoClient("servo3")
  //% fixedInstance whenUsed weight=4 block="servo4"
  export const servo4 = new ServoClient("servo4")

  //relay
  /**
     * A switching relay.
     *
     * The contacts should be labelled `NO` (normally open), `COM` (common), and `NC` (normally closed).
     * When relay is energized it connects `NO` and `COM`.
     * When relay is not energized it connects `NC` and `COM`.
     * Some relays may be missing `NO` or `NC` contacts.
     * When relay module is not powered, or is in bootloader mode, it is not energized (connects `NC` and `COM`).
     **/
  //% fixedInstances blockGap=8
  export class RelayClient extends jacdac.Client {
    private readonly _active: jacdac.RegisterClient<[boolean]>
    private readonly _variant: jacdac.RegisterClient<[jacdac.RelayVariant]>
    private readonly _maxSwitchingCurrent: jacdac.RegisterClient<[number]>

    constructor(role: string) {
      super(efjacdac.SRV_RELAY, role)

      this._active = this.addRegister<[boolean]>(
        efjacdac.RelayReg.Active,
        efjacdac.RelayRegPack.Active
      )
      this._variant = this.addRegister<[jacdac.RelayVariant]>(
        efjacdac.RelayReg.Variant,
        efjacdac.RelayRegPack.Variant,
        jacdac.RegisterClientFlags.Optional |
        jacdac.RegisterClientFlags.Const
      )
      this._maxSwitchingCurrent = this.addRegister<[number]>(
        efjacdac.RelayReg.MaxSwitchingCurrent,
        efjacdac.RelayRegPack.MaxSwitchingCurrent,
        jacdac.RegisterClientFlags.Optional |
        jacdac.RegisterClientFlags.Const
      )
    }

    /**
     * Indicates whether the relay circuit is currently energized or not.
     */
    //% callInDebugger
    //% group="Relay"
    //% block="%relay active"
    //% blockId=jacdac_relay_active___get
    //% weight=100
    active(): boolean {
      this.start()
      const values = this._active.pauseUntilValues() as any[]
      return !!values[0]
    }

    /**
     * Indicates whether the relay circuit is currently energized or not.
     */
    //% group="Relay"
    //% blockId=jacdac_relay_active___set
    //% block="set %relay active to %value"
    //% weight=99
    setActive(value: boolean) {
      this.start()
      const values = this._active.values as any[]
      values[0] = value ? 1 : 0
      this._active.values = values as [boolean]
    }

    /**
     * Describes the type of relay used.
     */
    //% callInDebugger
    //% group="Relay"
    //% weight=98
    variant(): jacdac.RelayVariant {
      this.start()
      const values = this._variant.pauseUntilValues() as any[]
      return values[0]
    }

    /**
     * Maximum switching current for a resistive load.
     */
    //% callInDebugger
    //% group="Relay"
    //% weight=97
    maxSwitchingCurrent(): number {
      this.start()
      const values = this._maxSwitchingCurrent.pauseUntilValues() as any[]
      return values[0]
    }
  }

  //% fixedInstance whenUsed weight=1 block="relay1"
  export const relay1 = new RelayClient("relay1")
}