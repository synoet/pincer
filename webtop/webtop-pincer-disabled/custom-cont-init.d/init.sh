#!/bin/bash

if [[ ! -f /home/anubis/.davinci.conf ]]
then

  # install extension from .vsix file
  pushd /var/lib/Pincer/bin
  chmod +x ./setuprawdisabled.sh
  su abc -c './setuprawdisabled.sh'
  popd
fi

if [[ ! -d /home/anubis/study_content ]]
then

  # copy over contents of the study
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
fi

if [[ ! -d /home/anubis/.config/autostart ]]
then

  # create start up scripts for xfce
  mkdir /home/anubis/.config/autostart
  mv /home/anubis/custom-cont-init.d/code.desktop /home/anubis/.config/autostart/
fi

