cd ../bin
rm -rf davinci.vsix
cd ../extension
vsce package
mv davinci-0.0.1.vsix ../bin/davinci.vsix
