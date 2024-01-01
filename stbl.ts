const fs = require("node:fs");
const { parse, stringify } = require("svgson");
const parseSVG = require("svg-path-parser");

if (process.argv.length !== 3) {
  console.error("Expected one argument!");
  process.exit(1);
}

let path: string = "";
let parsedPath: any = null;

let outputList: string = "";

let currentReference: { x: number; y: number } = { x: 0, y: 0 };

fs.readFile(process.argv[2], "utf8", (err: Error, data: string) => {
  if (err) {
    console.error(err.message);
    return;
  }

  parse(data).then((json: any) => {
    json.children.forEach((element: any) => {
      if (element.name === "g") {
        path = element.children[0].attributes.d;

        parsedPath = parseSVG(path);

        parsedPath.forEach((cmd: any) => {
          switch (cmd.code) {
            case "M":
              currentReference = { x: cmd.x, y: cmd.y };
              outputList =
                outputList +
                `[${round(currentReference.x)}, ${round(
                  currentReference.y
                )}],\n`;
              break;
            case "c":
              outputList =
                outputList +
                `[${round(currentReference.x + cmd.x1)}, ${round(
                  currentReference.y + cmd.y1
                )}, ${round(currentReference.x + cmd.x2)}, ${round(
                  currentReference.y + cmd.y2
                )}, ${round(currentReference.x + cmd.x)}, ${round(
                  currentReference.y + cmd.y
                )}],\n`;
              currentReference = {
                x: currentReference.x + cmd.x,
                y: currentReference.y + cmd.y,
              };
              break;
            case "C":
              outputList =
                outputList +
                `[${round(cmd.x1)}, ${round(cmd.y1)}, ${round(cmd.x2)}, ${round(
                  cmd.y2
                )}, ${round(cmd.x)}, ${round(cmd.y)}],\n`;
              currentReference = {
                x: cmd.x,
                y: cmd.y,
              };
              break;
            case "l":
              outputList =
                outputList +
                `[${round(currentReference.x)}, ${round(
                  currentReference.y
                )}, ${round(currentReference.x + cmd.x)}, ${round(
                  currentReference.y + cmd.y
                )}, ${round(currentReference.x + cmd.x)}, ${round(
                  currentReference.y + cmd.y
                )}],\n`;
              currentReference = {
                x: currentReference.x + cmd.x,
                y: currentReference.y + cmd.y,
              };
              break;
          }
        });
        console.log(outputList);
      }
    });
  });
});

function round(input: number): number {
  return Math.round(input * 10);
}
