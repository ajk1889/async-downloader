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

const fetchChunk = async (start, end) =>
  fetch(options.url, {
    headers: { ...options.headers, Range: `bytes=${start}-${end - 1}` },
    redirect: "follow"
  });

const ongoingRequests = [];
const data = await fetch(options.url, {
  headers: options.headers,
  redirect: "follow"
});
const totalSize = parseInt(data.headers.get("content-length"));

const boundaries = getChunkBoundaries(totalSize, options.buffer_size);
let boundary = boundaries.next();
while (!boundary.done) {
  if (ongoingRequests.length == options.connections) {
    const response = await ongoingRequests.shift();
    response.body.pipe(process.stdout);
  }
  const [start, end] = boundary.value;
  ongoingRequests.push(fetchChunk(start, end));
  boundary = boundaries.next();
}
for (const task of ongoingRequests) {
  const response = await task;
  response.body.pipe(process.stdout);
}
