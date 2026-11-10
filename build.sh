#!/usr/bin/env bash
# Assemble the deployable site into _site/.
# usage: ./build.sh            build
#        ./build.sh --serve    build, then serve _site/ on http://localhost:8000
set -euo pipefail
cd "$(dirname "$0")"

python3 atlas/tools/build.py
node langs/build.mjs
node langs/build.mjs --root topics
python3 videos/tools/build.py

rm -rf _site
mkdir -p _site/mcq _site/atlas _site/videos
cp index.html _site/
cp -r shared guide ladder counter applications _site/
mkdir -p _site/plan
cp plan/index.html plan/app.js plan/style.css _site/plan/
# plan/data.js names private projects, so it is gitignored; a local build serves it, the site reads it from the private repo.
if [[ -f plan/data.js ]]; then node plan/tools/check.mjs; cp plan/data.js _site/plan/; fi
mkdir -p _site/projects
cp private-shell/projects.html _site/projects/index.html
cp -r mcq/index.html mcq/css mcq/js mcq/data _site/mcq/
cp -r atlas/site/. _site/atlas/
cp videos/index.html videos/app.js videos/style.css videos/data.js _site/videos/
cp -r langs/dist _site/langs
cp -r topics/dist _site/topics
rm -f _site/counter/README.md
touch _site/.nojekyll

# Private guides are gitignored here and live in a private repo. A local build serves them directly.
if [[ -f projects/site.mjs ]]; then
  node langs/build.mjs --root projects
  rm -rf _site/projects
  cp -r projects/dist _site/projects
  python3 projects/wire.py _site
fi

echo "built _site/ ($(du -sh _site | cut -f1))"
if [[ "${1:-}" == "--serve" ]]; then
  python3 -m http.server -d _site 8000
fi
