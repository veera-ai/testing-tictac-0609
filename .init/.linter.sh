#!/bin/bash
cd /home/kavia/workspace/code-generation/testing-tictac-0609/TictactoeMonolithicWebApplication
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

