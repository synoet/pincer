#!/bin/bash

pushd /var/lib/Pincer/bin
chmod +x ./setupraw.sh
su abc -c './setupraw.sh'
popd

mv /var/lib/content.zip /home/anubis/content.zip
pushd /home/anubis
mkdir study_content
mv content.zip ./study_content/
popd

pushd /home/anubis/study_content
unzip content.zip
rm -rf content.zip
popd

chown -c -R abc:abc /home/anubis/study_content

mkdir /home/anubis/.config/autostart

mv /home/anubis/custom-cont-init.d/code.desktop /home/anubis/.config/autostart/

