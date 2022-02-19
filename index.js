import fetch from "node-fetch";
import process from "process";

const url =
  "https://file-examples-com.github.io/uploads/2018/04/file_example_MOV_1920_2_2MB.mov";

const data = await fetch(url, {
  headers: { Range: "bytes=0-1023" },
  redirect: "follow"
});
const buffer = Buffer.from(await data.arrayBuffer());
process.stdout.write(buffer);
