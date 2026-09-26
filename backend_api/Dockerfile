FROM golang:1.23-alpine

WORKDIR /app
COPY . .
RUN go mod download
RUN CGO_ENABLED=0 go build -o main ./cmd/server

EXPOSE 8080
CMD ["./main"]