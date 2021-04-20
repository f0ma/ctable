#!/bin/sh

#npm install yuidoc -g

yuidoc -o docs --themedir doc-theme ctable

dot -Tsvg doc-php/method_call.dot > doc-php/method_call.svg
