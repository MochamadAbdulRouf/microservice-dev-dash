# Project Microservice Apps Dev Dashboard
![topology](microservice-architecture.png)


kubectl run test-pod --image=curlimages/curl -n app-dev --rm -it --restart=Never -- curl http://api-service:3000/dashboard
