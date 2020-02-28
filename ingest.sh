#!/bin/bash

# ingest.sh: Ingests and processes documentation from the netdata/netdata and
# netdata/go.d.plugin repositories.

HOME=$PWD
TMP_DIR="$PWD/ingest/"
GO_DIR="${TMP_DIR}collectors/go.d.plugin"
DOCS_DIR="$PWD/docs/"

# Check if ingest directory already exists. If it doesn't, clone the core repo.
# Otherwise, just pull the repo instead of cloning it again.
echo "Ingest and/or sync with Netdata repositories."
if [ ! -d ${TMP_DIR} ]
then
  git clone -b frontmatter https://github.com/joelhans/netdata.git ${TMP_DIR}  
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
echo "Sync .md files from ingest directory to documentation directory."
rsync -a \
  --exclude=".github/" --exclude=".travis/" \
  --exclude="HISTORICAL_CHANGELOG.md" --exclude="DOCUMENTATION.md" \
  --exclude="contrib/sles11/README.md" \
  --include="*/" --include="*.md" \
  --exclude="*" \
  --prune-empty-dirs \
  --delete --delete-excluded \
  ${TMP_DIR} ${DOCS_DIR}

# Strip comments around frontmatter.
# TODO: Figure out how to remove the extra newline at the end of files after
# removing the analytics tag.
echo "Strip comments around frontmatter and GA tags."
find ${DOCS_DIR} -name '*.md' -exec sed -i -e '/<!--/d;/-->/d;/\[!\[analytics.*/d' {} \;

echo "Done ingesting."