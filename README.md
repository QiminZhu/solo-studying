# Solo Studying

Guest quiz practice for ITCS217. Attempts and custom quizzes are saved in this browser and do not synchronize across devices.

## Development

Use Node.js 22.13 or newer. Run `npm ci`, then `npm run build:static`. Set `SOLO_BASE_PATH=/solo-studying` for the GitHub Pages path. Serve `out/` with a static web server.

The manual GitHub Pages workflow runs lint, TypeScript checks, quiz tests, and the static export before deployment. See [launch notes](docs/static-launch.md).

The original Cloudflare application is preserved in the source; account-backed routes are excluded from the static deployment.

## License

Project code is available under the [MIT License](LICENSE). Third-party dependencies, fonts and externally sourced educational material retain their respective licenses and rights.
