FROM nginx:alpine

RUN apk update  &&  apk upgrade  &&  apk add vim

COPY default.conf /etc/nginx/conf.d/default.conf

COPY build/ /usr/share/nginx/html/