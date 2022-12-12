FROM grafana/k6 as builder

FROM golang:1.19-alpine
RUN apk add --no-cache ca-certificates && \
    adduser -D -u 12345 -g 12345 k6
COPY --from=builder /usr/bin/k6 /go/bin/k6

RUN go install go.k6.io/xk6/cmd/xk6@latest

ADD . /home/k6

USER root
WORKDIR /home/k6

RUN xk6 build latest \
		   	  --with xk6-demo="/home/k6/plugins/demo" \
			  --with github.com/grafana/xk6-sql@v0.0.1

