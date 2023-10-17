curl https://pincer-server.fly.dev/version/latest/download -o /tmp/pincer.vsix 
code-server --install-extension /tmp/pincer.vsix 
exec code-server --enable-proposed-api synoet.pincer-extension --host 0.0.0.0 --auth "none" --cert false
