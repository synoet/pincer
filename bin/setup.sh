#!/usr/bin/env bash

MAG='\033[0;35m'
RESET='\033[0m'

echo -e "${MAG} Installing Davinci Extension ... ${RESET}"
cd extension
code-insiders --install-extension davinci-0.0.1.vsix &> /dev/null

for ((k = 0; k <= 20 ; k++))
do
    echo -n "[ "
    for ((i = 0 ; i <= k; i++)); do echo -n "###"; done
    for ((j = i ; j <= 20 ; j++)); do echo -n "   "; done
    v=$((k * 5))
    echo -n " ] "
    echo -n "$v %" $'\r'
    sleep 0.05
done
echo

code-insiders --enable-proposed-api nysteo.davinci


