import { writeFileSync } from "node:fs";
import wkhtmltopdf from "./src/wkhtmltopdf";

const res = await wkhtmltopdf({
  input: "https://www.google.com",
});

writeFileSync("test.pdf", res);
