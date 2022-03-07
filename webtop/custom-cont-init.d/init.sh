#!/bin/bash

pushd /var/lib/Pincer/bin
chmod +x ./setupraw.sh
su abc -c './setupraw.sh'
popd

mkdir /home/anubis/.config/autostart

mv /home/anubis/custom-cont-init.d/code.desktop /home/anubis/.config/autostart/
