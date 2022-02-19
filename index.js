import process from "process";
import requestHandler from "./RequestHandler.mjs";
import getCommandLineOptions from "./cliParser.mjs";
import progressHandler from "./progressHandler.mjs";

function* chunkBoundaries(totalSize, chunkSize) {
  let offset = 0;
  while (offset < totalSize) {
    const chunk_end = Math.min(offset + chunkSize, totalSize);
    yield [offset, chunk_end];
    offset = chunk_end;
  }
}

const options = getCommandLineOptions();
const download = requestHandler(options);

const totalSize = await download.totalSize();
const progress = progressHandler(totalSize);

const ongoingRequests = [];
const boundaries = chunkBoundaries(totalSize, options.buffer_size);
let boundary = boundaries.next();
while (!boundary.done) {
  if (ongoingRequests.length == options.connections) {
    const buffer = await ongoingRequests.shift();
    process.stdout.write(buffer);
    progress.update(buffer.length);
  }
  const [start, end] = boundary.value;
  ongoingRequests.push(download.fetchChunk(start, end));
  boundary = boundaries.next();
}
for (const task of ongoingRequests) {
  const buffer = await task;
  process.stdout.write(buffer);
  progress.update(buffer.length);
}

if (progress.timeout) clearTimeout(progress.timeout);
progress.print();
console.error();
