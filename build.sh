#!/usr/bin/env bash
# Assemble the deployable site into _site/.
# usage: ./build.sh            build
#        ./build.sh --serve    build, then serve _site/ on http://localhost:8000
set -euo pipefail
cd "$(dirname "$0")"

python3 atlas/tools/build.py

rm -rf _site
mkdir -p _site/mcq _site/atlas
cp index.html _site/
cp -r shared guide ladder counter _site/
cp -r mcq/index.html mcq/css mcq/js mcq/data _site/mcq/
cp -r atlas/site/. _site/atlas/
rm -f _site/counter/README.md
touch _site/.nojekyll

echo "built _site/ ($(du -sh _site | cut -f1))"
if [[ "${1:-}" == "--serve" ]]; then
  python3 -m http.server -d _site 8000
fi
