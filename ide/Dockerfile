FROM codercom/code-server

USER root

RUN apt-get update; \
    apt-get install -y git curl wget


ENTRYPOINT ["bash", "/docker-entrypoint.sh"]

EXPOSE 8080

run wget -0 /tmp/pincer.vsix https://www.github.com/synoet/pincer/extension/pincer-extension-0.0.1.vsix
COPY docker-entrypoint.sh /


