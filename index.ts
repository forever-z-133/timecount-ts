/// 单个倒计时任务
interface TimeCountTaskItem {
  /// 倒计时开始时间
  stateTime: number;
  /// 每隔多久跳一帧
  divide: number;
  /// 时间缓存
  lastTime: number;
  /// 每帧时运行的方法
  callback: TimeCountCallback;
}

/// 倒计时每帧时运行的方法
type TimeCountCallback = (time: number, isFinish?: boolean) => any;

/**
 * 倒计时
 * 使用同个计时器，每帧处理任务列表，比每个任务都加计时器要更好点
 *
 * 注意：在 onUnload 最好 stop，不然会内存溢出
 *
 * 其实本方案也不美妙，比如分别在同页面的父子组件中去 start，会稍稍有点误差
 * 另外，单例的 stop 是关闭整个计时器，单个任务的关闭得想办法 remove
 *
 * cosnt timecount = new TimeCount();
 * timecount.start(1591760524673, time => this.time = time, 1e3);
 * timecount.stop();
 */
export default class TimeCount {
  /// 计时器ID
  _timer: any;
  /// 任务列表
  _list: TimeCountTaskItem[] = [];

  // 单例
  static instance: TimeCount = new TimeCount();
  static getInstance() {
    return this.instance;
  }

  // 开始倒计时
  start() {
    this.stop();
    this._timer = this._start(() => {
      const { _list } = this;
      if (_list.length < 1) return;
      _list.forEach((item: TimeCountTaskItem, index: number) => {
        const { lastTime, divide } = item;
        const now: number = Date.now();
        if (lastTime + divide <= now) {
          item.lastTime = now;
          this.count(item, index);
        }
      });
    });
  }
  // 停止倒计时
  stop() {
    this._list = [];
    this._timer && this._stop(this._timer);
  }
  _start(callback: () => void): any {
    if (requestAnimationFrame) {
      return requestAnimationFrame(callback);
    } else {
      return setInterval(callback, 1000 / 60);
    }
  }
  _stop(timer: any) {
    if (requestAnimationFrame) cancelAnimationFrame(timer);
    else clearInterval(timer);
  }
  // 加入任务，计时器一直跑，任务队列中有任务时就会运行
  add(stateTime: number, callback: TimeCountCallback, divide = 1000) {
    if (!stateTime || stateTime <= 0) return;
    const lastTime: number = Date.now();
    const item: TimeCountTaskItem = { stateTime, callback, divide, lastTime };
    this._list.push(item);
    this.count(item, this._list.length - 1);
  }
  // 删除单个任务，但 callback 必须抽离，暂无较优方案
  rmeove(callback: TimeCountCallback) {
    this._list = this._list.filter((item: TimeCountTaskItem, index: number) => {
      if (item.callback !== callback) return true;
    });
  }
  // 单个任务的某一帧
  count(item: TimeCountTaskItem, index: number) {
    const { stateTime, callback, divide } = item;
    const newTime = stateTime - divide;
    callback && callback(stateTime, newTime < 0);
    if (newTime < 0) {
      this._list.splice(index, 1);
      return;
    }
    item.stateTime = newTime;
  }
}

// 转字符串，如 x天x小时x分x秒
const dayFormat: number = 24 * 60 * 60 * 1000;
const hourFormat: number = 60 * 60 * 1000;
const minuteFormat: number = 60 * 1000;
const secondFormat: number = 1000;
export function format(time: number, zero = false) {
  const day = (time / dayFormat) >> 0;
  time -= day * dayFormat;
  const hour = (time / hourFormat) >> 0;
  time -= hour * hourFormat;
  const minute = (time / minuteFormat) >> 0;
  time -= minute * minuteFormat;
  const second = (time / secondFormat) >> 0;
  let result = "";
  // if (zero) day = day.padStart(2, '0');
  if (day > 0) result += day + "天";
  if (hour > 0) result += hour + "小时";
  if (minute > 0) result += minute + "分";
  if (second > 0) result += second + "秒";
  return result;
}
