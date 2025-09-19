# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Netdata Learn is a Docusaurus-based documentation site for Netdata's monitoring and troubleshooting platform. The documentation is ingested from multiple Netdata repositories and processed for display.

## Common Development Commands

### Local Development
```bash
# Install dependencies
yarn install

# Start development server (port 3000)
yarn start

# Build for production
yarn build

# Serve production build locally
yarn serve
```

### Documentation Ingestion

The `/docs` folder contains mirrored documentation from Netdata repositories. These files should NOT be edited directly.

To ingest documentation manually:
```bash
# Setup Python environment
python -m venv myenv
source myenv/bin/activate
pip install -r .learn_environment/ingest-requirements.txt

# Run ingest from specific repos/branches
python ingest/ingest.py --repos <owner>/<repo>:<branch>

# Generate dynamic integration pages after ingest
python ingest/create_grid_integration_pages.py
```

## Architecture

### Core Structure
- **Docusaurus Framework**: Built on Docusaurus v3 with React 18
- **Documentation Mirror**: `/docs` folder contains auto-ingested content from external repos (netdata/netdata, netdata/.github, etc.)
- **Custom Components**: Swizzled components in `/src/theme` override Docusaurus defaults
- **Styling**: Tailwind CSS utility classes with global styles in `/src/css/custom.css`

### Key Directories
- `/src/components`: React components for UI elements
- `/src/pages`: Custom pages outside the docs structure
- `/src/data`: Data files including News.js for homepage updates
- `/static`: Static assets (images, files)
- `/ingest`: Python scripts for documentation ingestion and processing

### Ingestion Process
The ingest system:
1. Clones documentation from configured repositories
2. Processes markdown files (sanitizes frontmatter, normalizes links)
3. Maps files using netdata/netdata's `map.csv` configuration
4. Generates redirects and integration pages
5. Places processed files in `/docs` directory

### Deployment
- Automatic deployment to Netlify on master branch commits
- Daily GitHub Action runs ingest at 14:00 UTC
- Redirects handled via `netlify.toml` and `static.toml`

## Important Considerations

- Never edit files in `/docs` directly - changes will be overwritten
- Documentation contributions should be made to source repositories
- Swizzled components require manual updates when upgrading Docusaurus
- Python 3.9+ required for manual ingestion