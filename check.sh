cp#!/usr/bin/env bash
fail=0
chk() {
  if grep -niE "$2" in.html in.css in.js; then
    echo "GAGAL: $1"
    fail=1
  fi
}

chk 'href kosong'   'href="#"'
chk 'placeholder'   'lorem|demo|\[ISI'
chk 'innerHTML'     'innerHTML'
chk 'em dash'       '—'
chk '100vh'         '100vh'
[ $fail -eq 0 ] && echo "BERSIH"
exit $fail
