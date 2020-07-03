# 倒计时公共类

## 安装

```
npm i -S after-async-data
```

## 如何使用

```js
import TimeCount, { format } from "./utils/timecount";

new Vue({
  data: () => ({ timeStr: "" }),
  mounted() {
    TimeCount.getInstance().start();
  },
  destroyed() {
    TimeCount.getInstance().stop();
  },
  methods: {
    start() {
      TimeCount.getInstance().rmeove(this.timecount);
      TimeCount.getInstance().add(60 * 1000, this.timecount, 1000);
    },
    timecount(time, isFinish) {
      this.timeStr = !isFinish ? format(time) : "";
    },
  },
});
```
