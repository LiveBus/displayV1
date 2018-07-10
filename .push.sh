#!/bin/bash
git add --all;
git diff HEAD;
git commit;
git push -u origin master;
vim -S Session.vim;
