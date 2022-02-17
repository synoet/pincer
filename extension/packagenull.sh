cd ../bin
rm -rf davinci_null.vsix
cd ../extension
vsce package
mv davinci-0.0.1.vsix ../bin/davinci_null.vsix
