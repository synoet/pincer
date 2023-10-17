FROM codercom/code-server:latest
USER root

RUN apt-get update; \
    apt-get install -y git curl wget

COPY docker-entrypoint.sh /

ENTRYPOINT ["bash", "/docker-entrypoint.sh"]

EXPOSE 8080
