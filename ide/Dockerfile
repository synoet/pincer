FROM codercom/code-server:latest
USER root

RUN apt-get update; \
    apt-get install -y git curl wget

COPY ./pincer-extension-0.0.1.vsix /tmp/pincer.vsix
COPY docker-entrypoint.sh /


ENTRYPOINT ["bash", "/docker-entrypoint.sh"]

EXPOSE 8080
