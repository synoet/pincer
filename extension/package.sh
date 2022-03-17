cd ../bin
rm -rf davinci.vsix
cd ../extension
vsce package
mv pincer.0.1.vsix ../bin/pincer.vsix
