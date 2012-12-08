@echo off
mode con cols=140 lines=30
title %CD%/%1
node "%~dp0\index.js" m="%CD%/%1" all=yes
