const { addPath, getInput, setFailed } = require("@actions/core")
const tc = require("@actions/tool-cache")
const latestRelease = require("github-latest-release")
const { coerce: coerceSemVer } = require("semver")
const { arch, platform } = require("os")
const path = require("path")
const { exec: _exec } = require("child_process")
const fs = require('fs')

const BASE_URL = "https://github.com/WebAssembly/wabt/releases/download/"
const PLATFORM = platform()
const ARCH = arch()
const IS_WINDOWS = PLATFORM.startsWith("win")

function dlurl(version) {
  if (IS_WINDOWS) {
    return `${BASE_URL}${version}/wabt-${version}-windows.tar.gz`
  } else if (PLATFORM === "darwin") {
    return `${BASE_URL}${version}/wabt-${version}-macos.tar.gz`
  } else {
    return `${BASE_URL}${version}/wabt-${version}-ubuntu.tar.gz`
  }
}

async function main() {
  try {
    let version = coerceSemVer(getInput("version"))

    if (!version) {
      const release = await latestRelease("WebAssembly", "wabt")
      version = release.tag_name.replace(/^v/, "")
    }

    const homeDir = process.env.HOME || process.env.USERPROFILE

    let url = dlurl(version)

    console.log("downloading from: "+url)

    const downloadPath = await tc.downloadTool(url);

    console.log("extracting to: "+homeDir)

    await tc.extractTar(downloadPath, homeDir);

    let binDir = path.join(homeDir,`wabt-${version}`,"bin")

    console.log("adding to path: "+binDir)

    addPath(binDir)
  } catch (err) {
    setFailed((err && err.message) || "setup_wabt failed")
  }
}

main()
