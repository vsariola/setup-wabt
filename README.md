# setup-wabt

![ci](https://github.com/chiefbiiko/setup-wabt/workflows/ci/badge.svg)

A Github action that sets up the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt).

## Usage

Simply use setup-wabt as a step in your workflow.

``` yaml
steps:
  - name: install wabt
    uses: chiefbiiko/setup-wabt@1.0.0
    with:
      version: 1.0.12 # optional - defaults to latest wabt version
    run: wat2wasm --help
```

## License

[MIT](./LICENSE)