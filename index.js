(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.format = void 0;
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
    var TimeCount = /** @class */ (function () {
        function TimeCount() {
            /// 任务列表
            this._list = [];
        }
        TimeCount.getInstance = function () {
            return this.instance;
        };
        // 开始倒计时
        TimeCount.prototype.start = function () {
            var _this = this;
            this.stop();
            this._timer = this._start(function () {
                var _list = _this._list;
                if (_list.length < 1)
                    return;
                _list.forEach(function (item, index) {
                    var lastTime = item.lastTime, divide = item.divide;
                    var now = Date.now();
                    if (lastTime + divide <= now) {
                        item.lastTime = now;
                        _this.count(item, index);
                    }
                });
            });
        };
        // 停止倒计时
        TimeCount.prototype.stop = function () {
            this._list = [];
            this._timer && this._stop(this._timer);
        };
        TimeCount.prototype._start = function (callback) {
            if (requestAnimationFrame) {
                return requestAnimationFrame(callback);
            }
            else {
                return setInterval(callback, 1000 / 60);
            }
        };
        TimeCount.prototype._stop = function (timer) {
            if (requestAnimationFrame)
                cancelAnimationFrame(timer);
            else
                clearInterval(timer);
        };
        // 加入任务，计时器一直跑，任务队列中有任务时就会运行
        TimeCount.prototype.add = function (stateTime, callback, divide) {
            if (divide === void 0) { divide = 1000; }
            if (!stateTime || stateTime <= 0)
                return;
            var lastTime = Date.now();
            var item = { stateTime: stateTime, callback: callback, divide: divide, lastTime: lastTime };
            this._list.push(item);
            this.count(item, this._list.length - 1);
        };
        // 删除单个任务，但 callback 必须抽离，暂无较优方案
        TimeCount.prototype.rmeove = function (callback) {
            this._list = this._list.filter(function (item, index) {
                if (item.callback !== callback)
                    return true;
            });
        };
        // 单个任务的某一帧
        TimeCount.prototype.count = function (item, index) {
            var stateTime = item.stateTime, callback = item.callback, divide = item.divide;
            var newTime = stateTime - divide;
            callback && callback(stateTime, newTime < 0);
            if (newTime < 0) {
                this._list.splice(index, 1);
                return;
            }
            item.stateTime = newTime;
        };
        // 单例
        TimeCount.instance = new TimeCount();
        return TimeCount;
    }());
    exports["default"] = TimeCount;
    // 转字符串，如 x天x小时x分x秒
    var dayFormat = 24 * 60 * 60 * 1000;
    var hourFormat = 60 * 60 * 1000;
    var minuteFormat = 60 * 1000;
    var secondFormat = 1000;
    function format(time, zero) {
        if (zero === void 0) { zero = false; }
        var day = (time / dayFormat) >> 0;
        time -= day * dayFormat;
        var hour = (time / hourFormat) >> 0;
        time -= hour * hourFormat;
        var minute = (time / minuteFormat) >> 0;
        time -= minute * minuteFormat;
        var second = (time / secondFormat) >> 0;
        var result = "";
        // if (zero) day = day.padStart(2, '0');
        if (day > 0)
            result += day + "天";
        if (hour > 0)
            result += hour + "小时";
        if (minute > 0)
            result += minute + "分";
        if (second > 0)
            result += second + "秒";
        return result;
    }
    exports.format = format;
});
