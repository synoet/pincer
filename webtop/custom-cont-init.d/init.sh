#!/bin/bash

pushd /var/lib/pincer/bin
chmod +x ./setupraw.sh
su abc -c './setupraw.sh'
popd

mkdir /home/anubis/.config/autostart

mv /etc/custom-cont-init.d/code.desktop /home/anubis/.config/autostart/
