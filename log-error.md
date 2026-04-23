1. Perhatikan `Output":"wget: unrecognized option: 0\nBusyBox...`
- Identifikasi logs
```bash
docker inspect --format="{{json .State.Health}}" weather-service
{"Status":"unhealthy","FailingStreak":7,"Log":[{"Start":"2026-04-22T19:56:58.485613707Z","End":"2026-04-22T19:56:58.541334156Z","ExitCode":1,"Output":"wget: unrecognized option: 0\nBusyBox v1.37.0 
```
fix:
- typo pada isi docker compose ["CMD", "wget", "-q0-", "http://localhost:3001/health"]
- fix: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]

2. 
