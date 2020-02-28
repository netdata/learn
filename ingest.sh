#!/bin/bash

# ingest.sh: Ingests and processes documentation from the netdata/netdata and
# netdata/go.d.plugin repositories.

HOME=$PWD
TMP_DIR="$PWD/ingest/"
GO_DIR="${TMP_DIR}/collectors/go.d.plugin"
DOCS_DIR="$PWD/docs/"

# Check if ingest directory already exists. If it doesn't, clone the core repo.
# Otherwise, just pull the repo instead of cloning it again.
if [ ! -d ${TMP_DIR} ]
then
  git clone https://github.com/netdata/netdata.git ${TMP_DIR}  
else
  cd ${TMP_DIR}
  git pull origin master
  cd $PWD
fi

# Check if the go.d.plugin directory exists. Same logic as above.
if [ ! -d ${GO_DIR} ]
then
  git clone https://github.com/netdata/go.d.plugin.git ${GO_DIR}  
else
  cd ${GO_DIR}
  git pull origin master
  cd $PWD
fi

# Sync .md files from ingest directory to documentation directory.
rsync -a \
  --exclude=".github/" --exclude=".travis/" \
  --exclude="HISTORICAL_CHANGELOG.md" --exclude="DOCUMENTATION.md" \
  --exclude="contrib/sles11/README.md" \
  --include="*/" --include="*.md" \
  --exclude="*" \
  --prune-empty-dirs \
  --delete --delete-excluded \
  ${TMP_DIR} ${DOCS_DIR}

echo "Done ingesting."