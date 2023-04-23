code-server --install-extension /tmp/pincer.vsix 
exec code-server --enable-proposed-api synoet.pincer --host 0.0.0.0 --auth "none" --cert false
