const { addPath, getInput, setFailed } = require("@actions/core")
const { downloadTool: dltmp, extractZip } = require("@actions/tool-cache")
const latestRelease = require("github-latest-release")
const { coerce: coerceSemVer } = require("semver")
const { arch, platform } = require("os")
const { join } = require("path")
const { exec: _exec } = require("child_process")

const BASE_URL = "https://github.com/WebAssembly/wabt/releases/download/"
const PLATFORM = platform()
const ARCH = arch()
const IS_WINDOWS = PLATFORM.startsWith("win")

function wabtdir(version) {
  return join(process.env.HOME || process.env.USERPROFILE, `.wabt_${version}`)
}

function exec(cmd) {
  return new Promise((resolve, reject) =>
    _exec(cmd, (err, stdout, stderr) => {
      if (stdout) console.log(stdout)
      if (stderr) console.error(stderr)
      err ? reject(err) : resolve()
    })
  )
}

function rm(file) {
  return exec(IS_WINDOWS ? `del /f "${file}"` : `rm -f "${file}"`)
}

function dlurl(version) {
  if (IS_WINDOWS) {
    const os = `win${ARCH.replace(/^x/, "")}`
    return `${BASE_URL}${version}/wabt-${version}-${os}.zip`
  } else if (PLATFORM === "darwin") {
    return `${BASE_URL}${version}/wabt-${version}-osx.tar.gz`
  } else {
    return `${BASE_URL}${version}/wabt-${version}-linux.tar.gz`
  }
}

async function extract(archive, dir) {
  if (IS_WINDOWS) {
    await extractZip(archive, dir)
  } else {
    await exec(`mkdir -p "${dir}"`)
    await exec(
      `tar --extract --gunzip --verbose --strip-components=1 --file="${archive}" --directory="${dir}"`
    )
  }
}

async function main() {
  let archive

  try {
    let version = coerceSemVer(getInput("version"))

    if (!version) {
      const release = await latestRelease("WebAssembly", "wabt")
      version = release.tag_name.replace(/^v/, "")
    }

    const dir = wabtdir(version)

    archive = await dltmp(dlurl(version))

    await extract(archive, dir)

    addPath(dir)
  } catch (err) {
    setFailed((err && err.message) || "setup_wabt failed")
  } finally {
    await rm(archive)
  }
}

main()
