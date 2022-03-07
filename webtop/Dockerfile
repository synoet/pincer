# https://docs.linuxserver.io/images/docker-webtop

ARG WEBTOP_TAG=ubuntu-xfce
FROM lscr.io/linuxserver/webtop:$WEBTOP_TAG

ENV TZ=America/New_York \
    PUID=1001 \
    GUID=1001 \
    KEYBOARD=en-us-qwerty \
    CUSTOM_PORT=5000


COPY custom-cont-init.d /etc/custom-cont-init.d

RUN set -ex; \
  apt update; \
  apt install git wget build-essential -y --no-install-recommends; \
  rm -rf /var/cache/apt/*; \
  rm -rf /var/lib/apt/lists/*; \
  mkdir -p /home/anubis; \
  chown -R 1001:1001 /home/anubis; \
  usermod -d /home/anubis abc; \
  cd /home/anubis; \
  sed -i 's/\/config/\/home\/anubis/g' $(find /defaults /etc/cont-init.d /etc/services.d  /etc/custom-cont-init.d -type f); \
  apt install; \
  apt-get update; \
  wget -O code-insiders.deb https://az764295.vo.msecnd.net/insider/b7730c807c1e0fdacdcc91a854bb963715b2a89b/code-insiders_1.65.0-1646060513_amd64.deb; \
  echo 'Y' | apt install ./code-insiders.deb; \
  git clone https://github.com/synoet/Pincer; \
  mv ./Pincer /var/lib/Pincer



