# Transcript

This is an EXPERIMENTAL for transcript.

## Prerequisite

- SoX (Sound eXchange)

## Usage

- `npm run stream`

### Stream

```shell
$ GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials npm run stream:en-to-ja -- --output=/path/to/output-file --sample-rate=44100
```

Set `DEEPL_AUTH_KEY` if you want to use DeepL to translate scripts.

```
$ GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials DEEPL_AUTH_KEY=[DEEPL-AUTH-KEY] npm run stream:en-to-ja
```

## License

MIT

## Maintainer

Shintaro Kaneko <kaneshin0120@gmail.com>
