const progressHandler = totalSize => ({
  timeout: null,
  current: 0,
  previous: 0,
  lastUpdated: Date.now(),

  print() {
    const { current, previous, lastUpdated } = this;
    const now = Date.now();
    const speed = (current - previous) / 1.024 / (now - lastUpdated);
    this.previous = current;
    this.lastUpdated = now;
    const percent = ((current / totalSize) * 100).toFixed(3);
    process.stderr.clearLine();
    process.stderr.cursorTo(0);
    process.stderr.write(`${percent}% at ${speed.toFixed(3)}KB/s`);
  },

  update(chunkSize) {
    this.current += chunkSize;
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.print(), 300);
  }
});

export default progressHandler;
