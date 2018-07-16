#!/bin/bash
git add --all;
git diff HEAD | less;
git commit;
git push -u origin master;
vim -S Session.vim;
