const core = require("@actions/core");

async function main() {
  try {
    // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput("who-to-greet");
    console.log("hello");
    // core.setOutput("time", time);
  } catch (err) {
    core.setFailed(err.stack);
  }
}

main();
