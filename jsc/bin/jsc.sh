#!/bin/bash

CUR_DIR=$(cd $(dirname $0); pwd) 
CUR_PATH=$(pwd) 

node "$CUR_DIR/../index.js" m="$CUR_PATH/"

