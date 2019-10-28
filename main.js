const { addPath, error, getInput, setFailed } = require("@actions/core");
const { downloadTool: dltmp, extractZip } = require("@actions/tool-cache");
const latestRelease = require("github-latest-release");
const { coerce: coerceSemVer } = require("semver");
const { arch, platform } = require("os");
const { join } = require("path");
const { exec: _exec } = require("child_process");

const BASE_URL = "https://github.com/WebAssembly/wabt/releases/download/";
const PLATFORM = platform();
const ARCH = arch();

let BIN_DIR;

if (PLATFORM.startsWith("win")) {
  BIN_DIR = join(process.env.USERPROFILE || "C:", ".wabt", "bin");
} else {
  BIN_DIR = "/usr/local/bin";
}

async function exec(cmd) {
  return new Promise((res, rej) => _exec(cmd, err => (err ? rej(err) : res())));
}

function deriveURL(version) {
  if (PLATFORM.startsWith("win")) {
    const os = `win${ARCH.replace(/^x/, "")}`;
    return `${BASE_URL}${version}/wabt-${version}-${os}.zip`;
  } else if (PLATFORM === "darwin") {
    return `${BASE_URL}${version}/wabt-${version}-osx.tar.gz`;
  } else {
    return `${BASE_URL}${version}/wabt-${version}-linux.tar.gz`;
  }
}

async function extract(archive, dir) {
  if (PLATFORM.startsWith("win")) {
    await extractZip(archive, dir);
  } else {
    await exec(
      `tar --extract --gunzip --verbose --strip-components=1 --file="${archive}" --directory="${dir}"`
    );
  }
}

async function main() {
  try {
    let version = coerceSemVer(getInput("version"));

    if (!version) {
      const release = await latestRelease("WebAssembly", "wabt");

      version = release.tag_name.replace(/^v/, "");
    }

    const archive = await dltmp(deriveURL(version));

    await extract(archive, BIN_DIR);

    addPath(BIN_DIR);
  } catch (err) {
    error(err.stack);
    setFailed(err.message);
  }
}

main();
