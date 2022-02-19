import fetch from "node-fetch";
import process from "process";

const options = {
  url: "https://file-examples-com.github.io/uploads/2018/04/file_example_MOV_1920_2_2MB.mov",
  headers: {},
  connections: 10,
  buffer_size: 1024 * 100
};

function* getChunkBoundaries(totalSize, chunkSize) {
  let offset = 0;
  while (offset < totalSize) {
    const chunk_end = Math.min(offset + chunkSize, totalSize);
    yield [offset, chunk_end];
    offset = chunk_end;
  }
}

const fetchChunk = async (start, end) => {
  const data = await fetch(options.url, {
    headers: { ...options.headers, Range: `bytes=${start}-${end - 1}` },
    redirect: "follow"
  });
  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const ongoingRequests = [];
const data = await fetch(options.url, {
  headers: { ...options.headers, Range: `bytes=0-` },
  redirect: "follow"
});
const totalSize = parseInt(data.headers.get("content-range").split("/")[1]);

const boundaries = getChunkBoundaries(totalSize, options.buffer_size);
let boundary = boundaries.next();
while (!boundary.done) {
  if (ongoingRequests.length == options.connections) {
    const buffer = await ongoingRequests.shift();
    process.stdout.write(buffer);
  }
  const [start, end] = boundary.value;
  ongoingRequests.push(fetchChunk(start, end));
  boundary = boundaries.next();
}
for (const task of ongoingRequests) {
  const buffer = await task;
  process.stdout.write(buffer);
}
