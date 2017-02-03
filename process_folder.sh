#!/bin/bash

INPUT_FOLDER=$1
OUTPUT_FOLDER=$2

INPUT_FILES=($(find $INPUT_FOLDER -type f))

for INPUT_NAME in ${INPUT_FILES[@]}
do
	OUTPUT_NAME=$2/$(basename $INPUT_NAME)
	cat "$INPUT_NAME" | node ./dist/index.js > "${OUTPUT_NAME}.csv"
done
