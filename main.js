const core = require("@actions/core");
const { downloadTool, extractTar, extractZip } = require("@actions/tool-cache");
const latestRelease = require("github-latest-release");
const { coerce: coerceSemVer, valid: isValidSemVer } = require("semver");
const { arch, platform } = require("os");
const { join } = require("path");

const BASE_URL = "https://github.com/WebAssembly/wabt/releases/download/";
const PLATFORM = platform();
const ARCH = arch();

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

function deriveBinDir() {
  if (PLATFORM.startsWith("win")) {
    return join(process.env.USERPROFILE || "C:\\", ".wabt", "bin");
  } else {
    return "/usr/local/bin";
  }
}

function extract(archive, dir) {
  if (PLATFORM.startsWith("win")) {
    return extractZip(archive, dir);
  } else {
    return extractTar(archive, dir);
  }
}

async function main() {
  core.debug(`setup-wabt starting...`);

  try {
    let version = coerceSemVer(core.getInput("version"));

    if (!version) {
      core.debug("deriving the latest wabt version...");

      const release = await latestRelease("WebAssembly", "wabt");

      version = release.tag_name.replace(/^v/, "");
    }

    if (!isValidSemVer(version)) {
      return core.setFailed(`${version} is not a valid semver`);
    }

    const url = deriveURL(version);
    const bdir = deriveBinDir();

    core.debug(`installing wabt from ${url} to ${bdir}...`);

    const file = await downloadTool(url);

    const xdir = await extract(file, bdir);
    core.debug('xdir:', xdir)

    core.debug("manipulating the PATH...");
    core.addPath(xdir);

    core.debug(`wabt-${version} installation successful`);
  } catch (err) {
    core.error(err.stack);
    core.setFailed(err.message);
  }
}

main();
