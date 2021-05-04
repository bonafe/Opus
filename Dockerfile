FROM python:3

WORKDIR /usr/src/app/

COPY ./src/web .

CMD ["python","-m","http.server"]
