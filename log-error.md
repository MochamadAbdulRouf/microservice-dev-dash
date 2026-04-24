1. Perhatikan `Output":"wget: unrecognized option: 0\nBusyBox...`
- Identifikasi logs
```bash
docker inspect --format="{{json .State.Health}}" weather-service
{"Status":"unhealthy","FailingStreak":7,"Log":[{"Start":"2026-04-22T19:56:58.485613707Z","End":"2026-04-22T19:56:58.541334156Z","ExitCode":1,"Output":"wget: unrecognized option: 0\nBusyBox v1.37.0 
```
fix:
- typo pada isi docker compose ["CMD", "wget", "-q0-", "http://localhost:3001/health"]
- fix: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]

Perintah Debugging yang Berguna
1. Lihat log service tertentu
```bash
kubectl logs -l app=weather-service --tail=50
```
2. Describe pod jika ada masalah
```bash
kubectl describe pod <pod-name>
```
3. Masuk ke dalam container
```bash
kubectl exec -it <pod-name> -- sh
```
4. Scale up/down service
```bash
kubectl scale deployment weather-service --replicas=3
```
5. Update image tanpa downtime (rolling update)
```bash
kubectl set image deployment/weather-service \
  weather-service=mochabdulrouf/weather-service:v2
```
6. Rollback jika v2 bermasalah
```bash
kubectl rollout undo deployment/weather-service
```