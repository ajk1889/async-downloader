import fetch from "node-fetch";

const sleep = seconds =>
  new Promise(resolve => setTimeout(resolve, seconds * 1000));

const logError = (error, msg) => {
  console.error();
  console.error(error);
  console.error(msg);
};

function requestHandler(options) {
  return {
    retryCount: 0,
    async totalSize() {
      const data = await fetch(options.url, {
        headers: { ...options.headers, Range: `bytes=0-` },
        redirect: "follow"
      });
      return parseInt(data.headers.get("content-range").split("/")[1]);
    },
    async fetchChunk(start, end) {
      try {
        const data = await fetch(options.url, {
          headers: { ...options.headers, Range: `bytes=${start}-${end - 1}` },
          redirect: "follow"
        });
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (error) {
        if (this.retryCount < 5) {
          const delay = 2 ** this.retryCount;
          logError(error, `Retrying in ${delay} seconds...`);
          await sleep(delay);
          this.retryCount++;
          return this.fetchChunk(start, end);
        } else {
          logError(error, "Too many retries, aborting...");
          throw error;
        }
      }
    }
  };
}

export default requestHandler;
