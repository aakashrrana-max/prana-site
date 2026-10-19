# Tests

Node + puppeteer-core with the system Chrome. From a folder with `npm i puppeteer-core@23`:

```bash
node test.js
```

Serve the repo root first on 127.0.0.1:8937. test.js mocks the GHL webhook and blocks all third-party hosts, so nothing is sent anywhere.
`node shots.js <outdir> "<query>" <label> 375,768,1280` saves fold + full-page screenshots.
