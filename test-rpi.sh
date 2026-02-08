#!/bin/bash

# Clash Master Local RPi Test Script
# This script syncs code to RPi, builds the image locally, and starts it.

# Configuration
RPI_HOST="rpi"
RPI_DEST="~/workshop/clash-master"
IMAGE_NAME="clash-master:local-test"
CONTAINER_NAME="clash-master-test"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==> 1. Syncing files to $RPI_HOST...${NC}"
rsync -avz --exclude 'node_modules' \
           --exclude '.next' \
           --exclude 'dist' \
           --exclude '.git' \
           --exclude 'data' \
           --exclude '.turbo' \
           ./ "$RPI_HOST:$RPI_DEST/"

echo -e "${BLUE}==> 2. Building Docker image on $RPI_HOST (this may take a few minutes)...${NC}"
ssh "$RPI_HOST" "cd $RPI_DEST && docker build -t $IMAGE_NAME ."

echo -e "${BLUE}==> 3. Stopping existing container...${NC}"
ssh "$RPI_HOST" "docker stop $CONTAINER_NAME 2>/dev/null || true && docker rm $CONTAINER_NAME 2>/dev/null || true"

echo -e "${BLUE}==> 4. Starting new container...${NC}"
ssh "$RPI_HOST" "docker run -d \
  --name $CONTAINER_NAME \
  -p 3000:3000 \
  -p 3001:3001 \
  -p 3002:3002 \
  -v ~/clash-master-data:/app/data \
  --restart unless-stopped \
  $IMAGE_NAME"

echo -e "${GREEN}==> SUCCESS! Container is running.${NC}"
echo -e "${GREEN}==> Dashboard: http://$RPI_HOST:3000${NC}"
echo ""
echo -e "${BLUE}Streaming logs (Press Ctrl+C to stop):${NC}"
ssh "$RPI_HOST" "docker logs -f $CONTAINER_NAME"
