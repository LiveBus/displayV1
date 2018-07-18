#!/bin/bash
git add --all;
git diff HEAD | less;
git commit;
git push -u origin gh-pages;
vim -S Session.vim;
