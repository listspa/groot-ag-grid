FROM nginx
COPY ./index-docs.html /usr/share/nginx/html/index.html
COPY ./dist/demo-app /usr/share/nginx/html/demo-app
EXPOSE 80
