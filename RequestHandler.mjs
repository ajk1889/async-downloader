import fetch from "node-fetch";

const requestHandler = options => ({
  totalSize: async () => {
    const data = await fetch(options.url, {
      headers: { ...options.headers, Range: `bytes=0-` },
      redirect: "follow"
    });
    return parseInt(data.headers.get("content-range").split("/")[1]);
  },
  fetchChunk: async (start, end) => {
    const data = await fetch(options.url, {
      headers: { ...options.headers, Range: `bytes=${start}-${end - 1}` },
      redirect: "follow"
    });
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
});

export default requestHandler;
