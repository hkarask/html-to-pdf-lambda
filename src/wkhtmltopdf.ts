import { Stream } from "node:stream";
import { existsSync } from "fs";
import { spawn } from "child_process";
import { WkOptions } from "./types";

const wkhtmltopdf = (props: WkOptions) =>
  new Promise<Buffer>((resolve, reject) => {
    let wkhtmltopdfPath = "/opt/bin/wkhtmltopdf";

    if (process.platform === 'darwin') {
      wkhtmltopdfPath = '/usr/local/bin/wkhtmltopdf';
    }

    if (!existsSync(wkhtmltopdfPath)) {
      throw new Error(`Couldn't find ${wkhtmltopdfPath}`);
    }

    const stderrMessages: string[] = [];
    const buffer: Uint8Array[] = [];

    const params = [
      `--orientation ${props.orientation ?? 'Portrait'}`,
      `--margin-top ${props.marginTop ?? 0}`,
      `--margin-right ${props.marginRight ?? 0}`,
      `--margin-bottom ${props.marginBottom ?? 0}`,
      `--margin-left ${props.marginLeft ?? 0}`,
      "--disable-smart-shrinking",
      "--disable-javascript",
      "--custom-header-propagation",
      "--log-level warn",
      "--image-dpi 200",
      "--image-quality 75",
      '--footer-right "Page [page] of [topage]"',
      "--footer-font-size 8",
    ];

    console.log(
      "Generating pdf from " +
        (props.input instanceof Stream ? "a stream" : `an URI: '${props.input}'`)
    );
    console.debug("Wkhtmltopdf options", params);

    const args = [
      wkhtmltopdfPath,
      ...params,
      props.input instanceof Stream ? "-" : props.input,
      "-", // output, '-' for stream
    ].join(" ");

    console.debug("Executing", args);

    const proc = spawn("/bin/bash", ["-c", `set -o pipefail ; ${args} | cat`]);

    proc
      .on("error", (error) => {
        reject(error);
      })
      .on("exit", (code) => {
        if (code) {
          reject(
            new Error(
              `wkhtmltopdf exited with code ${code}, ${stderrMessages.join()}`
            )
          );
        } else {
          resolve(Buffer.concat(buffer));
        }
      });

    proc.stdout
      .on("data", (data) => {
        buffer.push(data);
      })
      .on("error", (error) => {
        reject(error);
      });

    proc.stderr?.on("data", (data) => {
      stderrMessages.push((data || "").toString());
      console.error(data.toString());
    });

    if (props.input instanceof Stream) {
      props.input.pipe(proc.stdin);
    }
  });

export default wkhtmltopdf;
