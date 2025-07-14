#!/bin/bash
cd /tmp/kavia/workspace/code-generation/browser-tic-tac-toe-1db2362b/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

