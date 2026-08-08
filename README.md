# hacker directory

**🔗 Live site: [talenmud.github.io/hacker-directory](https://talenmud.github.io/hacker-directory)**

A directory of hackers, students, and builders — where every entry is a
pull request. No sign-up form, no database, no admin panel. You fork the
repo, add a folder with your name on it, and your card shows up on the
grid.

Each contributor gets:

- **A card** on the main directory grid — name, role, tags, bio, a link
  to their page.
- **A personal page** (`contributors/your-username/index.html`) that's
  entirely theirs to customise — bio, projects, links, or full-on
  interactive builds like the [live MCMC sampler visualisation](contributors/talen/index.html)
  on Talen's page.

It's less "university project directory" and more "developer social feed
you can hack on."

<br />

<div align="center">
  <a href="CONTRIBUTING.md">
    <strong>➕ Add your card →</strong>
  </a>
</div>

<br />

## How it works

```
contributors/
  talen/
    index.html    ← personal page, fully customisable
    card.json     ← name, bio, github, role, tags, links
  your-username/
    ...
  manifest.json   ← list of contributor usernames
```

The homepage (`index.html`) reads `contributors/manifest.json`, fetches
each listed contributor's `card.json`, and builds the grid dynamically —
no build step, no framework, just static files GitHub Pages can serve
as-is.

Every PR gets automatically checked (valid `card.json`, correct folder
scope, a quick flagged-content/image scan) by a GitHub Action — see
[`.github/workflows/pr-check.yml`](.github/workflows/pr-check.yml).
Merging itself is manual: a maintainer reviews and merges each PR by
hand rather than auto-merging.

## Contributing

Never made a pull request before? That's exactly who
[CONTRIBUTING.md](CONTRIBUTING.md) is written for. Full walkthrough, no
assumed knowledge, screenshots described step by step.

## Local development

```bash
git clone https://github.com/TalenMud/hacker-directory.git
cd hacker-directory
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## License

[MIT](LICENSE)
