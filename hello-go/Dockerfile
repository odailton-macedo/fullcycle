FROM golang AS build

WORKDIR /usr/src/app

COPY hello.go .

RUN go build hello.go

RUN ls -l . && sleep 3  


FROM hello-world

WORKDIR /usr/src/app

COPY --from=build hello* .

ENTRYPOINT [ "./hello" ]
