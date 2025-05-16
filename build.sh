#!/bin/bash
# This is a simple build script for static site deployment
echo "Starting build process..."
# Copy all files to the output directory
cp -r * $CLOUDFLARE_PAGES_OUTPUT_DIR/
echo "Build completed successfully!" 