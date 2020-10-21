FROM nginx
COPY ./dist/demo-app /usr/share/nginx/html/demo-app
EXPOSE 80
